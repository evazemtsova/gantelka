import { createContext, useCallback, useContext, useReducer, useRef, type ReactNode } from 'react';
import type { Exercise, Session, Workout } from '../types';
import { SEED_EXERCISES, SEED_WORKOUTS } from '../data/exercises';
import { persistAction, type PersistableAction } from '../lib/queries';
import { useSession } from '../lib/auth';

const IS_MOCK = import.meta.env.VITE_DEV_AUTH === 'mock';

interface State {
  exercises: Exercise[];
  workouts: Workout[];
  sessions: Session[];
  currentWorkoutId: string | null;
  hydrated: boolean;
}

type Action =
  | { type: 'hydrate'; exercises: Exercise[]; workouts: Workout[]; sessions: Session[]; currentWorkoutId: string | null }
  | { type: 'reset' }
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

// В mock-режиме сразу наполняем seed'ом и считаем гидратированным.
// В реальном режиме ждём fetch из Supabase (Layout дёргает hydrate-action).
const initialState: State = IS_MOCK
  ? { exercises: SEED_EXERCISES, workouts: SEED_WORKOUTS, sessions: [], currentWorkoutId: null, hydrated: true }
  : { exercises: [], workouts: [], sessions: [], currentWorkoutId: null, hydrated: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return {
        exercises: action.exercises,
        workouts: action.workouts,
        sessions: action.sessions,
        currentWorkoutId: action.currentWorkoutId,
        hydrated: true,
      };

    case 'reset':
      return IS_MOCK
        ? { exercises: SEED_EXERCISES, workouts: SEED_WORKOUTS, sessions: [], currentWorkoutId: null, hydrated: true }
        : { exercises: [], workouts: [], sessions: [], currentWorkoutId: null, hydrated: false };

    case 'set-current':
      return { ...state, currentWorkoutId: action.id };

    case 'add-workout':
      return { ...state, workouts: [...state.workouts, action.workout] };

    case 'update-workout':
      return {
        ...state,
        workouts: state.workouts.map((w) =>
          w.id === action.workout.id ? action.workout : w,
        ),
      };

    case 'archive-workout':
      return {
        ...state,
        workouts: state.workouts.map((w) =>
          w.id === action.id ? { ...w, isArchived: true } : w,
        ),
        currentWorkoutId: state.currentWorkoutId === action.id ? null : state.currentWorkoutId,
      };

    case 'unarchive-workout':
      return {
        ...state,
        workouts: state.workouts.map((w) =>
          w.id === action.id ? { ...w, isArchived: false } : w,
        ),
      };

    case 'delete-workout':
      return {
        ...state,
        workouts: state.workouts.filter((w) => w.id !== action.id),
        currentWorkoutId: state.currentWorkoutId === action.id ? null : state.currentWorkoutId,
      };

    case 'add-exercise':
      return { ...state, exercises: [...state.exercises, action.exercise] };

    case 'update-exercise':
      return {
        ...state,
        exercises: state.exercises.map((e) =>
          e.id === action.exercise.id ? action.exercise : e,
        ),
      };

    case 'add-exercise-to-workout':
      return {
        ...state,
        workouts: state.workouts.map((w) =>
          w.id === action.workoutId
            ? { ...w, exercises: [...w.exercises, action.exercise] }
            : w,
        ),
      };

    case 'add-session':
      return { ...state, sessions: [action.session, ...state.sessions] };

    default:
      return state;
  }
}

interface Ctx {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const WorkoutsContext = createContext<Ctx | null>(null);

function isPersistable(action: Action): action is PersistableAction {
  return action.type !== 'hydrate' && action.type !== 'reset';
}

export function WorkoutsProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, initialState);
  const { session } = useSession();
  const userId = session?.user?.id ?? null;

  // refs нужны чтобы persistAction видел user/state в момент вызова без
  // пересоздания dispatch на каждый ререндер.
  const userIdRef = useRef(userId);
  userIdRef.current = userId;
  const stateRef = useRef(state);
  stateRef.current = state;

  const dispatch = useCallback((action: Action) => {
    rawDispatch(action);
    if (IS_MOCK) return;
    if (!isPersistable(action)) return;
    const uid = userIdRef.current;
    if (!uid) return;
    const prev = stateRef.current;
    persistAction(action, {
      userId: uid,
      prevState: { workouts: prev.workouts, currentWorkoutId: prev.currentWorkoutId },
    }).catch((err: unknown) => {
      console.error('persistAction failed', action.type, err);
      // TODO Phase 4: rollback + user-visible toast
    });
  }, []);

  return (
    <WorkoutsContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkoutsContext.Provider>
  );
}

export function useWorkouts() {
  const ctx = useContext(WorkoutsContext);
  if (!ctx) throw new Error('useWorkouts must be used inside WorkoutsProvider');
  return ctx;
}

/** Селекторы — избегают чтения всего state там, где нужны производные. */
export function useActiveWorkouts(): Workout[] {
  const { state } = useWorkouts();
  return state.workouts.filter((w) => !w.isArchived);
}

export function useArchivedWorkouts(): Workout[] {
  const { state } = useWorkouts();
  return state.workouts.filter((w) => w.isArchived);
}

export function useCurrentWorkout(): Workout | null {
  const { state } = useWorkouts();
  if (!state.currentWorkoutId) return null;
  return state.workouts.find((w) => w.id === state.currentWorkoutId) ?? null;
}

export function useExercises(): Exercise[] {
  const { state } = useWorkouts();
  return state.exercises;
}

/** Сессии отсортированы по finishedAt desc (свежие сверху). */
export function useSessions(): Session[] {
  const { state } = useWorkouts();
  return state.sessions;
}
