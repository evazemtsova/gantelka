import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandleIcon, TrashIcon } from './icons';
import './SortableItem.css';

interface SortableItemProps {
  id: string;
  name: string;
  meta: string;
  onRemove: () => void;
}

export function SortableItem({ id, name, meta, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`sortable-item${isDragging ? ' sortable-item--dragging' : ''}`}
    >
      <div className="sortable-item__handle" {...attributes} {...listeners}>
        <DragHandleIcon />
      </div>
      <div className="sortable-item__info">
        <span className="sortable-item__name">{name}</span>
        <span className="sortable-item__meta">{meta}</span>
      </div>
      <button
        className="sortable-item__remove"
        onClick={e => { e.stopPropagation(); onRemove(); }}
        aria-label="Удалить"
      >
        <TrashIcon />
      </button>
    </li>
  );
}
