import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  arrayUnion,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { Exercise, ExerciseType, MuscleGroup, Session, SessionExercise, Workout } from '../types';
import { SEED_EXERCISES, SEED_WORKOUTS } from '../data/exercises';

const IS_MOCK = import.meta.env.VITE_DEV_AUTH === 'mock';

// ─── Collection helpers ───────────────────────────────────────────────────────

function getUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  return uid;
}

const userRef     = (uid: string) => doc(db, 'users', uid);
const exercisesCol = (uid: string) => collection(db, 'users', uid, 'exercises');
const workoutsCol  = (uid: string) => collection(db, 'users', uid, 'workouts');
const sessionsCol  = (uid: string) => collection(db, 'users', uid, 'sessions');

// ─── Mappers doc → domain ─────────────────────────────────────────────────────

function docToExercise(id: string, data: DocumentData): Exercise {
  return {
    id,
    name: data.name as string,
    muscleGroup: data.muscleGroup as MuscleGroup,
    exerciseType: data.exerciseType as ExerciseType,
    isCustom: (data.isCustom as boolean | undefined) ?? false,
    description: (data.description as string | null | undefined) ?? undefined,
  };
}

function docToWorkout(id: string, data: DocumentData, exercisesById: Map<string, Exercise>): Workout {
  const exerciseIds: string[] = (data.exerciseIds as string[] | undefined) ?? [];
  return {
    id,
    name: data.name as string,
    date: (data.date as string | null | undefined) ?? '',
    isArchived: (data.isArchived as boolean | undefined) ?? false,
    isTrial: (data.isTrial as boolean | undefined) ?? false,
    exercises: exerciseIds
      .map((eid) => exercisesById.get(eid))
      .filter((e): e is Exercise => e !== undefined),
  };
}

function docToSession(id: string, data: DocumentData): Session {
  return {
    id,
    workoutId: (data.workoutId as string | null | undefined) ?? null,
    workoutName: data.workoutName as string,
    exerciseCount: data.exerciseCount as number,
    nextWorkoutId: (data.nextWorkoutId as string | null | undefined) ?? null,
    nextWorkoutDate: (data.nextWorkoutDate as string | null | undefined) ?? null,
    finishedAt: data.finishedAt as string,
    exercises: (data.exercises as SessionExercise[] | undefined) ?? [],
  };
}

// ─── Mappers domain → doc ─────────────────────────────────────────────────────

function exerciseToDoc(e: Exercise) {
  return {
    name: e.name,
    muscleGroup: e.muscleGroup,
    exerciseType: e.exerciseType,
    isCustom: e.isCustom ?? false,
    description: e.description ?? null,
  };
}

function workoutToDoc(w: Workout) {
  return {
    name: w.name,
    date: w.date || null,
    isArchived: w.isArchived ?? false,
    isTrial: w.isTrial ?? false,
    exerciseIds: w.exercises.map((e) => e.id),
  };
}

function sessionToDoc(s: Session) {
  return {
    workoutId: s.workoutId,
    workoutName: s.workoutName,
    exerciseCount: s.exerciseCount,
    nextWorkoutId: s.nextWorkoutId,
    nextWorkoutDate: s.nextWorkoutDate,
    finishedAt: s.finishedAt,
    exercises: s.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      exerciseType: ex.exerciseType,
      isCustom: ex.isCustom ?? false,
      sets: ex.sets.map((set) => ({ reps: set.reps, weight: set.weight })),
    })),
  };
}

// ─── New user seed ────────────────────────────────────────────────────────────

