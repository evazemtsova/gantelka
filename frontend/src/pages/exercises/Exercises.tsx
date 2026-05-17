import { useState } from 'react';
import type { Exercise, MuscleGroup } from '../../types';
import CreateExercise from './CreateExercise';
import { Screen } from '../../components/ui/Screen';
import { ListItem } from '../../components/ui/ListItem';
import { SearchField } from '../../components/ui/SearchField';
import { Button } from '../../components/ui/Button';
import { AddToWorkoutScreen } from './AddToWorkoutScreen';
import { SearchScreen } from './SearchScreen';
import { ExerciseDetail } from './ExerciseDetail';
import { FiltersPanel } from './FiltersPanel';
import {
  useWorkouts,
  useActiveWorkouts,
  useExercises,
} from '../../store/WorkoutsContext';
import {
  EXERCISE_TYPE_LABELS,
  MUSCLE_LABELS_CAP,
} from '../../constants/labels';
import {
  FilterIcon,
  PlusIcon,
} from '../../components/ui/icons';
import './Exercises.css';

interface ExercisesProps {
  onShowSubPage: () => void;
  onHideSubPage: () => void;
}

export default function Exercises({ onShowSubPage, onHideSubPage }: ExercisesProps) {
  const { dispatch } = useWorkouts();
  const exercises = useExercises();
  const activeWorkouts = useActiveWorkouts();
  const hasCustomExercises = exercises.some((e) => e.isCustom);

  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [showAddToWorkout, setShowAddToWorkout] = useState(false);
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
          dispatch({ type: 'update-exercise', exercise: updatedWithId });
          setSelectedExercise(updatedWithId);
          setEditingExercise(null);
        }}
      />
    );
  }

  if (showAddToWorkout && selectedExercise) {
    return (
      <AddToWorkoutScreen
        workouts={activeWorkouts}
        exercise={selectedExercise}
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
          dispatch({ type: 'add-exercise', exercise: { ...ex, id: crypto.randomUUID() } });
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
        hasCustomExercises={hasCustomExercises}
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
    <Screen>
      <h1 className="t-h1">Упражнения</h1>

      <div className="exercises__toolbar">
        <SearchField
          onClick={() => { setShowSearch(true); onShowSubPage(); }}
          placeholder="поиск"
        />
        <Button
          iconOnly
          variant={hasActiveFilters ? 'filled' : 'outlined'}
          aria-label="Фильтры"
          onClick={() => { setShowFilters(true); onShowSubPage(); }}
        >
          <FilterIcon />
        </Button>
        <Button
          iconOnly
          variant="filled"
          aria-label="Добавить упражнение"
          onClick={() => { setShowCreate(true); onShowSubPage(); }}
        >
          <PlusIcon />
        </Button>
      </div>

      <div>
        <p className="t-h2 exercises__section-title">
          {muscleGroupFilter
            ? `${MUSCLE_LABELS_CAP[muscleGroupFilter]} (${filtered.length})`
            : `Все упражнения (${exercises.length})`}
        </p>
        <ul className="exercises__list">
          {filtered.map((ex) => {
            const typeLabel = EXERCISE_TYPE_LABELS[ex.exerciseType];
            const muscleLabel = MUSCLE_LABELS_CAP[ex.muscleGroup];
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
    </Screen>
  );
}
