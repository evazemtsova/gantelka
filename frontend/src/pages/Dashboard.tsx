import { Button } from '../components/ui/Button';
import { signOut, useSession } from '../lib/auth';
import './Dashboard.css';

export default function Dashboard() {
  const { session } = useSession();
  const isAnonymous = session?.user?.is_anonymous === true;

  return (
    <main className="dashboard">
      <h2 className="dashboard__title t-h1">профиль</h2>

      {isAnonymous && (
        <p className="dashboard__notice">
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
