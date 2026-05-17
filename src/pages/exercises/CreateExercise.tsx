import { useState } from 'react';
import type { Exercise, ExerciseType, MuscleGroup } from '../../types';
import { MUSCLE_LABELS_CAP, SELECTABLE_MUSCLE_GROUPS } from '../../constants/labels';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Dropdown } from '../../components/ui/Dropdown';
import { Button } from '../../components/ui/Button';
import './CreateExercise.css';

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

  return (
    <div className="create">
      <div className="create__content">
        <ScreenHeader title={initialExercise ? 'Изменить' : 'Создать'} onBack={onBack} />

        {/* Name */}
        <div className="create__field">
          <span className="create__label">Название</span>
          <input
            className="create__input"
            type="text"
            placeholder="например: жим лежа"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Exercise type */}
        <div className="create__field">
          <span className="create__label">Тип упражнения</span>
          <div className="create__toggles">
            {(['strength', 'cardio', 'stretching'] as ExerciseType[]).map((t) => {
              const labels: Record<ExerciseType, string> = {
                strength: 'Силовое',
                cardio: 'Кардио',
                stretching: 'Растяжка',
              };
              return (
                <button
                  key={t}
                  className={`create__toggle${type === t ? ' create__toggle--selected' : ''}`}
                  onClick={() => handleTypeSelect(t)}
                >
                  {labels[t]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Muscle group — only for strength */}
        {type === 'strength' && (
          <div className="create__field">
            <span className="create__label">Группа мышц</span>
            <Dropdown
              value={muscleGroup}
              options={MUSCLE_GROUP_OPTIONS}
              placeholder="Выберите группу"
              onChange={(mg) => setMuscleGroup(mg)}
            />
          </div>
        )}

        {/* Params */}
        {type && (
          <div className="create__field">
            <span className="create__label">Параметры для расчётов</span>
            <div className="create__toggles">
              {TYPE_PARAMS[type].map((param) => (
                <button
                  key={param}
                  className={`create__toggle${selectedParams.includes(param) ? ' create__toggle--selected' : ''}`}
                  onClick={() => toggleParam(param)}
                >
                  {param}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {type && (
          <div className="create__field">
            <span className="create__label create__label--optional">
              Описание <span>(необязательно)</span>
            </span>
            <textarea
              className="create__textarea"
              placeholder="заметки, техника выполнения"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="create__actions">
        <Button variant="filled" flex onClick={handleSave}>Сохранить</Button>
        <Button variant="outlined" flex onClick={onBack}>Отменить</Button>
      </div>
    </div>
  );
}
