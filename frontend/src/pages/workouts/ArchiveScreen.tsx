import type { Workout } from '../../types';
import { Screen } from '../../components/ui/Screen';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ListItem } from '../../components/ui/ListItem';
import { EmptyState } from '../../components/ui/EmptyState';
import './Workouts.css';

export interface ArchiveScreenProps {
  workouts: Workout[];
  onBack: () => void;
  onSelectWorkout: (w: Workout) => void;
}

export function ArchiveScreen({ workouts, onBack, onSelectWorkout }: ArchiveScreenProps) {
  return (
    <Screen>
      <ScreenHeader title="архив" onBack={onBack} />

      {workouts.length === 0 ? (
        <EmptyState>архив пуст</EmptyState>
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
    </Screen>
  );
}
