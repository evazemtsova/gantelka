import type { Workout } from '../../types';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ListItem } from '../../components/ui/ListItem';
import { Button } from '../../components/ui/Button';
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
    <div className="workout-detail">
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
          <p className="workout-detail__empty">упражнений нет</p>
        )}
      </div>

      <div className="workout-detail__actions-stack">
        {!isArchived && onStart && (
          <Button variant="filled" fullWidth onClick={onStart}>
            запустить
          </Button>
        )}

        {isArchived ? (
          onDelete && (
            <div className="workout-detail__actions">
              <Button variant="outlined" flex onClick={onDelete}>
                удалить
              </Button>
            </div>
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
      </div>
    </div>
  );
}
