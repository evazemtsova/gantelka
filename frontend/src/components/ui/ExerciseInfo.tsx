import type { ReactNode } from 'react';
import type { Exercise } from '../../types';
import {
  EXERCISE_PARAMS_LABELS,
  EXERCISE_TYPE_LABELS,
  MUSCLE_LABELS_CAP,
} from '../../constants/labels';
import { Screen } from './Screen';
import { Field } from './Field';
import { ScreenHeader } from './ScreenHeader';
import { ScreenFooter } from './ScreenFooter';
import './ExerciseInfo.css';

interface Props {
  exercise: Exercise;
  onBack: () => void;
  /** Optional action row rendered as a ScreenFooter at the bottom of the screen */
  footer?: ReactNode;
}

export function ExerciseInfo({ exercise, onBack, footer }: Props) {
  const typeLabel = EXERCISE_TYPE_LABELS[exercise.exerciseType];
  const muscleLabel = MUSCLE_LABELS_CAP[exercise.muscleGroup];
  const paramsLabel = EXERCISE_PARAMS_LABELS[exercise.exerciseType];

  return (
    <Screen withFooter={!!footer}>
      <div className="exercise-info__content">
        <ScreenHeader title={exercise.name} onBack={onBack} />

        <div className="exercise-info__fields">
          <Field label="тип упражнения">
            <span className="exercise-info__value">{typeLabel}</span>
          </Field>

          {exercise.exerciseType === 'strength' && (
            <Field label="группа мышц">
              <span className="exercise-info__value">{muscleLabel}</span>
            </Field>
          )}

          <Field label="параметры для расчетов">
            <span className="exercise-info__value">{paramsLabel}</span>
          </Field>

          <Field label="описание" optional="необязательно">
            {exercise.description && (
              <span className="exercise-info__value">{exercise.description}</span>
            )}
          </Field>
        </div>
      </div>

      {footer && <ScreenFooter>{footer}</ScreenFooter>}
    </Screen>
  );
}
