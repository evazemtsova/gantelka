import type { Exercise, ExerciseType, MuscleGroup, Session, Workout } from '../types';
import { supabase } from './supabase';

const IS_MOCK = import.meta.env.VITE_DEV_AUTH === 'mock';

// ─── Row shapes (snake_case как в БД) ─────────────────────────────────────────

interface ExerciseRow {
  id: string;
  user_id: string;
  name: string;
  muscle_group: MuscleGroup;
  exercise_type: ExerciseType;
  is_custom: boolean;
  description: string | null;
  created_at: string;
}

interface WorkoutRow {
  id: string;
  user_id: string;
  name: string;
  date: string | null;
  is_archived: boolean;
  is_trial: boolean;
  created_at: string;
  workout_exercises: Array<{
    position: number;
    exercises: ExerciseRow;
  }>;
}

interface ProfileRow {
  id: string;
  current_workout_id: string | null;
}

interface SessionRow {
  id: string;
  user_id: string;
  workout_id: string | null;
  workout_name: string;
  exercise_count: number;
  next_workout_date: string | null;
  finished_at: string;
}

// ─── Mappers snake → camel ────────────────────────────────────────────────────

function toExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    exerciseType: row.exercise_type,
    isCustom: row.is_custom,
    description: row.description ?? undefined,
  };
}

function toSession(row: SessionRow): Session {
  return {
    id: row.id,
    workoutId: row.workout_id,
    workoutName: row.workout_name,
    exerciseCount: row.exercise_count,
    nextWorkoutDate: row.next_workout_date,
    finishedAt: row.finished_at,
  };
}

function toWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    name: row.name,
    date: row.date ?? '',
    isArchived: row.is_archived,
    isTrial: row.is_trial,
    exercises: row.workout_exercises
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((we) => toExercise(we.exercises)),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface HydrationData {
  exercises: Exercise[];
  workouts: Workout[];
  sessions: Session[];
  currentWorkoutId: string | null;
}

/** Загружает всё, что нужно для старта app: упражнения, тренировки, сессии, current. */
export async function fetchHydration(): Promise<HydrationData> {
  const [exercisesRes, workoutsRes, sessionsRes, profileRes] = await Promise.all([
    supabase.from('exercises').select('*').order('created_at'),
    supabase
      .from('workouts')
      .select('*, workout_exercises(position, exercises(*))')
      .order('created_at'),
    supabase.from('sessions').select('*').order('finished_at', { ascending: false }).limit(50),
    supabase.from('profiles').select('id, current_workout_id').single(),
  ]);

  if (exercisesRes.error) throw exercisesRes.error;
  if (workoutsRes.error) throw workoutsRes.error;
  if (sessionsRes.error) throw sessionsRes.error;
  if (profileRes.error) throw profileRes.error;

  return {
    exercises: (exercisesRes.data as ExerciseRow[]).map(toExercise),
    workouts: (workoutsRes.data as WorkoutRow[]).map(toWorkout),
    sessions: (sessionsRes.data as SessionRow[]).map(toSession),
    currentWorkoutId: (profileRes.data as ProfileRow).current_workout_id,
  };
}

// ─── Persist (write) ──────────────────────────────────────────────────────────

interface PersistContext {
  userId: string;
  /** State до применения action — нужен для add-exercise-to-workout (position) и проверки current. */
  prevState: {
    workouts: Workout[];
    currentWorkoutId: string | null;
  };
}

type PersistableAction =
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

function workoutToRow(w: Workout, userId: string) {
  return {
    id: w.id,
    user_id: userId,
    name: w.name,
    date: w.date || null,
    is_archived: w.isArchived ?? false,
    is_trial: w.isTrial ?? false,
  };
}

function exerciseToRow(e: Exercise, userId: string) {
  return {
    id: e.id,
    user_id: userId,
    name: e.name,
    muscle_group: e.muscleGroup,
    exercise_type: e.exerciseType,
    is_custom: e.isCustom ?? false,
    description: e.description ?? null,
  };
}

