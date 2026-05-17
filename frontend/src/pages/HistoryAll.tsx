import { useState } from 'react';
import type { Session } from '../types';
import { Screen } from '../components/ui/Screen';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { ListItem } from '../components/ui/ListItem';
import { Button } from '../components/ui/Button';
import { fetchSessionsPage } from '../lib/queries';
import { useSessions } from '../store/WorkoutsContext';
import './HistoryAll.css';

const PAGE_SIZE = 50;

const RU_MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function formatFinishedAt(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${RU_MONTHS[d.getMonth()]}`;
}

interface Props {
  onBack: () => void;
  onOpenSession: (sessionId: string) => void;
}

export default function HistoryAll({ onBack, onOpenSession }: Props) {
  const hydrated = useSessions();
  const [extra, setExtra] = useState<Session[]>([]);
  // hasMore=null значит: ещё не пробовали грузить — true пока не получили < PAGE_SIZE
  const [hasMore, setHasMore] = useState(hydrated.length >= PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const all = [...hydrated, ...extra];

  async function loadMore() {
    if (loading || !hasMore) return;
    const last = all[all.length - 1];
    if (!last) return;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchSessionsPage(last.finishedAt, PAGE_SIZE);
      setExtra((prev) => [...prev, ...page]);
      if (page.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'не удалось загрузить');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="история" onBack={onBack} />

      <ul className="history-all__list">
        {all.map((s) => (
          <ListItem
            key={s.id}
            name={s.workoutName}
            meta={`${formatFinishedAt(s.finishedAt)} • ${s.exerciseCount} упражнений`}
            onClick={() => onOpenSession(s.id)}
          />
        ))}
      </ul>

      {error && <p className="history-all__error">{error}</p>}

      {hasMore && (
        <Button variant="outlined" fullWidth disabled={loading} onClick={loadMore}>
          {loading ? 'загрузка…' : 'загрузить ещё'}
        </Button>
      )}
    </Screen>
  );
}
