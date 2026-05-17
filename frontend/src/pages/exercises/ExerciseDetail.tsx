import type { Exercise } from '../../types';
import { Button } from '../../components/ui/Button';
import { EditIcon, AddToWorkoutIcon } from '../../components/ui/icons';
import { ExerciseInfo } from '../../components/ui/ExerciseInfo';

export interface ExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
  onEdit: () => void;
  onAddToWorkout: () => void;
}

export function ExerciseDetail({ exercise, onBack, onEdit, onAddToWorkout }: ExerciseDetailProps) {
  return (
    <ExerciseInfo
      exercise={exercise}
      onBack={onBack}
      footer={
        <>
          <Button variant="filled" flex icon={<AddToWorkoutIcon />} onClick={onAddToWorkout}>
            в тренировку
          </Button>
          <Button iconOnly onClick={onEdit}><EditIcon /></Button>
        </>
      }
    />
  );
}
