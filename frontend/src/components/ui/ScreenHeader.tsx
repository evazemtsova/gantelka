import { BackIcon } from './icons';
import './ScreenHeader.css';

interface ScreenHeaderProps {
  title?: string;
  onBack: () => void;
}

export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  return (
    <div className="screen-header">
      <button className="screen-header__back" onClick={onBack} aria-label="Назад">
        <BackIcon />
      </button>
      {title && <h1 className="screen-header__title t-h1">{title}</h1>}
    </div>
  );
}
