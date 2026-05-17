import { useState, useRef, useEffect } from 'react';
import type { Exercise, MuscleGroup } from '../types';
import CreateExercise from './CreateExercise';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { ListItem } from '../components/ui/ListItem';
import { Dropdown } from '../components/ui/Dropdown';
import { Button } from '../components/ui/Button';
import { CheckboxRow } from '../components/ui/CheckboxRow';
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  CloseIcon,
  EditIcon,
  AddToWorkoutIcon,
} from '../components/ui/icons';
import './Exercises.css';

// ─── Workout options (mock) ───────────────────────────────────────────────────

interface WorkoutOption {
  id: string;
  name: string;
  date: string;
  exerciseCount: number;
}

const MOCK_WORKOUTS: WorkoutOption[] = [
  { id: 'w1', name: 'День ног ягодицы', date: '24 марта', exerciseCount: 5 },
  { id: 'w2', name: 'День рук',         date: 'нет даты', exerciseCount: 0 },
  { id: 'w3', name: 'День ног квадры',  date: 'нет даты', exerciseCount: 5 },
  { id: 'w4', name: 'День спины',       date: 'нет даты', exerciseCount: 0 },
];

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

const MUSCLE_GROUP_OPTIONS = MUSCLE_GROUPS.map((mg) => ({
  value: mg,
  label: MUSCLE_GROUP_LABELS[mg],
}));

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

// ─── Add to workout screen ────────────────────────────────────────────────────

interface AddToWorkoutScreenProps {
  workouts: WorkoutOption[];
  onBack: () => void;
  onBackToList: () => void;
}

