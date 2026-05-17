import { useState } from 'react';
import type { Exercise } from '../../types';
import { Screen } from '../../components/ui/Screen';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { SearchField } from '../../components/ui/SearchField';
import { ListItem } from '../../components/ui/ListItem';
import { EXERCISE_TYPE_LABELS, MUSCLE_LABELS_CAP } from '../../constants/labels';
import './Exercises.css';

export interface SearchScreenProps {
  exercises: Exercise[];
  onBack: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export function SearchScreen({ exercises, onBack, onSelectExercise }: SearchScreenProps) {
  const [query, setQuery] = useState('');

  const results = query.trim()
    ? exercises.filter((ex) => ex.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <Screen>
      <ScreenHeader title="Найти" onBack={onBack} />

      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="жим лежа"
      />

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
    </Screen>
  );
}