async function seedNewUser(uid: string): Promise<void> {
  const batch = writeBatch(db);
  batch.set(userRef(uid), { currentWorkoutId: null });
  for (const ex of SEED_EXERCISES) {
    batch.set(doc(exercisesCol(uid), ex.id), exerciseToDoc(ex));
  }
  for (const wk of SEED_WORKOUTS) {
    batch.set(doc(workoutsCol(uid), wk.id), workoutToDoc(wk));
  }
  await batch.commit();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface HydrationData {
  exercises: Exercise[];
  workouts: Workout[];
  sessions: Session[];
  currentWorkoutId: string | null;
}

export async function fetchHydration(): Promise<HydrationData> {
  const uid = getUid();
  const profileSnap = await getDoc(userRef(uid));

  if (!profileSnap.exists()) {
    await seedNewUser(uid);
    return { exercises: SEED_EXERCISES, workouts: SEED_WORKOUTS, sessions: [], currentWorkoutId: null };
  }

  const [exercisesSnap, workoutsSnap, sessionsSnap] = await Promise.all([
    getDocs(exercisesCol(uid)),
    getDocs(workoutsCol(uid)),
    getDocs(query(sessionsCol(uid), orderBy('finishedAt', 'desc'), limit(50))),
  ]);

  const exercises = exercisesSnap.docs.map((d) => docToExercise(d.id, d.data()));
  const exercisesById = new Map(exercises.map((e) => [e.id, e]));
  const workouts = workoutsSnap.docs.map((d) => docToWorkout(d.id, d.data(), exercisesById));
  const sessions = sessionsSnap.docs.map((d) => docToSession(d.id, d.data()));
  const currentWorkoutId = (profileSnap.data()?.currentWorkoutId as string | null | undefined) ?? null;

  return { exercises, workouts, sessions, currentWorkoutId };
}

export async function fetchSessionsPage(beforeIso: string | null, pageLimit: number): Promise<Session[]> {
  const uid = getUid();
  const col = sessionsCol(uid);
  const q = beforeIso
    ? query(col, orderBy('finishedAt', 'desc'), startAfter(beforeIso), limit(pageLimit))
    : query(col, orderBy('finishedAt', 'desc'), limit(pageLimit));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToSession(d.id, d.data()));
}

// ─── Persist (write) ──────────────────────────────────────────────────────────

interface PersistContext {
  userId: string;
  prevState: {
    workouts: Workout[];
    currentWorkoutId: string | null;
  };
}

export type PersistableAction =
  | { type: 'set-current'; id: string | null }
  | { type: 'add-workout'; workout: Workout }
  | { type: 'update-workout'; workout: Workout }
  | { type: 'archive-workout'; id: string }
  | { type: 'unarchive-workout'; id: string }
  | { type: 'delete-workout'; id: string }
  | { type: 'add-exercise'; exercise: Exercise }
  | { type: 'update-exercise'; exercise: Exercise }
  | { type: 'add-exercise-to-workout'; workoutId: string; exercise: Exercise }
  | { type: 'add-session'; session: Session };

export async function persistAction(action: PersistableAction, ctx: PersistContext): Promise<void> {
  if (IS_MOCK) return;
  const { userId, prevState } = ctx;

  switch (action.type) {
    case 'set-current':
      await updateDoc(userRef(userId), { currentWorkoutId: action.id });
      return;

    case 'add-workout':
      await setDoc(doc(workoutsCol(userId), action.workout.id), workoutToDoc(action.workout));
      return;

    case 'update-workout':
      await setDoc(doc(workoutsCol(userId), action.workout.id), workoutToDoc(action.workout));
      return;

    case 'archive-workout':
      await updateDoc(doc(workoutsCol(userId), action.id), { isArchived: true });
      if (prevState.currentWorkoutId === action.id) {
        await updateDoc(userRef(userId), { currentWorkoutId: null });
      }
      return;

    case 'unarchive-workout':
      await updateDoc(doc(workoutsCol(userId), action.id), { isArchived: false });
      return;

    case 'delete-workout':
      await deleteDoc(doc(workoutsCol(userId), action.id));
      return;

    case 'add-exercise':
      await setDoc(doc(exercisesCol(userId), action.exercise.id), exerciseToDoc(action.exercise));
      return;

    case 'update-exercise':
      await updateDoc(doc(exercisesCol(userId), action.exercise.id), exerciseToDoc(action.exercise));
      return;

    case 'add-exercise-to-workout':
      await updateDoc(doc(workoutsCol(userId), action.workoutId), {
        exerciseIds: arrayUnion(action.exercise.id),
      });
      return;

    case 'add-session':
      await setDoc(doc(sessionsCol(userId), action.session.id), sessionToDoc(action.session));
      return;
  }
}
