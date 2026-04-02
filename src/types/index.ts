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

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  reps?: number;
  weight?: number;
  duration?: number; // seconds
  restTime?: number; // seconds
}

export interface Workout {
  id: string;
  title: string;
  date: string; // ISO date string
  sets: WorkoutSet[];
  notes?: string;
  durationMinutes?: number;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weightKg?: number;
  bodyFatPct?: number;
  notes?: string;
}
