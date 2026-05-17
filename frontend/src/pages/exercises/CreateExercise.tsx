import { useState } from 'react';
import type { Exercise, ExerciseType, MuscleGroup } from '../../types';
import { MUSCLE_LABELS_CAP, SELECTABLE_MUSCLE_GROUPS } from '../../constants/labels';
import { Screen } from '../../components/ui/Screen';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ScreenFooter } from '../../components/ui/ScreenFooter';
import { Field } from '../../components/ui/Field';
import { TextField } from '../../components/ui/TextField';
import { Chip } from '../../components/ui/Chip';
import { Dropdown } from '../../components/ui/Dropdown';
import { Button } from '../../components/ui/Button';
import './Exercises.css';

const MUSCLE_GROUP_OPTIONS = SELECTABLE_MUSCLE_GROUPS.map((mg) => ({
  value: mg,
  label: MUSCLE_LABELS_CAP[mg],
}));

const TYPE_PARAMS: Record<ExerciseType, string[]> = {
  strength: ['вес', 'подходы', 'повторения'],
  cardio: ['время', 'дистанция'],
  stretching: ['время', 'подходы'],
};

interface Props {
  onBack: () => void;
  onSave: (exercise: Omit<Exercise, 'id'>) => void;
  initialExercise?: Exercise;
}

export default function CreateExercise({ onBack, onSave, initialExercise }: Props) {
  const [name, setName] = useState(initialExercise?.name ?? '');
  const [type, setType] = useState<ExerciseType | null>(initialExercise?.exerciseType ?? null);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(initialExercise?.muscleGroup ?? null);
  const [selectedParams, setSelectedParams] = useState<string[]>(
    initialExercise ? TYPE_PARAMS[initialExercise.exerciseType] : []
  );
  const [description, setDescription] = useState(initialExercise?.description ?? '');

  function handleTypeSelect(t: ExerciseType) {
    setType(t);
    setSelectedParams(TYPE_PARAMS[t]);
    setMuscleGroup(null);
  }

  function toggleParam(param: string) {
    setSelectedParams((prev) =>
      prev.includes(param) ? prev.filter((p) => p !== param) : [...prev, param]
    );
  }

  function handleSave() {
    if (!name.trim() || !type) return;
    onSave({
      name: name.trim(),
      exerciseType: type,
      muscleGroup: muscleGroup ?? 'core',
      isCustom: initialExercise?.isCustom ?? true,
      description: description.trim() || undefined,
    });
  }

  const TYPE_LABELS: Record<ExerciseType, string> = {
    strength: 'Силовое',
    cardio: 'Кардио',
    stretching: 'Растяжка',
  };

  return (
    <Screen withFooter>
      <div className="create-exercise__content">
        <ScreenHeader title={initialExercise ? 'Изменить' : 'Создать'} onBack={onBack} />

        <Field label="Название">
          <TextField
            value={name}
            onChange={setName}
            placeholder="например: жим лежа"
          />
        </Field>

        <Field label="Тип упражнения">
          <div className="chips-row">
            {(['strength', 'cardio', 'stretching'] as ExerciseType[]).map((t) => (
              <Chip
                key={t}
                selected={type === t}
                onClick={() => handleTypeSelect(t)}
              >
                {TYPE_LABELS[t]}
              </Chip>
            ))}
          </div>
        </Field>

        {type === 'strength' && (
          <Field label="Группа мышц">
            <Dropdown
              value={muscleGroup}
              options={MUSCLE_GROUP_OPTIONS}
              placeholder="Выберите группу"
              onChange={(mg) => setMuscleGroup(mg)}
            />
          </Field>
        )}

        {type && (
          <Field label="Параметры для расчётов">
            <div className="chips-row">
              {TYPE_PARAMS[type].map((param) => (
                <Chip
                  key={param}
                  selected={selectedParams.includes(param)}
                  onClick={() => toggleParam(param)}
                >
                  {param}
                </Chip>
              ))}
            </div>
          </Field>
        )}

        {type && (
          <Field label="Описание" optional="необязательно">
            <TextField
              multiline
              value={description}
              onChange={setDescription}
              placeholder="заметки, техника выполнения"
            />
          </Field>
        )}
      </div>

      <ScreenFooter>
        <Button variant="filled" flex onClick={handleSave}>Сохранить</Button>
        <Button variant="outlined" flex onClick={onBack}>Отменить</Button>
      </ScreenFooter>
    </Screen>
  );
}
