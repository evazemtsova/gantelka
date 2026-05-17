import { Screen } from '../components/ui/Screen';
import { EmptyState } from '../components/ui/EmptyState';
import { useSessions, useWorkouts } from '../store/WorkoutsContext';
import type { Session } from '../types';
import './Progress.css';

const RU_MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${RU_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Дата следующей хранится в формате YYYY-MM-DD (от <input type="date">). */
function formatNextDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${parseInt(d, 10)} ${RU_MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

interface Totals {
  tonnage: number;
  setsCount: number;
  repsCount: number;
}

function computeTotals(session: Session): Totals {
  let tonnage = 0;
  let setsCount = 0;
  let repsCount = 0;
  for (const ex of session.exercises) {
    for (const set of ex.sets) {
      setsCount += 1;
      if (set.reps !== null) repsCount += set.reps;
      if (set.reps !== null && set.weight !== null) {
        tonnage += set.reps * set.weight;
      }
    }
  }
  return { tonnage, setsCount, repsCount };
}

export default function Progress() {
  const sessions = useSessions();
  const { state } = useWorkouts();
  const last = sessions[0] ?? null;

  if (!last) {
    return (
      <Screen>
        <h1 className="t-h1">сводка</h1>
        <EmptyState>пока нет завершённых тренировок</EmptyState>
      </Screen>
    );
  }

  const totals = computeTotals(last);
  const nextWorkout = last.nextWorkoutId
    ? state.workouts.find((w) => w.id === last.nextWorkoutId)
    : null;

  return (
    <Screen>
      <h1 className="t-h1">сводка</h1>

      <section className="progress__section">
        <p className="progress__section-title">последняя тренировка</p>
        <p className="progress__name">{last.workoutName}</p>
        <p className="progress__date">{formatFullDate(last.finishedAt)}</p>

        <dl className="progress__metrics">
          <div className="progress__metric">
            <dt className="progress__metric-label">тоннаж</dt>
            <dd className="progress__metric-value">{totals.tonnage} кг</dd>
          </div>
          <div className="progress__metric">
            <dt className="progress__metric-label">подходов</dt>
            <dd className="progress__metric-value">{totals.setsCount}</dd>
          </div>
          <div className="progress__metric">
            <dt className="progress__metric-label">повторов</dt>
            <dd className="progress__metric-value">{totals.repsCount}</dd>
          </div>
        </dl>
      </section>

      {(nextWorkout || last.nextWorkoutDate) && (
        <section className="progress__section">
          <p className="progress__section-title">следующая тренировка</p>
          {nextWorkout && <p className="progress__name">{nextWorkout.name}</p>}
          {last.nextWorkoutDate && (
            <p className="progress__date">{formatNextDate(last.nextWorkoutDate)}</p>
          )}
        </section>
      )}
    </Screen>
  );
}
