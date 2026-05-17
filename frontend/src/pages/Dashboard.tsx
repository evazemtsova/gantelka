import { Button } from '../components/ui/Button';
import { signInWithGoogle, signOut, useSession } from '../lib/auth';
import './Dashboard.css';

interface GoogleMeta {
  full_name?: string;
  name?: string;
  avatar_url?: string;
  picture?: string;
}

export default function Dashboard() {
  const { session } = useSession();
  const user = session?.user;
  const isAnonymous = user?.is_anonymous === true;
  const meta = (user?.user_metadata ?? {}) as GoogleMeta;

  const displayName = meta.full_name || meta.name || (isAnonymous ? 'Гость' : 'Пользователь');
  const avatarUrl = meta.avatar_url || meta.picture;
  const email = user?.email;
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';

  return (
    <main className="dashboard">
      <h2 className="dashboard__title t-h1">профиль</h2>

      <section className="dashboard__user">
        {avatarUrl ? (
          <img className="dashboard__avatar" src={avatarUrl} alt="" referrerPolicy="no-referrer" />
        ) : (
          <div className="dashboard__avatar dashboard__avatar--fallback" aria-hidden="true">
            {initial}
          </div>
        )}
        <div className="dashboard__user-text">
          <p className="dashboard__name">{displayName}</p>
          {email && <p className="dashboard__email">{email}</p>}
        </div>
      </section>

      {isAnonymous && (
        <section className="dashboard__guest">
          <p className="dashboard__notice">
            ты используешь приложение как гость. войди через google, чтобы не потерять данные.
          </p>
          <Button variant="filled" fullWidth onClick={signInWithGoogle}>
            войти через google
          </Button>
        </section>
      )}

      <Button variant="outlined" fullWidth onClick={signOut}>
        выйти
      </Button>
    </main>
  );
}
