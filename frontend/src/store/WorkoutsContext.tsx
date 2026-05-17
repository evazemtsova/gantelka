import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Exercise, Workout } from '../types';
import { SEED_EXERCISES, SEED_WORKOUTS } from '../data/exercises';

interface State {
  exercises: Exercise[];
  workouts: Workout[];
  currentWorkoutId: string | null;
}

type Action =
  | { type: 'set-current'; id: string | null }
  | { type: 'add-workout'; workout: Workout }
  | { type: 'update-workout'; workout: Workout }
  | { type: 'archive-workout'; id: string }
  | { type: 'unarchive-workout'; id: string }
  | { type: 'delete-workout'; id: string }
  | { type: 'add-exercise'; exercise: Exercise }
  | { type: 'update-exercise'; exercise: Exercise }
  | { type: 'add-exercise-to-workout'; workoutId: string; exercise: Exercise };

const initialState: State = {
  exercises: SEED_EXERCISES,
  workouts: SEED_WORKOUTS,
  currentWorkoutId: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
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

    default:
      return state;
  }
}

interface Ctx {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const WorkoutsContext = createContext<Ctx | null>(null);

export function WorkoutsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
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
