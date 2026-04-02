import { BackIcon } from './icons';
import './ScreenHeader.css';

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
}

export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  return (
    <div className="screen-header">
      <button className="screen-header__back" onClick={onBack} aria-label="Назад">
        <BackIcon />
      </button>
      <h1 className="screen-header__title">{title}</h1>
    </div>
  );
}
