import { useState } from 'react';
import type { WorkoutSet } from '../types';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { Field } from '../components/ui/Field';
import { Dropdown } from '../components/ui/Dropdown';
import { ExerciseInfo } from '../components/ui/ExerciseInfo';
import {
  ArrowIcon,
  ChevronDownIcon,
  InfoIcon,
  TrashIcon,
} from '../components/ui/icons';
import { useWorkouts, useActiveWorkouts } from '../store/WorkoutsContext';
import './WorkoutSession.css';

const newSetId = () => crypto.randomUUID();
const newEmptySet = (): WorkoutSet => ({ id: newSetId(), reps: '', weight: '' });

/** Преобразует ISO-дату YYYY-MM-DD в формат DD.MM для показа. */
function formatNextDate(iso: string): string {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${parseInt(d, 10)}.${m}`;
}

type Step = 'session' | 'date' | 'success';

interface Props {
  workoutId: string;
  onBack: () => void;
  onFinish: () => void;
  onGoToProgress?: () => void;
}

export default function WorkoutSession({ workoutId, onBack, onFinish, onGoToProgress }: Props) {
  const { state } = useWorkouts();
  const workout = state.workouts.find((w) => w.id === workoutId);
  const exercises = workout?.exercises ?? [];
  const activeWorkouts = useActiveWorkouts();

  const [activeId, setActiveId] = useState<string | null>(exercises[0]?.id ?? null);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [setsByEx, setSetsByEx] = useState<Record<string, WorkoutSet[]>>(
    exercises[0] ? { [exercises[0].id]: [newEmptySet()] } : {},
  );
  const [infoExerciseId, setInfoExerciseId] = useState<string | null>(null);

  const [step, setStep] = useState<Step>('session');
  const [nextWorkoutId, setNextWorkoutId] = useState<string | null>(null);
  const [nextDate, setNextDate] = useState('');
  const canConfirmDate = nextWorkoutId !== null && nextDate !== '';
  const nextWorkout = activeWorkouts.find((w) => w.id === nextWorkoutId);

  const workoutOptions = activeWorkouts.map((w) => ({ value: w.id, label: w.name }));

  const infoExercise = infoExerciseId
    ? exercises.find((e) => e.id === infoExerciseId)
    : null;

  if (!workout) {
    return null;
  }

  if (infoExercise) {
    return (
      <ExerciseInfo
        exercise={infoExercise}
        onBack={() => setInfoExerciseId(null)}
      />
    );
  }

  if (step === 'date') {
    return (
      <div className="session">
        <div className="session__scroll">
          <ScreenHeader title={workout.name} onBack={() => setStep('session')} />

          <Field label="следующая тренировка">
            <Dropdown
              value={nextWorkoutId}
              options={workoutOptions}
              placeholder="выбери тренировку"
              onChange={(id) => setNextWorkoutId(id)}
            />
          </Field>

          <Field label="дата следующей тренировки">
            <div className="session__date-row">
              <input
                className="text-field session__input--date"
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
              />
              {nextDate && (
                <Button
                  iconOnly
                  onClick={() => setNextDate('')}
                  aria-label="Очистить дату"
                >
                  <TrashIcon />
                </Button>
              )}
            </div>
          </Field>
        </div>
        <div className="session__footer">
          <Button
            variant="filled"
            fullWidth
            disabled={!canConfirmDate}
            onClick={() => setStep('success')}
          >
            готово
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="session">
        <div className="session__scroll">
          <ScreenHeader onBack={() => setStep('date')} />
          <div className="session__success">
            <h1 className="session__success-title t-display">ура!</h1>
            <p className="session__success-text">
              Тренировка завершена.
              <br />
              Следующая тренировка {formatNextDate(nextDate)}
              <br />
              {nextWorkout?.name}
            </p>
          </div>
        </div>
        <div className="session__footer session__footer--row">
          <Button variant="outlined" flex onClick={onFinish}>на главную</Button>
          <Button variant="outlined" flex onClick={() => { onGoToProgress?.(); onFinish(); }}>
            сводка
          </Button>
        </div>
      </div>
    );
  }

  function toggleExpand(exId: string) {
    if (activeId === exId) {
      setActiveId(null);
      return;
    }
    setSetsByEx((prev) =>
      prev[exId] ? prev : { ...prev, [exId]: [newEmptySet()] }
    );
    setActiveId(exId);
  }

  function addSet(exId: string) {
    setSetsByEx((prev) => ({
      ...prev,
      [exId]: [...(prev[exId] || []), newEmptySet()],
    }));
  }

  function removeSet(exId: string, setId: string) {
    setSetsByEx((prev) => ({
      ...prev,
      [exId]: (prev[exId] || []).filter((s) => s.id !== setId),
    }));
  }

  function updateSet(
    exId: string,
    setId: string,
    field: 'reps' | 'weight',
    value: string,
  ) {
    setSetsByEx((prev) => ({
      ...prev,
      [exId]: (prev[exId] || []).map((s) =>
        s.id === setId ? { ...s, [field]: value } : s,
      ),
    }));
  }

  function toggleDone(exId: string) {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(exId)) next.delete(exId);
      else next.add(exId);
      return next;
    });
  }

  return (
    <div className="session">
      <div className="session__scroll">
        <ScreenHeader title={workout.name} onBack={onBack} />

        <ul className="session__list">
          {exercises.map((ex) => {
            const isActive = activeId === ex.id;
            const isDone = doneIds.has(ex.id);
            const sets = setsByEx[ex.id] || [];

            if (!isActive) {
              return (
                <li
                  key={ex.id}
                  className={`session__row${isDone ? ' session__row--done' : ''}`}
                  onClick={() => toggleExpand(ex.id)}
                >
                  <span className="session__ex-name">{ex.name}</span>
                  <ArrowIcon />
                </li>
              );
            }

            return (
              <li key={ex.id} className="session__expanded">
                <div
                  className={`session__row session__row--expanded${isDone ? ' session__row--done' : ''}`}
                  onClick={() => toggleExpand(ex.id)}
                >
                  <span className="session__ex-name">{ex.name}</span>
                  <ChevronDownIcon />
                </div>

                <div className="session__sets">
                  {sets.map((set, i) => (
                    <div key={set.id} className="session__set">
                      <span className="session__set-num">{i + 1}</span>
                      <TextField
                        value={set.reps}
                        placeholder="раз"
                        inputMode="numeric"
                        onChange={(v) => updateSet(ex.id, set.id, 'reps', v)}
                      />
                      <TextField
                        value={set.weight}
                        placeholder="кг"
                        inputMode="decimal"
                        onChange={(v) => updateSet(ex.id, set.id, 'weight', v)}
                      />
                      <Button
                        iconOnly
                        onClick={() => removeSet(ex.id, set.id)}
                        aria-label="Удалить подход"
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="session__actions">
                  <Button
                    iconOnly
                    onClick={() => setInfoExerciseId(ex.id)}
                    aria-label="Подробнее"
                  >
                    <InfoIcon />
                  </Button>
                  <Button flex onClick={() => addSet(ex.id)}>
                    + подход
                  </Button>
                  <Button
                    variant="filled"
                    active={isDone}
                    onClick={() => toggleDone(ex.id)}
                  >
                    готово
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="session__footer">
        <Button variant="filled" fullWidth onClick={() => setStep('date')}>
          завершить
        </Button>
      </div>
    </div>
  );
}
