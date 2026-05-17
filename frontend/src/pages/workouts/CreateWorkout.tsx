import { useState } from 'react';
import type { Exercise, Workout } from '../../types';
import { Screen } from '../../components/ui/Screen';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ScreenFooter } from '../../components/ui/ScreenFooter';
import { Field } from '../../components/ui/Field';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { SortableItem } from '../../components/ui/SortableItem';
import { PlusIcon } from '../../components/ui/icons';
import { exerciseMeta } from '../../constants/labels';
import { AddExercisesScreen } from './AddExercisesScreen';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import './Workouts.css';

export interface ExerciseItem {
  dndId: string;
  ex: Exercise;
}

let _dndCounter = 0;
export function newDndId() { return `dnd-${++_dndCounter}`; }

export interface CreateWorkoutScreenProps {
  initial?: Workout;
  onBack: () => void;
  onSave: (w: Workout) => void;
}

export function CreateWorkoutScreen({ initial, onBack, onSave }: CreateWorkoutScreenProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [items, setItems] = useState<ExerciseItem[]>(
    () => (initial?.exercises ?? []).map(ex => ({ dndId: newDndId(), ex }))
  );
  const [showAddExercises, setShowAddExercises] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  if (showAddExercises) {
    return (
      <AddExercisesScreen
        onBack={() => setShowAddExercises(false)}
        onSave={selected => {
          setItems(prev => [...prev, ...selected.map(ex => ({ dndId: newDndId(), ex }))]);
          setShowAddExercises(false);
        }}
      />
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oldIndex = prev.findIndex(item => item.dndId === active.id);
      const newIndex = prev.findIndex(item => item.dndId === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function removeItem(dndId: string) {
    setItems(prev => prev.filter(item => item.dndId !== dndId));
  }

  return (
    <Screen withFooter>
      <div className="create-workout__content">
        <ScreenHeader title="создать" onBack={onBack} />

        <Field label="название">
          <TextField
            value={name}
            onChange={setName}
            placeholder="день ног ягодицы"
          />
        </Field>

        <Field label="упражнения">
          {items.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(item => item.dndId)} strategy={verticalListSortingStrategy}>
                <ul className="create-workout__ex-list">
                  {items.map(item => (
                    <SortableItem
                      key={item.dndId}
                      id={item.dndId}
                      name={item.ex.name}
                      meta={exerciseMeta(item.ex)}
                      onRemove={() => removeItem(item.dndId)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
          <Button
            variant="outlined"
            fullWidth
            icon={<PlusIcon />}
            onClick={() => setShowAddExercises(true)}
          >
            добавить упражнение
          </Button>
        </Field>
      </div>

      <ScreenFooter>
        <Button
          variant="filled"
          flex
          onClick={() =>
            onSave({
              id:        initial?.id ?? crypto.randomUUID(),
              name:      name.trim() || 'Без названия',
              date:      initial?.date ?? 'нет даты',
              exercises: items.map(item => item.ex),
            })
          }
        >
          сохранить
        </Button>
        <Button variant="outlined" flex onClick={onBack}>
          отменить
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
