export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio';

export type ExerciseType = 'strength' | 'cardio' | 'stretching';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  exerciseType: ExerciseType;
  isCustom?: boolean;
  description?: string;
}

/** Подход внутри сессии. Значения строковые — это форма ввода. */
export interface WorkoutSet {
  id: string;
  reps: string;
  weight: string;
}

/** Тренировка — единая модель для списка, архива и сплита. */
export interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  isArchived?: boolean;
  isTrial?: boolean;
}

/** Завершённая тренировка — запись в истории. */
export interface Session {
  id: string;
  workoutId: string | null;       // null если шаблон удалён
  workoutName: string;            // снимок имени на момент завершения
  exerciseCount: number;
  nextWorkoutDate: string | null;
  finishedAt: string;             // ISO
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weightKg?: number;
  bodyFatPct?: number;
  notes?: string;
}
