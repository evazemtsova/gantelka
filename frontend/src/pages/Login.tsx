import { Button } from '../components/ui/Button';
import { signInAnonymously, signInWithGoogle } from '../lib/auth';
import './Login.css';

function GantelkaLogo() {
  return (
    <svg width="150" height="76" viewBox="0 0 150 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.9889 26.9398C12.9889 23.7672 10.417 21.1953 7.24445 21.1953C4.07188 21.1953 1.5 23.7672 1.5 26.9398L1.5 48.2763C1.5 51.4488 4.07188 54.0207 7.24445 54.0207C10.417 54.0207 12.9889 51.4488 12.9889 48.2763L12.9889 26.9398Z" fill="#D8FF3B" stroke="black" strokeWidth="3"/>
      <path d="M32.6844 17.913C32.6844 14.2872 29.7451 11.3479 26.1193 11.3479C22.4935 11.3479 19.5542 14.2872 19.5542 17.913L19.5542 57.3035C19.5542 60.9293 22.4935 63.8685 26.1193 63.8685C29.7451 63.8685 32.6844 60.9293 32.6844 57.3035V17.913Z" fill="#D8FF3B" stroke="black" strokeWidth="3"/>
      <path d="M54.0214 8.88596C54.0214 4.80694 50.7147 1.50024 46.6357 1.50024C42.5567 1.50024 39.25 4.80694 39.25 8.88596L39.25 66.3304C39.25 70.4094 42.5567 73.7161 46.6357 73.7161C50.7147 73.7161 54.0214 70.4094 54.0214 66.3304V8.88596Z" fill="#D8FF3B" stroke="black" strokeWidth="3"/>
      <path d="M109.824 8.88572C109.824 4.8067 106.517 1.5 102.438 1.5C98.3594 1.5 95.0527 4.8067 95.0527 8.88572V66.3302C95.0527 70.4092 98.3594 73.7159 102.438 73.7159C106.517 73.7159 109.824 70.4092 109.824 66.3302V8.88572Z" fill="#D8FF3B" stroke="black" strokeWidth="3"/>
      <path d="M129.519 17.9127C129.519 14.2869 126.58 11.3477 122.954 11.3477C119.328 11.3477 116.389 14.2869 116.389 17.9127V57.3032C116.389 60.929 119.328 63.8683 122.954 63.8683C126.58 63.8683 129.519 60.929 129.519 57.3032V17.9127Z" fill="#D8FF3B" stroke="black" strokeWidth="3"/>
      <path d="M147.572 26.94C147.572 23.7674 145.001 21.1956 141.828 21.1956C138.655 21.1956 136.083 23.7674 136.083 26.94V48.2765C136.083 51.4491 138.655 54.021 141.828 54.021C145.001 54.021 147.572 51.4491 147.572 48.2765V26.94Z" fill="#D8FF3B" stroke="black" strokeWidth="3"/>
      <path d="M56.4824 32.6841H84.384" stroke="black" strokeWidth="3" strokeLinecap="round"/>
      <path d="M64.6895 42.5317H92.591" stroke="black" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

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
          <GantelkaLogo />
        </div>
        <h1 className="login__title">гантелька</h1>
        <p className="login__subtitle">
          Персональный тренировочный блокнот&nbsp;-{' '}
          <span className="login__highlight">системный подход</span>
        </p>
        <div className="login__cta-stack">
          <Button
            variant="filled"
            fullWidth
            icon={<LoginArrowIcon />}
            onClick={signInWithGoogle}
          >
            войти через Google
          </Button>
          <Button variant="outlined" fullWidth onClick={signInAnonymously}>
            без регистрации
          </Button>
        </div>
      </section>

      <section className="login__features">
        <h2 className="login__features-title">бесплатно</h2>
        <ul className="login__features-list">
          {FEATURES.map((f) => (
            <li key={f.num} className="login__feature">
              <span className="login__feature-num">{f.num}</span>
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
