import { useState, useRef, useEffect } from 'react';
import type { Exercise } from '../types';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { ListItem } from '../components/ui/ListItem';
import { Button } from '../components/ui/Button';
import { SortableItem } from '../components/ui/SortableItem';
import { SearchIcon, PlusIcon, CloseIcon, EditIcon, TrashIcon } from '../components/ui/icons';
import { CheckboxRow } from '../components/ui/CheckboxRow';
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

// ─── Labels ──────────────────────────────────────────────────────────────────

const MUSCLE_LABELS: Record<string, string> = {
  chest: 'грудь',
  back: 'спина',
  shoulders: 'плечи',
  arms: 'руки',
  legs: 'ноги',
  glutes: 'ягодицы',
  core: 'пресс',
  cardio: 'кардио',
};

const TYPE_LABELS: Record<string, string> = {
  strength: 'силовое',
  cardio: 'кардио',
  stretching: 'растяжка',
};

function exMeta(ex: Exercise): string {
  const parts = [TYPE_LABELS[ex.exerciseType], MUSCLE_LABELS[ex.muscleGroup]];
  if (ex.isCustom) parts.push('создано мной');
  return parts.join(' • ');
}

// ─── Data ────────────────────────────────────────────────────────────────────

interface WorkoutEntry {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
}

const EXERCISES_POOL: Exercise[] = [
  { id: 'we1',  name: 'Лестница',           muscleGroup: 'glutes',  exerciseType: 'cardio',    isCustom: true },
  { id: 'we2',  name: 'Мост',               muscleGroup: 'glutes',  exerciseType: 'strength' },
  { id: 'we3',  name: 'Болгарские приседы', muscleGroup: 'glutes',  exerciseType: 'strength',  isCustom: true },
  { id: 'we4',  name: 'Отведение ног',      muscleGroup: 'glutes',  exerciseType: 'cardio' },
  { id: 'we5',  name: 'Разведение ног',     muscleGroup: 'glutes',  exerciseType: 'cardio' },
  { id: 'we6',  name: 'Ходьба на дорожке', muscleGroup: 'glutes',  exerciseType: 'cardio',    isCustom: true },
  { id: 'we7',  name: 'Жим штанги лёжа',   muscleGroup: 'chest',   exerciseType: 'strength' },
  { id: 'we8',  name: 'Подтягивания',       muscleGroup: 'back',    exerciseType: 'strength' },
  { id: 'we9',  name: 'Приседания',         muscleGroup: 'legs',    exerciseType: 'strength' },
  { id: 'we10', name: 'Бег на дорожке',    muscleGroup: 'cardio',  exerciseType: 'cardio' },
];

const LEGS_SET = EXERCISES_POOL.slice(0, 5);

const INITIAL_ACTIVE: WorkoutEntry[] = [
  { id: 'w1', name: 'День ног ягодицы', date: '24 марта', exercises: LEGS_SET },
  { id: 'w2', name: 'День рук',         date: 'нет даты', exercises: [] },
  { id: 'w3', name: 'День ног квадры',  date: 'нет даты', exercises: LEGS_SET },
  { id: 'w4', name: 'День спины',       date: 'нет даты', exercises: [] },
];

// ─── Add exercises screen ─────────────────────────────────────────────────────

interface AddExercisesScreenProps {
  onBack: () => void;
  onSave: (exercises: Exercise[]) => void;
}

