import { useState, useRef, useEffect } from 'react';
import type { Exercise, MuscleGroup } from '../types';
import CreateExercise from './CreateExercise';
import './Exercises.css';

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: 'Грудь',
  back: 'Спина',
  shoulders: 'Плечи',
  arms: 'Руки',
  legs: 'Ноги',
  glutes: 'Ягодицы',
  core: 'Пресс',
  cardio: 'Кардио',
};

const MUSCLE_GROUPS: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'glutes', 'core'];

const EXERCISE_TYPE_LABELS: Record<string, string> = {
  strength: 'силовое',
  cardio: 'кардио',
  stretching: 'растяжка',
};

const EXERCISE_PARAMS_LABELS: Record<string, string> = {
  strength: 'вес, подходы, повторения',
  cardio: 'время, дистанция',
  stretching: 'время, подходы',
};

const SAMPLE_EXERCISES: Exercise[] = [
  { id: '1', name: 'Жим штанги лёжа', muscleGroup: 'chest', exerciseType: 'strength' },
  { id: '2', name: 'Жим штанги лёжа', muscleGroup: 'chest', exerciseType: 'strength', isCustom: true },
  { id: '3', name: 'Подтягивания', muscleGroup: 'back', exerciseType: 'strength' },
  { id: '4', name: 'Приседания со штангой', muscleGroup: 'legs', exerciseType: 'strength' },
  { id: '5', name: 'Жим гантелей стоя', muscleGroup: 'shoulders', exerciseType: 'strength' },
  { id: '6', name: 'Отжимания', muscleGroup: 'chest', exerciseType: 'strength', isCustom: true },
  { id: '7', name: 'Бег на дорожке', muscleGroup: 'cardio', exerciseType: 'cardio' },
  { id: '8', name: 'Скручивания', muscleGroup: 'core', exerciseType: 'strength' },
  { id: '9', name: 'Выпады', muscleGroup: 'legs', exerciseType: 'strength' },
  { id: '10', name: 'Растяжка спины', muscleGroup: 'back', exerciseType: 'stretching' },
];

const hasCustomExercises = SAMPLE_EXERCISES.some((e) => e.isCustom);

