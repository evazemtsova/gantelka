import { Button } from '../components/ui/Button';
import { LogoFull } from '../components/ui/icons';
import { signInAnonymously, signInWithGoogle } from '../lib/auth';
import './Login.css';

function LoginArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 17l5-5-5-5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 12H3" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const FEATURES = [
  { num: '01', label: 'база упражнений' },
  { num: '02', label: 'программа тренировок' },
  { num: '03', label: 'календарь' },
  { num: '04', label: 'синхронизация' },
];

export default function Login() {
  return (
    <div className="login">
      <section className="login__hero">
        <div className="login__logo">
          <LogoFull />
        </div>
        <h1 className="login__title">гантелька</h1>
        <p className="login__subtitle">
          Персональный тренировочный блокнот&nbsp;-{' '}
          <span className="login__highlight">системный подход</span>
        </p>
        <div className="login__cta-stack">
          <Button
            variant="filled"
            size="lg"
            fullWidth
            icon={<LoginArrowIcon />}
            onClick={signInWithGoogle}
          >
            войти через Google
          </Button>
          <Button variant="outlined" size="lg" fullWidth onClick={signInAnonymously}>
            без регистрации
          </Button>
        </div>
      </section>

      <section className="login__features">
        <h2 className="login__features-title t-h1">бесплатно</h2>
        <ul className="login__features-list">
          {FEATURES.map((f) => (
            <li key={f.num} className="login__feature">
              <span className="login__feature-num t-h1">{f.num}</span>
              <span className="login__feature-label">{f.label}</span>
            </li>
          ))}
        </ul>
        <footer className="login__footer">
          <p>гантелька&nbsp;&nbsp;•&nbsp;&nbsp;copyright © 2026</p>
          <p>контакты&nbsp;&nbsp;•&nbsp;&nbsp;конфиденциальность</p>
        </footer>
      </section>
    </div>
  );
}
