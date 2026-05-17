import type { Session } from '../types';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { exerciseMeta } from '../constants/labels';
import './SessionDetail.css';

const RU_MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${RU_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatSet(reps: string, weight: string): string {
  // reps без веса = bodyweight (валидно). Вес без reps = непонятно что выполнил.
  if (!reps) return '—';
  if (!weight) return `${reps} раз`;
  return `${reps} × ${weight} кг`;
}

interface Props {
  session: Session;
  onBack: () => void;
}

export default function SessionDetail({ session, onBack }: Props) {
  return (
    <Screen>
      <ScreenHeader title={session.workoutName} onBack={onBack} />

      <div className="session-detail__body">
        <time
          className="session-detail__date"
          dateTime={session.finishedAt}
          aria-label={`дата тренировки: ${formatFullDate(session.finishedAt)}`}
        >
          <span className="session-detail__date-text">
            {formatFullDate(session.finishedAt)}
          </span>
        </time>

        {session.exercises.length > 0 ? (
          <ul className="session-detail__list">
            {session.exercises.map((ex, i) => (
              <li key={`${ex.id}-${i}`} className="session-detail__item">
                <div className="session-detail__head">
                  <span className="session-detail__name">{ex.name}</span>
                  <span className="session-detail__meta">{exerciseMeta(ex)}</span>
                </div>
                {ex.sets.length > 0 ? (
                  <ol className="session-detail__sets">
                    {ex.sets.map((s, idx) => (
                      <li key={idx} className="session-detail__set">
                        <span className="session-detail__set-num">{idx + 1}.</span>
                        <span className="session-detail__set-val">{formatSet(s.reps, s.weight)}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="session-detail__no-sets">подходов нет</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>упражнения не записаны</EmptyState>
        )}
      </div>
    </Screen>
  );
}
