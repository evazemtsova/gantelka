import { Button } from '../components/ui/Button';
import './DevSelect.css';

interface Props {
  onNewbie: () => void;
  onReturning: () => void;
}

export default function DevSelect({ onNewbie, onReturning }: Props) {
  return (
    <div className="dev-select">
      <div className="dev-select__content">
        <p className="dev-select__tag">dev-режим</p>
        <h1 className="dev-select__title">выбери сценарий</h1>

        <div className="dev-select__option">
          <Button variant="outlined" fullWidth onClick={onNewbie}>
            новичок
          </Button>
          <p className="dev-select__hint">главная без тренировки</p>
        </div>

        <div className="dev-select__option">
          <Button variant="filled" fullWidth onClick={onReturning}>
            старичок
          </Button>
          <p className="dev-select__hint">главная с тренировкой</p>
        </div>
      </div>
    </div>
  );
}
