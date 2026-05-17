import type { Exercise } from '../../types';
import {
  EXERCISE_PARAMS_LABELS,
  EXERCISE_TYPE_LABELS,
  MUSCLE_LABELS_CAP,
} from '../../constants/labels';
import { ScreenHeader } from './ScreenHeader';
import './ExerciseInfo.css';

interface Props {
  exercise: Exercise;
  onBack: () => void;
}

export function ExerciseInfo({ exercise, onBack }: Props) {
  const typeLabel = EXERCISE_TYPE_LABELS[exercise.exerciseType];
  const muscleLabel = MUSCLE_LABELS_CAP[exercise.muscleGroup];
  const paramsLabel = EXERCISE_PARAMS_LABELS[exercise.exerciseType];

  return (
    <div className="exercise-info">
      <ScreenHeader title={exercise.name} onBack={onBack} />

      <div className="exercise-info__fields">
        <div className="exercise-info__field">
          <span className="exercise-info__label">тип упражнения</span>
          <span className="exercise-info__value">{typeLabel}</span>
        </div>

        {exercise.exerciseType === 'strength' && (
          <div className="exercise-info__field">
            <span className="exercise-info__label">группа мышц</span>
            <span className="exercise-info__value">{muscleLabel}</span>
          </div>
        )}

        <div className="exercise-info__field">
          <span className="exercise-info__label">параметры для расчетов</span>
          <span className="exercise-info__value">{paramsLabel}</span>
        </div>

        <div className="exercise-info__field">
          <p className="exercise-info__label">
            описание{' '}
            <span className="exercise-info__label--muted">(необязательно)</span>
          </p>
          {exercise.description && (
            <span className="exercise-info__value">{exercise.description}</span>
          )}
        </div>
      </div>
    </div>
  );
}
