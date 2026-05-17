import { ArrowIcon } from './icons';
import './ListItem.css';

interface ListItemProps {
  name: string;
  meta: string;
  onClick?: () => void;
  arrow?: boolean;
}

export function ListItem({ name, meta, onClick, arrow = true }: ListItemProps) {
  return (
    <li
      className={`list-item${!arrow ? ' list-item--no-arrow' : ''}`}
      onClick={onClick}
    >
      <div className="list-item__info">
        <span className="list-item__name">{name}</span>
        <span className="list-item__meta">{meta}</span>
      </div>
      {arrow && <ArrowIcon />}
    </li>
  );
}
