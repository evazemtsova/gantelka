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

/** Подход в снимке истории. null = поле не введено пользователем. */
export interface SessionSet {
  reps: number | null;
  weight: number | null;
}

/** Упражнение в снимке истории — статичный снимок имени/группы. */
export interface SessionExercise {
  id: string;                     // ссылка на exercise.id (может быть удалён к моменту чтения)
  name: string;
  muscleGroup: MuscleGroup;
  exerciseType: ExerciseType;
  isCustom?: boolean;
  sets: SessionSet[];
}

/** Завершённая тренировка — запись в истории. */
export interface Session {
  id: string;
  workoutId: string | null;       // null если шаблон удалён
  workoutName: string;            // снимок имени на момент завершения
  exerciseCount: number;
  nextWorkoutId: string | null;   // ID следующей запланированной (null если шаблон удалён)
  nextWorkoutDate: string | null;
  finishedAt: string;             // ISO
  exercises: SessionExercise[];   // снимок выполненных упражнений с подходами
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weightKg?: number;
  bodyFatPct?: number;
  notes?: string;
}
