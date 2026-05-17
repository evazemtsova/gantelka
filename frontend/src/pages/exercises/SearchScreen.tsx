import { useState, useRef, useEffect } from 'react';
import type { Exercise } from '../../types';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ListItem } from '../../components/ui/ListItem';
import { SearchIcon, CloseIcon } from '../../components/ui/icons';
import { EXERCISE_TYPE_LABELS, MUSCLE_LABELS_CAP } from '../../constants/labels';
import './Exercises.css';

export interface SearchScreenProps {
  exercises: Exercise[];
  onBack: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export function SearchScreen({ exercises, onBack, onSelectExercise }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = query.trim()
    ? exercises.filter((ex) => ex.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="search-screen">
      <ScreenHeader title="Найти" onBack={onBack} />

      <div className="search-screen__input-wrap">
        <SearchIcon />
        <input
          ref={inputRef}
          className="search-screen__input"
          type="text"
          placeholder="жим лежа"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-screen__clear" onClick={() => setQuery('')} aria-label="Очистить">
            <CloseIcon />
          </button>
        )}
      </div>

      {query.trim() && (
        <div className="search-screen__results">
          <p className="search-screen__count">найдено ({results.length})</p>
          <ul className="search-screen__list">
            {results.map((ex) => {
              const typeLabel = EXERCISE_TYPE_LABELS[ex.exerciseType];
              const muscleLabel = MUSCLE_LABELS_CAP[ex.muscleGroup];
              const meta = `${typeLabel}•${muscleLabel}${ex.isCustom ? ' • создано мной' : ''}`;
              return (
                <ListItem
                  key={ex.id}
                  name={ex.name}
                  meta={meta}
                  onClick={() => onSelectExercise(ex)}
                />
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
