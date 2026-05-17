import { useState } from 'react';
import type { Exercise, Workout } from '../../types';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { CheckboxRow } from '../../components/ui/CheckboxRow';
import { useWorkouts } from '../../store/WorkoutsContext';
import './Exercises.css';

export interface AddToWorkoutScreenProps {
  workouts: Workout[];
  exercise: Exercise;
  onBack: () => void;
  onBackToList: () => void;
}

export function AddToWorkoutScreen({ workouts, exercise, onBack, onBackToList }: AddToWorkoutScreenProps) {
  const { dispatch } = useWorkouts();
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

  function handleSave() {
    selected.forEach((workoutId) => {
      dispatch({ type: 'add-exercise-to-workout', workoutId, exercise });
    });
    setView('added');
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
              meta={`${w.date} • ${w.exercises.length} упражнений`}
              checked={selected.has(w.id)}
              onClick={() => toggle(w.id)}
            />
          ))}
        </ul>
      </div>
      <Button variant="filled" fullWidth onClick={handleSave}>
        сохранить изменения
      </Button>
    </div>
  );
}
