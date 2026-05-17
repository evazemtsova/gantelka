import type { Workout } from '../../types';
import { Screen } from '../../components/ui/Screen';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ScreenFooter } from '../../components/ui/ScreenFooter';
import { ListItem } from '../../components/ui/ListItem';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { EditIcon, TrashIcon } from '../../components/ui/icons';
import { exerciseMeta } from '../../constants/labels';
import './Workouts.css';

export interface WorkoutDetailScreenProps {
  workout: Workout;
  isArchived: boolean;
  onBack: () => void;
  onStart?: () => void;
  onArchive?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function WorkoutDetailScreen({
  workout,
  isArchived,
  onBack,
  onStart,
  onArchive,
  onEdit,
  onDelete,
}: WorkoutDetailScreenProps) {
  const hasSecondaryActions = !isArchived && (onArchive || onEdit || onDelete);

  return (
    <Screen withFooter>
      <div className="workout-detail__content">
        <ScreenHeader title={workout.name} onBack={onBack} />

        {workout.exercises.length > 0 ? (
          <ul className="workout-detail__ex-list">
            {workout.exercises.map((ex, i) => (
              <ListItem
                key={`${ex.id}-${i}`}
                name={ex.name}
                meta={exerciseMeta(ex)}
                arrow={false}
              />
            ))}
          </ul>
        ) : (
          <EmptyState>упражнений нет</EmptyState>
        )}
      </div>

      <ScreenFooter column>
        {!isArchived && onStart && (
          <Button variant="filled" fullWidth onClick={onStart}>
            запустить
          </Button>
        )}

        {isArchived ? (
          onDelete && (
            <Button variant="outlined" flex onClick={onDelete}>
              удалить
            </Button>
          )
        ) : hasSecondaryActions ? (
          <div className="workout-detail__actions">
            {onArchive && (
              <Button variant="outlined" flex onClick={onArchive}>
                убрать в архив
              </Button>
            )}
            {onEdit && <Button iconOnly onClick={onEdit}><EditIcon /></Button>}
            {onDelete && <Button iconOnly onClick={onDelete}><TrashIcon /></Button>}
          </div>
        ) : null}
      </ScreenFooter>
    </Screen>
  );
}
