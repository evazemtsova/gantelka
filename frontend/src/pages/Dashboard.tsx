import { Button } from '../components/ui/Button';
import { signOut, useSession } from '../lib/auth';

export default function Dashboard() {
  const { session } = useSession();
  const isAnonymous = session?.user?.is_anonymous === true;

  return (
    <main style={{ padding: '36px 24px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ fontFamily: 'Anonymous Pro, monospace', fontSize: 40, textTransform: 'uppercase', fontWeight: 400 }}>
        профиль
      </h2>

      {isAnonymous && (
        <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-muted)' }}>
          ты используешь приложение как гость. данные сохраняются на этом устройстве,
          но если выйдешь — потеряются. войди через google, чтобы не потерять.
        </p>
      )}

      <Button variant="outlined" fullWidth onClick={signOut}>
        выйти
      </Button>
    </main>
  );
}
