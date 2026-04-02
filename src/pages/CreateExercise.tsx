import { useState } from 'react';
import type { Exercise, ExerciseType, MuscleGroup } from '../types';
import './CreateExercise.css';

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: 'Грудь',
  back: 'Спина',
  shoulders: 'Плечи',
  arms: 'Руки',
  legs: 'Ноги',
  glutes: 'Ягодицы',
  core: 'Пресс',
};

const MUSCLE_GROUPS: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'glutes', 'core'];

const TYPE_PARAMS: Record<ExerciseType, string[]> = {
  strength: ['вес', 'подходы', 'повторения'],
  cardio: ['время', 'дистанция'],
  stretching: ['время', 'подходы'],
};

function BackIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ up }: { up?: boolean }) {
  return (
    <svg
      className={`create__dropdown-chevron${up ? ' create__dropdown-chevron--up' : ''}`}
      viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
    >
      <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Props {
  onBack: () => void;
  onSave: (exercise: Omit<Exercise, 'id'>) => void;
  initialExercise?: Exercise;
}

export default function CreateExercise({ onBack, onSave, initialExercise }: Props) {
  const [name, setName] = useState(initialExercise?.name ?? '');
  const [type, setType] = useState<ExerciseType | null>(initialExercise?.exerciseType ?? null);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(initialExercise?.muscleGroup ?? null);
  const [muscleDropdownOpen, setMuscleDropdownOpen] = useState(false);
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
        {/* Header */}
        <div className="create__header">
          <button className="create__back" onClick={onBack} aria-label="Назад">
            <BackIcon />
          </button>
          <h1 className="create__title">{initialExercise ? 'Изменить' : 'Создать'}</h1>
        </div>

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
            <div className="create__dropdown-wrap">
              <button
                className="create__dropdown-trigger"
                onClick={() => setMuscleDropdownOpen((o) => !o)}
              >
                <span>{muscleGroup ? MUSCLE_GROUP_LABELS[muscleGroup] : 'Выберите группу'}</span>
                <ChevronIcon up={muscleDropdownOpen} />
              </button>
              {muscleDropdownOpen && (
                <ul className="create__dropdown-list">
                  {MUSCLE_GROUPS.map((mg) => (
                    <li key={mg}>
                      <button
                        className="create__dropdown-item"
                        onClick={() => {
                          setMuscleGroup(mg);
                          setMuscleDropdownOpen(false);
                        }}
                      >
                        {MUSCLE_GROUP_LABELS[mg]}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
        <button className="create__btn-save" onClick={handleSave}>
          Сохранить
        </button>
        <button className="create__btn-cancel" onClick={onBack}>
          Отменить
        </button>
      </div>
    </div>
  );
}
