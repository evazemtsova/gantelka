import { useState } from 'react';
import type { MuscleGroup } from '../../types';
import { Screen } from '../../components/ui/Screen';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ScreenFooter } from '../../components/ui/ScreenFooter';
import { Field } from '../../components/ui/Field';
import { Dropdown } from '../../components/ui/Dropdown';
import { Button } from '../../components/ui/Button';
import { MUSCLE_LABELS_CAP, SELECTABLE_MUSCLE_GROUPS } from '../../constants/labels';
import './Exercises.css';

const MUSCLE_GROUP_OPTIONS = SELECTABLE_MUSCLE_GROUPS.map((mg) => ({
  value: mg,
  label: MUSCLE_LABELS_CAP[mg],
}));

export interface FiltersProps {
  muscleGroup: MuscleGroup | null;
  onlyCustom: boolean;
  hasCustomExercises: boolean;
  onApply: (muscleGroup: MuscleGroup | null, onlyCustom: boolean) => void;
  onBack: () => void;
}

export function FiltersPanel({ muscleGroup, onlyCustom, hasCustomExercises, onApply, onBack }: FiltersProps) {
  const [pendingGroup, setPendingGroup] = useState<MuscleGroup | null>(muscleGroup);
  const [pendingCustom, setPendingCustom] = useState(onlyCustom);

  return (
    <Screen withFooter>
      <div className="filters__content">
        <ScreenHeader title="Фильтры" onBack={onBack} />

        <Field label="Группа мышц">
          <Dropdown
            value={pendingGroup}
            options={MUSCLE_GROUP_OPTIONS}
            placeholder="Выберите группу"
            onChange={(mg) => setPendingGroup(mg)}
          />
        </Field>

        {hasCustomExercises && (
          <label className="filters__checkbox-row">
            <span className={`filters__checkbox${pendingCustom ? ' filters__checkbox--checked' : ''}`}>
              {pendingCustom && (
                <svg viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M1 6l5 5L15 1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <input
              type="checkbox"
              checked={pendingCustom}
              onChange={(e) => setPendingCustom(e.target.checked)}
            />
            <span className="filters__checkbox-label">Созданные мной</span>
          </label>
        )}
      </div>

      <ScreenFooter>
        <Button variant="filled" flex onClick={() => onApply(pendingGroup, pendingCustom)}>
          Показать
        </Button>
        <Button
          variant="outlined"
          flex
          onClick={() => { setPendingGroup(null); setPendingCustom(false); onApply(null, false); }}
        >
          Сбросить
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
