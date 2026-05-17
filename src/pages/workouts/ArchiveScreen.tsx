import type { Workout } from '../../types';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ListItem } from '../../components/ui/ListItem';
import './Workouts.css';

export interface ArchiveScreenProps {
  workouts: Workout[];
  onBack: () => void;
  onSelectWorkout: (w: Workout) => void;
}

export function ArchiveScreen({ workouts, onBack, onSelectWorkout }: ArchiveScreenProps) {
  return (
    <div className="workouts-archive">
      <ScreenHeader title="архив" onBack={onBack} />

      {workouts.length === 0 ? (
        <p className="workouts-archive__empty">архив пуст</p>
      ) : (
        <ul className="workouts-archive__list">
          {workouts.map(w => (
            <ListItem
              key={w.id}
              name={w.name}
              meta={`${w.date} • ${w.exercises.length} упражнений`}
              onClick={() => onSelectWorkout(w)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
