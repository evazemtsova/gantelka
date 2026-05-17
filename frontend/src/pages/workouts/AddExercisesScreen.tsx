import { useState, useRef, useEffect } from 'react';
import type { Exercise } from '../../types';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { CheckboxRow } from '../../components/ui/CheckboxRow';
import { SearchIcon, CloseIcon } from '../../components/ui/icons';
import { useExercises } from '../../store/WorkoutsContext';
import { exerciseMeta } from '../../constants/labels';
import './Workouts.css';

export interface AddExercisesScreenProps {
  onBack: () => void;
  onSave: (exercises: Exercise[]) => void;
}

export function AddExercisesScreen({ onBack, onSave }: AddExercisesScreenProps) {
  const pool = useExercises();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const trimmed = query.trim();
  const results = trimmed
    ? pool.filter(ex => ex.name.toLowerCase().includes(trimmed.toLowerCase()))
    : [];

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    const toAdd = pool.filter(ex => selected.has(ex.id));
    onSave(toAdd);
  }

  return (
    <div className="add-exercises">
      <div className="add-exercises__top">
        <ScreenHeader title="добавить упр." onBack={onBack} />

        <div className="add-exercises__search">
          <SearchIcon />
          <input
            ref={inputRef}
            className="add-exercises__input"
            type="text"
            placeholder="жим лежа"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="add-exercises__clear"
              onClick={() => setQuery('')}
              aria-label="Очистить"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {trimmed && (
          <div className="add-exercises__results">
            <p className="add-exercises__count">найдено ({results.length})</p>
            <ul className="add-exercises__result-list">
              {results.map(ex => (
                <CheckboxRow
                  key={ex.id}
                  name={ex.name}
                  meta={exerciseMeta(ex)}
                  checked={selected.has(ex.id)}
                  onClick={() => toggle(ex.id)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      <Button variant="filled" fullWidth onClick={handleSave}>
        сохранить изменения
      </Button>
    </div>
  );
}