function AddExercisesScreen({ onBack, onSave }: AddExercisesScreenProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const trimmed = query.trim();
  const results = trimmed
    ? EXERCISES_POOL.filter(ex => ex.name.toLowerCase().includes(trimmed.toLowerCase()))
    : [];

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    const toAdd = EXERCISES_POOL.filter(ex => selected.has(ex.id));
    onSave(toAdd);
  }

  return (
    <div className="add-exercises">
      <div className="add-exercises__top">
        <ScreenHeader title="добавить упр." onBack={onBack} />

        <div className="add-exercises__search">
          <SearchIcon />
          <input
            ref={inputRef}
            className="add-exercises__input"
            type="text"
            placeholder="жим лежа"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="add-exercises__clear"
              onClick={() => setQuery('')}
              aria-label="Очистить"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {trimmed && (
          <div className="add-exercises__results">
            <p className="add-exercises__count">найдено ({results.length})</p>
            <ul className="add-exercises__result-list">
              {results.map(ex => (
                <CheckboxRow
                  key={ex.id}
                  name={ex.name}
                  meta={exMeta(ex)}
                  checked={selected.has(ex.id)}
                  onClick={() => toggle(ex.id)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      <Button variant="filled" fullWidth onClick={handleSave}>
        сохранить изменения
      </Button>
    </div>
  );
}

// ─── Create / Edit workout screen ─────────────────────────────────────────────

interface CreateWorkoutScreenProps {
  initial?: WorkoutEntry;
  onBack: () => void;
  onSave: (w: WorkoutEntry) => void;
}

interface ExerciseItem {
  dndId: string;
  ex: Exercise;
}

let _dndCounter = 0;
function newDndId() { return `dnd-${++_dndCounter}`; }

function CreateWorkoutScreen({ initial, onBack, onSave }: CreateWorkoutScreenProps) {
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
    <div className="create-workout">
      <div className="create-workout__content">
        <ScreenHeader title="создать" onBack={onBack} />

        <div className="create-workout__field">
          <span className="create-workout__label">название</span>
          <input
            className="create-workout__input"
            type="text"
            placeholder="день ног ягодицы"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="create-workout__field">
          <span className="create-workout__label">упражнения</span>
          {items.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(item => item.dndId)} strategy={verticalListSortingStrategy}>
                <ul className="create-workout__ex-list">
                  {items.map(item => (
                    <SortableItem
                      key={item.dndId}
                      id={item.dndId}
                      name={item.ex.name}
                      meta={exMeta(item.ex)}
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
        </div>
      </div>

      <div className="create-workout__actions">
        <Button
          variant="filled"
          flex
          onClick={() =>
            onSave({
              id:        initial?.id ?? String(Date.now()),
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
      </div>
    </div>
  );
}

// ─── Workout detail screen ────────────────────────────────────────────────────

interface WorkoutDetailScreenProps {
  workout: WorkoutEntry;
  isArchived: boolean;
  onBack: () => void;
  onArchive?: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  onAddToSplit?: () => void;
}

function WorkoutDetailScreen({
  workout,
  isArchived,
  onBack,
  onArchive,
  onEdit,
  onDelete,
  onAddToSplit,
}: WorkoutDetailScreenProps) {
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
                meta={exMeta(ex)}
                arrow={false}
              />
            ))}
          </ul>
        ) : (
          <p className="workout-detail__empty">упражнений нет</p>
        )}
      </div>

      <div className="workout-detail__actions">
        {isArchived ? (
          <>
            <Button variant="filled" flex onClick={onAddToSplit}>
              добавить в сплит
            </Button>
            <Button iconOnly onClick={onDelete}><TrashIcon /></Button>
          </>
        ) : (
          <>
            <Button variant="outlined" flex onClick={onArchive}>
              убрать в архив
            </Button>
            <Button iconOnly onClick={onEdit}><EditIcon /></Button>
            <Button iconOnly onClick={onDelete}><TrashIcon /></Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Archive screen ───────────────────────────────────────────────────────────

interface ArchiveScreenProps {
  workouts: WorkoutEntry[];
  onBack: () => void;
  onSelectWorkout: (w: WorkoutEntry) => void;
}

function ArchiveScreen({ workouts, onBack, onSelectWorkout }: ArchiveScreenProps) {
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

// ─── Split screen (empty state) ──────────────────────────────────────────────

interface SplitScreenProps {
  onBack: () => void;
  onCreateSplit: () => void;
}

function SplitScreen({ onBack, onCreateSplit }: SplitScreenProps) {
  return (
    <div className="split-screen">
      <ScreenHeader title="сплит" onBack={onBack} />
      <Button variant="filled" fullWidth icon={<PlusIcon />} onClick={onCreateSplit}>
        создать сплит
      </Button>
    </div>
  );
}

// ─── Split edit screen ────────────────────────────────────────────────────────

interface SplitEditScreenProps {
  workouts: WorkoutEntry[];
  onBack: () => void;
  onSave: () => void;
  onRemove: (id: string) => void;
  onReorder: (newOrder: WorkoutEntry[]) => void;
  onAddWorkouts: () => void;
}

function SplitEditScreen({
  workouts,
  onBack,
  onSave,
  onRemove,
  onReorder,
  onAddWorkouts,
}: SplitEditScreenProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = workouts.findIndex(w => w.id === active.id);
    const newIndex = workouts.findIndex(w => w.id === over.id);
    onReorder(arrayMove(workouts, oldIndex, newIndex));
  }

  return (
    <div className="split-edit">
      <div className="split-edit__content">
        <ScreenHeader title="создать сплит" onBack={onBack} />

        <div className="split-edit__section">
          <p className="split-edit__label">тренировки</p>
          {workouts.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={workouts.map(w => w.id)} strategy={verticalListSortingStrategy}>
                <ul className="split-edit__list">
                  {workouts.map(w => (
                    <SortableItem
                      key={w.id}
                      id={w.id}
                      name={w.name}
                      meta={`${w.date} • ${w.exercises.length} упражнений`}
                      onRemove={() => onRemove(w.id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
          <Button variant="outlined" fullWidth icon={<PlusIcon />} onClick={onAddWorkouts}>
            добавить тренировку
          </Button>
        </div>
      </div>

      <div className="split-edit__actions">
        <Button variant="filled" flex onClick={onSave}>сохранить</Button>
        <Button variant="outlined" flex onClick={onBack}>отменить</Button>
      </div>
    </div>
  );
}

// ─── Split add workouts screen ────────────────────────────────────────────────

interface SplitAddScreenProps {
  workouts: WorkoutEntry[];
  onBack: () => void;
  onSave: (selected: WorkoutEntry[]) => void;
}

function SplitAddScreen({ workouts, onBack, onSave }: SplitAddScreenProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    onSave(workouts.filter(w => selected.has(w.id)));
  }

  return (
    <div className="split-add">
      <div className="split-add__content">
        <ScreenHeader title="добавить тре." onBack={onBack} />

        {workouts.length === 0 ? (
          <p className="split-add__empty">нет доступных тренировок</p>
        ) : (
          <ul className="split-add__list">
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
        )}
      </div>

      <Button variant="filled" fullWidth onClick={handleSave}>
        сохранить изменения
      </Button>
    </div>
  );
}

// ─── Main Workouts component ──────────────────────────────────────────────────

type View =
  | 'list'
  | 'archive'
  | 'create'
  | 'edit'
  | 'detail-active'
  | 'detail-archived'
  | 'split'
  | 'split-edit'
  | 'split-add';

interface WorkoutsProps {
  onShowSubPage: () => void;
  onHideSubPage: () => void;
}

export default function Workouts({ onShowSubPage, onHideSubPage }: WorkoutsProps) {
  const [view, setView] = useState<View>('list');
  const [activeWorkouts, setActiveWorkouts] = useState<WorkoutEntry[]>(INITIAL_ACTIVE);
  const [archivedWorkouts, setArchivedWorkouts] = useState<WorkoutEntry[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutEntry | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutEntry | null>(null);
  const [split, setSplit] = useState<WorkoutEntry[]>([]);
  const [splitDraft, setSplitDraft] = useState<WorkoutEntry[]>([]);

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
          setActiveWorkouts(prev => [w, ...prev]);
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
          setActiveWorkouts(prev => prev.map(w => w.id === updated.id ? updated : w));
          setSelectedWorkout(updated);
          setView('detail-active');
        }}
      />
    );
  }

  if (view === 'detail-active' && selectedWorkout) {
    return (
      <WorkoutDetailScreen
        workout={selectedWorkout}
        isArchived={false}
        onBack={backToList}
        onArchive={() => {
          setActiveWorkouts(prev => prev.filter(w => w.id !== selectedWorkout.id));
          setArchivedWorkouts(prev => [selectedWorkout, ...prev]);
          backToList();
        }}
        onEdit={() => { setEditingWorkout(selectedWorkout); setView('edit'); }}
        onDelete={() => {
          setActiveWorkouts(prev => prev.filter(w => w.id !== selectedWorkout.id));
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
          setArchivedWorkouts(prev => prev.filter(w => w.id !== selectedWorkout.id));
          backToArchive();
        }}
        onAddToSplit={() => {
          setSplitDraft(prev => {
            const alreadyIn = prev.some(w => w.id === selectedWorkout.id);
            return alreadyIn ? prev : [...prev, selectedWorkout];
          });
          setView('split-edit');
        }}
      />
    );
  }

  if (view === 'split') {
    return (
      <SplitScreen
        onBack={backToList}
        onCreateSplit={() => {
          setSplitDraft([...split]);
          goSub('split-edit');
        }}
      />
    );
  }

  if (view === 'split-edit') {
    return (
      <SplitEditScreen
        workouts={splitDraft}
        onBack={backToList}
        onSave={() => {
          setSplit([...splitDraft]);
          backToList();
        }}
        onRemove={id => setSplitDraft(prev => prev.filter(w => w.id !== id))}
        onReorder={newOrder => setSplitDraft(newOrder)}
        onAddWorkouts={() => setView('split-add')}
      />
    );
  }

  if (view === 'split-add') {
    const inDraft = new Set(splitDraft.map(w => w.id));
    const available = activeWorkouts.filter(w => !inDraft.has(w.id));
    return (
      <SplitAddScreen
        workouts={available}
        onBack={() => setView('split-edit')}
        onSave={selected => {
          setSplitDraft(prev => [...prev, ...selected]);
          setView('split-edit');
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
        <Button onClick={() => {
          setSplitDraft([...split]);
          goSub(split.length > 0 ? 'split-edit' : 'split');
        }}>сплит</Button>
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
