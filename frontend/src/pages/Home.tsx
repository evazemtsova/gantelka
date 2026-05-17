import { ListItem } from '../components/ui/ListItem';
import { LogoFull } from '../components/ui/icons';
import { useCurrentWorkout, useSessions } from '../store/WorkoutsContext';
import './Home.css';

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 4l10 6-10 6V4z" fill="currentColor"/>
    </svg>
  );
}

const RU_MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function formatFinishedAt(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${RU_MONTHS[d.getMonth()]}`;
}

const HISTORY_LIMIT = 5;

interface Props {
  onStartTrial: () => void;
  onOpenExercises: () => void;
  onOpenWorkouts:  () => void;
  onStartSession?: (workoutId: string) => void;
}

export default function Home({
  onStartTrial,
  onOpenExercises,
  onOpenWorkouts,
  onStartSession,
}: Props) {
  const currentWorkout = useCurrentWorkout();
  const sessions = useSessions().slice(0, HISTORY_LIMIT);
  const hasWorkout = currentWorkout !== null;

  if (!hasWorkout) {
    return (
      <div className="home home--empty">
        <div className="home__empty-content">
          <LogoFull />
          <h1 className="home__title t-h1">нет тренировки?</h1>
          <button className="home__start-btn" onClick={onStartTrial}>
            <PlayIcon />
            начать пробную
          </button>
        </div>

        <div className="home__nav-buttons home__nav-buttons--empty">
          <button className="home__nav-btn" onClick={onOpenExercises}>
            упражнения
          </button>
          <button className="home__nav-btn" onClick={onOpenWorkouts}>
            тренировки
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home home--with-workout">
      <div className="home__empty-content">
        <LogoFull />
        <h1 className="home__title t-h1">{currentWorkout!.name}</h1>
        <button
          className="home__start-btn"
          onClick={() => onStartSession?.(currentWorkout!.id)}
        >
          <PlayIcon />
          начать тренировку
        </button>
      </div>

      <div className="home__nav-buttons">
        <button className="home__nav-btn" onClick={onOpenExercises}>
          упражнения
        </button>
        <button className="home__nav-btn" onClick={onOpenWorkouts}>
          тренировки
        </button>
      </div>

      {sessions.length > 0 && (
        <div className="home__history">
          <p className="home__history-title">история</p>
          <ul className="home__history-list">
            {sessions.map((s) => (
              <ListItem
                key={s.id}
                name={s.workoutName}
                meta={`${formatFinishedAt(s.finishedAt)} • ${s.exerciseCount} упражнений`}
                arrow={false}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
