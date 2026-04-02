import { ArrowIcon } from './icons';
import './ListItem.css';

interface ListItemProps {
  name: string;
  meta: string;
  onClick?: () => void;
}

export function ListItem({ name, meta, onClick }: ListItemProps) {
  return (
    <li className="list-item" onClick={onClick}>
      <div className="list-item__info">
        <span className="list-item__name">{name}</span>
        <span className="list-item__meta">{meta}</span>
      </div>
      <ArrowIcon />
    </li>
  );
}