function SearchIcon() {
  return (
    <svg className="exercises__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M2 5h16M5 10h10M8 15h4" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="exercise-item__arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ up }: { up?: boolean }) {
  return (
    <svg
      className={`filters__chevron${up ? ' filters__chevron--up' : ''}`}
      viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
    >
      <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M13.5 3.5l3 3L5 18H2v-3L13.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AddToWorkoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 5h10M3 10h7M3 15h5" strokeLinecap="round" />
      <path d="M15 11v6M12 14h6" strokeLinecap="round" />
    </svg>
  );
}

interface SearchScreenProps {
  exercises: Exercise[];
  onBack: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

function SearchScreen({ exercises, onBack, onSelectExercise }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = query.trim()
    ? exercises.filter((ex) => ex.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="search-screen">
      <div className="search-screen__header">
        <button className="search-screen__back" onClick={onBack} aria-label="Назад">
          <BackIcon />
        </button>
        <h1 className="search-screen__title">Найти</h1>
      </div>

      <div className="search-screen__input-wrap">
        <SearchIcon />
        <input
          ref={inputRef}
          className="search-screen__input"
          type="text"
          placeholder="жим лежа"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-screen__clear" onClick={() => setQuery('')} aria-label="Очистить">
            <CloseIcon />
          </button>
        )}
      </div>

      {query.trim() && (
        <div className="search-screen__results">
          <p className="search-screen__count">найдено ({results.length})</p>
          <ul className="search-screen__list">
            {results.map((ex) => {
              const typeLabel = EXERCISE_TYPE_LABELS[ex.exerciseType];
              const muscleLabel = MUSCLE_GROUP_LABELS[ex.muscleGroup];
              return (
                <li key={ex.id} className="exercise-item" onClick={() => onSelectExercise(ex)}>
                  <div className="exercise-item__info">
                    <span className="exercise-item__name">{ex.name}</span>
                    <span className="exercise-item__meta">
                      {typeLabel}•{muscleLabel}
                      {ex.isCustom && ' • создано мной'}
                    </span>
                  </div>
                  <ArrowIcon />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

interface ExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
  onEdit: () => void;
}

function ExerciseDetail({ exercise, onBack, onEdit }: ExerciseDetailProps) {
  const typeLabel = EXERCISE_TYPE_LABELS[exercise.exerciseType];
  const muscleLabel = MUSCLE_GROUP_LABELS[exercise.muscleGroup];
  const paramsLabel = EXERCISE_PARAMS_LABELS[exercise.exerciseType];

  return (
    <div className="exercise-detail">
      <div className="exercise-detail__content">
        <div className="exercise-detail__header">
          <button className="exercise-detail__back" onClick={onBack} aria-label="Назад">
            <BackIcon />
          </button>
          <h1 className="exercise-detail__title">{exercise.name}</h1>
        </div>

        <div className="exercise-detail__fields">
          <div className="exercise-detail__field">
            <span className="exercise-detail__label">тип упражнения</span>
            <span className="exercise-detail__value">{typeLabel}</span>
          </div>

          {exercise.exerciseType === 'strength' && (
            <div className="exercise-detail__field">
              <span className="exercise-detail__label">группа мышц</span>
              <span className="exercise-detail__value">{muscleLabel}</span>
            </div>
          )}

          <div className="exercise-detail__field">
            <span className="exercise-detail__label">параметры для расчетов</span>
            <span className="exercise-detail__value">{paramsLabel}</span>
          </div>

          <div className="exercise-detail__field">
            <p className="exercise-detail__label">
              описание{' '}
              <span className="exercise-detail__label--muted">(необязательно)</span>
            </p>
            {exercise.description && (
              <span className="exercise-detail__value">{exercise.description}</span>
            )}
          </div>
        </div>
      </div>

      <div className="exercise-detail__actions">
        <button className="exercise-detail__btn-add">
          <AddToWorkoutIcon />
          добавить в тренировку
        </button>
        <button className="exercise-detail__btn-edit" aria-label="Редактировать" onClick={onEdit}>
          <EditIcon />
        </button>
      </div>
    </div>
  );
}

interface FiltersProps {
  muscleGroup: MuscleGroup | null;
  onlyCustom: boolean;
  onApply: (muscleGroup: MuscleGroup | null, onlyCustom: boolean) => void;
  onBack: () => void;
}

function FiltersPanel({ muscleGroup, onlyCustom, onApply, onBack }: FiltersProps) {
  const [pendingGroup, setPendingGroup] = useState<MuscleGroup | null>(muscleGroup);
  const [pendingCustom, setPendingCustom] = useState(onlyCustom);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="filters">
      <div className="filters__content">
        {/* Title */}
        <div className="filters__header">
          <button className="filters__back" onClick={onBack} aria-label="Назад">
            <BackIcon />
          </button>
          <h1 className="filters__title">Фильтры</h1>
        </div>

        {/* Muscle group */}
        <div className="filters__field">
          <span className="filters__label">Группа мышц</span>
          <div className="filters__dropdown-wrap">
            <button
              className="filters__dropdown-trigger"
              onClick={() => setDropdownOpen((o) => !o)}
            >
              <span>{pendingGroup ? MUSCLE_GROUP_LABELS[pendingGroup] : 'Выберите группу'}</span>
              <ChevronIcon up={dropdownOpen} />
            </button>
            {dropdownOpen && (
              <ul className="filters__dropdown-list">
                {MUSCLE_GROUPS.map((mg) => (
                  <li key={mg}>
                    <button
                      className="filters__dropdown-item"
                      onClick={() => {
                        setPendingGroup(mg);
                        setDropdownOpen(false);
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

        {/* Only custom */}
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

      {/* Actions */}
      <div className="filters__actions">
        <button
          className="filters__btn-show"
          onClick={() => onApply(pendingGroup, pendingCustom)}
        >
          Показать
        </button>
        <button
          className="filters__btn-reset"
          onClick={() => {
            setPendingGroup(null);
            setPendingCustom(false);
            onApply(null, false);
          }}
        >
          Сбросить
        </button>
      </div>
    </div>
  );
}

interface ExercisesProps {
  onShowSubPage: () => void;
  onHideSubPage: () => void;
}

export default function Exercises({ onShowSubPage, onHideSubPage }: ExercisesProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>(SAMPLE_EXERCISES);
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<MuscleGroup | null>(null);
  const [onlyCustomFilter, setOnlyCustomFilter] = useState(false);

  const hasActiveFilters = muscleGroupFilter !== null || onlyCustomFilter;

  const filtered = exercises.filter((ex) => {
    if (muscleGroupFilter && ex.muscleGroup !== muscleGroupFilter) return false;
    if (onlyCustomFilter && !ex.isCustom) return false;
    return true;
  });

  if (editingExercise) {
    return (
      <CreateExercise
        initialExercise={editingExercise}
        onBack={() => setEditingExercise(null)}
        onSave={(updated) => {
          const updatedWithId = { ...updated, id: editingExercise.id };
          setExercises((prev) =>
            prev.map((ex) => (ex.id === editingExercise.id ? updatedWithId : ex))
          );
          setSelectedExercise(updatedWithId);
          setEditingExercise(null);
        }}
      />
    );
  }

  if (selectedExercise) {
    return (
      <ExerciseDetail
        exercise={selectedExercise}
        onBack={() => {
          setSelectedExercise(null);
          // If we came from search, stay in sub-page; if from main list, show nav
          if (!showSearch) onHideSubPage();
        }}
        onEdit={() => setEditingExercise(selectedExercise)}
      />
    );
  }

  if (showSearch) {
    return (
      <SearchScreen
        exercises={exercises}
        onBack={() => {
          setShowSearch(false);
          onHideSubPage();
        }}
        onSelectExercise={(ex) => setSelectedExercise(ex)}
      />
    );
  }

  if (showCreate) {
    return (
      <CreateExercise
        onBack={() => {
          setShowCreate(false);
          onHideSubPage();
        }}
        onSave={(ex) => {
          setExercises((prev) => [{ ...ex, id: String(Date.now()) }, ...prev]);
          setShowCreate(false);
          onHideSubPage();
        }}
      />
    );
  }

  if (showFilters) {
    return (
      <FiltersPanel
        muscleGroup={muscleGroupFilter}
        onlyCustom={onlyCustomFilter}
        onBack={() => {
          setShowFilters(false);
          onHideSubPage();
        }}
        onApply={(mg, custom) => {
          setMuscleGroupFilter(mg);
          setOnlyCustomFilter(custom);
          setShowFilters(false);
          onHideSubPage();
        }}
      />
    );
  }

  return (
    <div className="exercises">
      <h1 className="exercises__title">Упражнения</h1>

      <div className="exercises__toolbar">
        <button
          className="exercises__search"
          onClick={() => {
            setShowSearch(true);
            onShowSubPage();
          }}
          aria-label="Поиск упражнений"
        >
          <SearchIcon />
          <span className="exercises__search-placeholder">поиск</span>
        </button>
        <button
          className={`exercises__btn${hasActiveFilters ? ' exercises__btn--active-filter' : ''}`}
          aria-label="Фильтры"
          onClick={() => {
            setShowFilters(true);
            onShowSubPage();
          }}
        >
          <FilterIcon />
        </button>
        <button
          className="exercises__btn exercises__btn--add"
          aria-label="Добавить упражнение"
          onClick={() => {
            setShowCreate(true);
            onShowSubPage();
          }}
        >
          <PlusIcon />
        </button>
      </div>

      <div>
        <p className="exercises__section-title">
          {muscleGroupFilter
            ? `${MUSCLE_GROUP_LABELS[muscleGroupFilter]} (${filtered.length})`
            : `Все упражнения (${exercises.length})`}
        </p>
        <ul className="exercises__list">
          {filtered.map((ex) => {
            const typeLabel = EXERCISE_TYPE_LABELS[ex.exerciseType];
            const muscleLabel = MUSCLE_GROUP_LABELS[ex.muscleGroup];
            const meta = ex.isCustom
              ? `${typeLabel}•${muscleLabel} • создано мной`
              : `${typeLabel}•${muscleLabel}`;

            return (
              <li
                key={ex.id}
                className="exercise-item"
                onClick={() => {
                  setSelectedExercise(ex);
                  onShowSubPage();
                }}
              >
                <div className="exercise-item__info">
                  <span className="exercise-item__name">{ex.name}</span>
                  <span className={`exercise-item__meta${ex.isCustom ? ' exercise-item__meta--custom' : ''}`}>
                    {meta}
                  </span>
                </div>
                <ArrowIcon />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