function AddToWorkoutScreen({ workouts, onBack, onBackToList }: AddToWorkoutScreenProps) {
  const [view, setView] = useState<'select' | 'no-workouts' | 'added'>(
    workouts.length > 0 ? 'select' : 'no-workouts'
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  if (view === 'no-workouts') {
    return (
      <div className="add-to-workout">
        <ScreenHeader title="" onBack={onBack} />
        <div className="add-to-workout__center">
          <p className="add-to-workout__promo">нет тренировок</p>
          <p className="add-to-workout__desc">
            у вас пока не создано ни одной тренировки, можете создать новую и добавить туда упражнение
          </p>
        </div>
        <Button variant="filled" fullWidth onClick={onBack}>
          создать тренировку
        </Button>
      </div>
    );
  }

  if (view === 'added') {
    return (
      <div className="add-to-workout">
        <ScreenHeader title="" onBack={onBack} />
        <div className="add-to-workout__center">
          <p className="add-to-workout__promo">добавлено</p>
          <p className="add-to-workout__desc">упражнение добавлено в тренировку</p>
        </div>
        <Button variant="outlined" fullWidth onClick={onBackToList}>
          вернуться в упражнения
        </Button>
      </div>
    );
  }

  return (
    <div className="add-to-workout">
      <div className="add-to-workout__top">
        <ScreenHeader title="добавить в" onBack={onBack} />
        <ul className="add-to-workout__list">
          {workouts.map(w => (
            <CheckboxRow
              key={w.id}
              name={w.name}
              meta={`${w.date} • ${w.exerciseCount} упражнений`}
              checked={selected.has(w.id)}
              onClick={() => toggle(w.id)}
            />
          ))}
        </ul>
      </div>
      <Button variant="filled" fullWidth onClick={() => setView('added')}>
        сохранить изменения
      </Button>
    </div>
  );
}

// ─── Search Screen ────────────────────────────────────────────────────────────

interface SearchScreenProps {
  exercises: Exercise[];
  onBack: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

function SearchScreen({ exercises, onBack, onSelectExercise }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = query.trim()
    ? exercises.filter((ex) => ex.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="search-screen">
      <ScreenHeader title="Найти" onBack={onBack} />

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
              const meta = `${typeLabel}•${muscleLabel}${ex.isCustom ? ' • создано мной' : ''}`;
              return (
                <ListItem
                  key={ex.id}
                  name={ex.name}
                  meta={meta}
                  onClick={() => onSelectExercise(ex)}
                />
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Exercise Detail ──────────────────────────────────────────────────────────

interface ExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
  onEdit: () => void;
  onAddToWorkout: () => void;
}

function ExerciseDetail({ exercise, onBack, onEdit, onAddToWorkout }: ExerciseDetailProps) {
  const typeLabel = EXERCISE_TYPE_LABELS[exercise.exerciseType];
  const muscleLabel = MUSCLE_GROUP_LABELS[exercise.muscleGroup];
  const paramsLabel = EXERCISE_PARAMS_LABELS[exercise.exerciseType];

  return (
    <div className="exercise-detail">
      <div className="exercise-detail__content">
        <ScreenHeader title={exercise.name} onBack={onBack} />

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
        <Button variant="filled" flex icon={<AddToWorkoutIcon />} onClick={onAddToWorkout}>
          добавить в тренировку
        </Button>
        <Button iconOnly onClick={onEdit}><EditIcon /></Button>
      </div>
    </div>
  );
}

// ─── Filters Panel ────────────────────────────────────────────────────────────

interface FiltersProps {
  muscleGroup: MuscleGroup | null;
  onlyCustom: boolean;
  onApply: (muscleGroup: MuscleGroup | null, onlyCustom: boolean) => void;
  onBack: () => void;
}

function FiltersPanel({ muscleGroup, onlyCustom, onApply, onBack }: FiltersProps) {
  const [pendingGroup, setPendingGroup] = useState<MuscleGroup | null>(muscleGroup);
  const [pendingCustom, setPendingCustom] = useState(onlyCustom);

  return (
    <div className="filters">
      <div className="filters__content">
        <ScreenHeader title="Фильтры" onBack={onBack} />

        <div className="filters__field">
          <span className="filters__label">Группа мышц</span>
          <Dropdown
            value={pendingGroup}
            options={MUSCLE_GROUP_OPTIONS}
            placeholder="Выберите группу"
            onChange={(mg) => setPendingGroup(mg)}
          />
        </div>

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

      <div className="filters__actions">
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
      </div>
    </div>
  );
}

// ─── Exercises (main) ─────────────────────────────────────────────────────────

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
  const [showAddToWorkout, setShowAddToWorkout] = useState(false);
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
          setExercises((prev) => prev.map((ex) => (ex.id === editingExercise.id ? updatedWithId : ex)));
          setSelectedExercise(updatedWithId);
          setEditingExercise(null);
        }}
      />
    );
  }

  if (showAddToWorkout && selectedExercise) {
    return (
      <AddToWorkoutScreen
        workouts={MOCK_WORKOUTS}
        onBack={() => setShowAddToWorkout(false)}
        onBackToList={() => {
          setShowAddToWorkout(false);
          setSelectedExercise(null);
          onHideSubPage();
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
          if (!showSearch) onHideSubPage();
        }}
        onEdit={() => setEditingExercise(selectedExercise)}
        onAddToWorkout={() => setShowAddToWorkout(true)}
      />
    );
  }

  if (showSearch) {
    return (
      <SearchScreen
        exercises={exercises}
        onBack={() => { setShowSearch(false); onHideSubPage(); }}
        onSelectExercise={(ex) => setSelectedExercise(ex)}
      />
    );
  }

  if (showCreate) {
    return (
      <CreateExercise
        onBack={() => { setShowCreate(false); onHideSubPage(); }}
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
        onBack={() => { setShowFilters(false); onHideSubPage(); }}
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
          onClick={() => { setShowSearch(true); onShowSubPage(); }}
          aria-label="Поиск упражнений"
        >
          <SearchIcon className="exercises__search-icon" />
          <span className="exercises__search-placeholder">поиск</span>
        </button>
        <button
          className={`exercises__btn${hasActiveFilters ? ' exercises__btn--active-filter' : ''}`}
          aria-label="Фильтры"
          onClick={() => { setShowFilters(true); onShowSubPage(); }}
        >
          <FilterIcon />
        </button>
        <button
          className="exercises__btn exercises__btn--add"
          aria-label="Добавить упражнение"
          onClick={() => { setShowCreate(true); onShowSubPage(); }}
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
              <ListItem
                key={ex.id}
                name={ex.name}
                meta={meta}
                onClick={() => { setSelectedExercise(ex); onShowSubPage(); }}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
}
