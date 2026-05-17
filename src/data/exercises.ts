import type { Exercise, Workout } from '../types';

/** Единый seed упражнений. Используется как стартовое состояние стора. */
export const SEED_EXERCISES: Exercise[] = [
  // Chest
  { id: 'ex-bench-press', name: 'Жим штанги лёжа', muscleGroup: 'chest', exerciseType: 'strength' },
  { id: 'ex-bench-press-custom', name: 'Жим штанги лёжа', muscleGroup: 'chest', exerciseType: 'strength', isCustom: true },
  { id: 'ex-pushups', name: 'Отжимания', muscleGroup: 'chest', exerciseType: 'strength', isCustom: true },

  // Back
  { id: 'ex-pullups', name: 'Подтягивания', muscleGroup: 'back', exerciseType: 'strength' },
  { id: 'ex-back-stretch', name: 'Растяжка спины', muscleGroup: 'back', exerciseType: 'stretching' },

  // Shoulders
  { id: 'ex-dumbbell-press', name: 'Жим гантелей стоя', muscleGroup: 'shoulders', exerciseType: 'strength' },

  // Legs
  { id: 'ex-barbell-squat', name: 'Приседания со штангой', muscleGroup: 'legs', exerciseType: 'strength' },
  { id: 'ex-squat', name: 'Приседания', muscleGroup: 'legs', exerciseType: 'strength' },
  { id: 'ex-lunges', name: 'Выпады', muscleGroup: 'legs', exerciseType: 'strength' },

  // Glutes
  { id: 'ex-ladder', name: 'Лестница', muscleGroup: 'glutes', exerciseType: 'cardio', isCustom: true },
  { id: 'ex-bridge', name: 'Мост', muscleGroup: 'glutes', exerciseType: 'strength' },
  { id: 'ex-bulgarian', name: 'Болгарские приседы', muscleGroup: 'glutes', exerciseType: 'strength', isCustom: true, description: 'лучше делать с зеленой резинкой' },
  { id: 'ex-leg-abduction', name: 'Отведение ног', muscleGroup: 'glutes', exerciseType: 'cardio' },
  { id: 'ex-leg-spread', name: 'Разведение ног', muscleGroup: 'glutes', exerciseType: 'cardio' },
  { id: 'ex-treadmill-walk', name: 'Ходьба на дорожке', muscleGroup: 'glutes', exerciseType: 'cardio', isCustom: true },

  // Core
  { id: 'ex-crunches', name: 'Скручивания', muscleGroup: 'core', exerciseType: 'strength' },

  // Cardio
  { id: 'ex-treadmill-run', name: 'Бег на дорожке', muscleGroup: 'cardio', exerciseType: 'cardio' },
];

const exerciseById = (id: string): Exercise => {
  const ex = SEED_EXERCISES.find((e) => e.id === id);
  if (!ex) throw new Error(`seed: exercise "${id}" not found`);
  return ex;
};

const GLUTES_SET = ['ex-ladder', 'ex-bridge', 'ex-bulgarian', 'ex-leg-abduction', 'ex-leg-spread'].map(exerciseById);

/** Стартовые тренировки (пробные — для новичка). */
export const SEED_WORKOUTS: Workout[] = [
  { id: 'w1', name: 'День ног ягодицы пробная', date: '24 марта', exercises: GLUTES_SET, isTrial: true },
  { id: 'w2', name: 'День рук пробная',         date: 'нет даты', exercises: [],         isTrial: true },
  { id: 'w3', name: 'День ног квадры пробная',  date: 'нет даты', exercises: GLUTES_SET, isTrial: true },
  { id: 'w4', name: 'День спины пробная',       date: 'нет даты', exercises: [],         isTrial: true },
];
