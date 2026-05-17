import type { Exercise, ExerciseType, MuscleGroup } from '../types';

/** Группы мышц с заглавной — для UI-карточек, дропдаунов, фильтров. */
export const MUSCLE_LABELS_CAP: Record<MuscleGroup, string> = {
  chest: 'Грудь',
  back: 'Спина',
  shoulders: 'Плечи',
  arms: 'Руки',
  legs: 'Ноги',
  glutes: 'Ягодицы',
  core: 'Пресс',
  cardio: 'Кардио',
};

/** Группы мышц строчными — для meta-подписей в списках. */
export const MUSCLE_LABELS_LOWER: Record<MuscleGroup, string> = {
  chest: 'грудь',
  back: 'спина',
  shoulders: 'плечи',
  arms: 'руки',
  legs: 'ноги',
  glutes: 'ягодицы',
  core: 'пресс',
  cardio: 'кардио',
};

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  strength: 'силовое',
  cardio: 'кардио',
  stretching: 'растяжка',
};

export const EXERCISE_PARAMS_LABELS: Record<ExerciseType, string> = {
  strength: 'вес, подходы, повторения',
  cardio: 'время, дистанция',
  stretching: 'время, подходы',
};

/** Группы для UI-выбора (без cardio — это отдельный тип). */
export const SELECTABLE_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'glutes',
  'core',
];

/** Стандартная meta-подпись для упражнения в списках. */
export function exerciseMeta(ex: Exercise): string {
  const parts = [
    EXERCISE_TYPE_LABELS[ex.exerciseType],
    MUSCLE_LABELS_LOWER[ex.muscleGroup],
  ];
  if (ex.isCustom) parts.push('создано мной');
  return parts.join(' • ');
}
