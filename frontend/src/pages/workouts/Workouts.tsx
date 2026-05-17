import { useState } from 'react';
import type { Workout } from '../../types';
import { ListItem } from '../../components/ui/ListItem';
import { Button } from '../../components/ui/Button';
import { PlusIcon } from '../../components/ui/icons';
import {
  useWorkouts,
  useActiveWorkouts,
  useArchivedWorkouts,
} from '../../store/WorkoutsContext';
import { ArchiveScreen } from './ArchiveScreen';
import { CreateWorkoutScreen } from './CreateWorkout';
import { WorkoutDetailScreen } from './WorkoutDetail';
import './Workouts.css';

type View =
  | 'list'
  | 'archive'
  | 'create'
  | 'edit'
  | 'detail-active'
  | 'detail-archived';

interface WorkoutsProps {
  onShowSubPage: () => void;
  onHideSubPage: () => void;
  onStartSession?: (workoutId: string) => void;
}

export default function Workouts({ onShowSubPage, onHideSubPage, onStartSession }: WorkoutsProps) {
  const { dispatch } = useWorkouts();
  const activeWorkouts = useActiveWorkouts();
  const archivedWorkouts = useArchivedWorkouts();

  const [view, setView] = useState<View>('list');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  function goSub(v: View) {
    setView(v);
    onShowSubPage();
  }

  function backToList() {
    setView('list');
    setSelectedWorkout(null);
    setEditingWorkout(null);
    onHideSubPage();
  }

  function backToArchive() {
    setView('archive');
    setSelectedWorkout(null);
  }

  if (view === 'archive') {
    return (
      <ArchiveScreen
        workouts={archivedWorkouts}
        onBack={backToList}
        onSelectWorkout={w => { setSelectedWorkout(w); setView('detail-archived'); }}
      />
    );
  }

  if (view === 'create') {
    return (
      <CreateWorkoutScreen
        onBack={backToList}
        onSave={w => {
          dispatch({ type: 'add-workout', workout: w });
          backToList();
        }}
      />
    );
  }

  if (view === 'edit' && editingWorkout) {
    return (
      <CreateWorkoutScreen
        initial={editingWorkout}
        onBack={() => setView('detail-active')}
        onSave={updated => {
          dispatch({ type: 'update-workout', workout: updated });
          setSelectedWorkout(updated);
          setView('detail-active');
        }}
      />
    );
  }

  if (view === 'detail-active' && selectedWorkout) {
    const isTrial = selectedWorkout.isTrial === true;
    return (
      <WorkoutDetailScreen
        workout={selectedWorkout}
        isArchived={false}
        onBack={backToList}
        onStart={onStartSession ? () => onStartSession(selectedWorkout.id) : undefined}
        onArchive={isTrial ? undefined : () => {
          dispatch({ type: 'archive-workout', id: selectedWorkout.id });
          backToList();
        }}
        onEdit={isTrial ? undefined : () => { setEditingWorkout(selectedWorkout); setView('edit'); }}
        onDelete={isTrial ? undefined : () => {
          dispatch({ type: 'delete-workout', id: selectedWorkout.id });
          backToList();
        }}
      />
    );
  }

  if (view === 'detail-archived' && selectedWorkout) {
    return (
      <WorkoutDetailScreen
        workout={selectedWorkout}
        isArchived={true}
        onBack={backToArchive}
        onDelete={() => {
          dispatch({ type: 'delete-workout', id: selectedWorkout.id });
          backToArchive();
        }}
      />
    );
  }

  if (activeWorkouts.length === 0) {
    return (
      <div className="workouts">
        <h1 className="workouts__title">тренировки</h1>
        <Button variant="filled" fullWidth icon={<PlusIcon />} onClick={() => goSub('create')}>
          создать тренировку
        </Button>
      </div>
    );
  }

  return (
    <div className="workouts">
      <h1 className="workouts__title">тренировки</h1>

      <div className="workouts__actions">
        <Button onClick={() => goSub('archive')}>архив</Button>
        <Button variant="filled" flex onClick={() => goSub('create')}>
          + создать
        </Button>
      </div>

      <div className="workouts__section">
        <p className="workouts__section-title">
          активные тренировки ({activeWorkouts.length})
        </p>
        <ul className="workouts__list">
          {activeWorkouts.map(w => (
            <ListItem
              key={w.id}
              name={w.name}
              meta={`${w.date} • ${w.exercises.length} упражнений`}
              onClick={() => { setSelectedWorkout(w); goSub('detail-active'); }}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
