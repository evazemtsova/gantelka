import type { Exercise } from '../../types';
import { Button } from '../../components/ui/Button';
import { EditIcon, AddToWorkoutIcon } from '../../components/ui/icons';
import { ExerciseInfo } from '../../components/ui/ExerciseInfo';
import './Exercises.css';

export interface ExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
  onEdit: () => void;
  onAddToWorkout: () => void;
}

export function ExerciseDetail({ exercise, onBack, onEdit, onAddToWorkout }: ExerciseDetailProps) {
  return (
    <div className="exercise-detail">
      <ExerciseInfo exercise={exercise} onBack={onBack} />

      <div className="exercise-detail__actions">
        <Button variant="filled" flex icon={<AddToWorkoutIcon />} onClick={onAddToWorkout}>
          добавить в тренировку
        </Button>
        <Button iconOnly onClick={onEdit}><EditIcon /></Button>
      </div>
    </div>
  );
}