async function syncWorkoutExercises(workoutId: string, exercises: Exercise[]) {
  const del = await supabase.from('workout_exercises').delete().eq('workout_id', workoutId);
  if (del.error) throw del.error;
  if (exercises.length === 0) return;
  const rows = exercises.map((ex, i) => ({
    workout_id: workoutId,
    exercise_id: ex.id,
    position: i,
  }));
  const ins = await supabase.from('workout_exercises').insert(rows);
  if (ins.error) throw ins.error;
}

/**
 * Записывает action в Supabase. Возвращает promise; вызывающий
 * (middleware в Provider) ловит ошибки.
 *
 * В mock-режиме сразу возвращает — все мутации остаются локальными.
 */
export async function persistAction(action: PersistableAction, ctx: PersistContext): Promise<void> {
  if (IS_MOCK) return;
  const { userId, prevState } = ctx;

  switch (action.type) {
    case 'set-current': {
      const { error } = await supabase
        .from('profiles')
        .update({ current_workout_id: action.id })
        .eq('id', userId);
      if (error) throw error;
      return;
    }

    case 'add-workout': {
      const { error: e1 } = await supabase.from('workouts').insert(workoutToRow(action.workout, userId));
      if (e1) throw e1;
      if (action.workout.exercises.length > 0) {
        await syncWorkoutExercises(action.workout.id, action.workout.exercises);
      }
      return;
    }

    case 'update-workout': {
      const { error } = await supabase
        .from('workouts')
        .update({
          name: action.workout.name,
          date: action.workout.date || null,
        })
        .eq('id', action.workout.id);
      if (error) throw error;
      await syncWorkoutExercises(action.workout.id, action.workout.exercises);
      return;
    }

    case 'archive-workout': {
      const { error } = await supabase
        .from('workouts')
        .update({ is_archived: true })
        .eq('id', action.id);
      if (error) throw error;
      if (prevState.currentWorkoutId === action.id) {
        await supabase.from('profiles').update({ current_workout_id: null }).eq('id', userId);
      }
      return;
    }

    case 'unarchive-workout': {
      const { error } = await supabase
        .from('workouts')
        .update({ is_archived: false })
        .eq('id', action.id);
      if (error) throw error;
      return;
    }

    case 'delete-workout': {
      const { error } = await supabase.from('workouts').delete().eq('id', action.id);
      if (error) throw error;
      // current_workout_id → null обрабатывает FK on delete set null автоматически
      return;
    }

    case 'add-exercise': {
      const { error } = await supabase.from('exercises').insert(exerciseToRow(action.exercise, userId));
      if (error) throw error;
      return;
    }

    case 'update-exercise': {
      const { error } = await supabase
        .from('exercises')
        .update({
          name: action.exercise.name,
          muscle_group: action.exercise.muscleGroup,
          exercise_type: action.exercise.exerciseType,
          description: action.exercise.description ?? null,
        })
        .eq('id', action.exercise.id);
      if (error) throw error;
      return;
    }

    case 'add-exercise-to-workout': {
      const workout = prevState.workouts.find((w) => w.id === action.workoutId);
      const position = workout?.exercises.length ?? 0;
      const { error } = await supabase.from('workout_exercises').insert({
        workout_id: action.workoutId,
        exercise_id: action.exercise.id,
        position,
      });
      if (error) throw error;
      return;
    }

    case 'add-session': {
      const s = action.session;
      const { error } = await supabase.from('sessions').insert({
        id: s.id,
        user_id: userId,
        workout_id: s.workoutId,
        workout_name: s.workoutName,
        exercise_count: s.exerciseCount,
        next_workout_date: s.nextWorkoutDate,
        finished_at: s.finishedAt,
      });
      if (error) throw error;
      return;
    }
  }
}

export type { PersistableAction };
