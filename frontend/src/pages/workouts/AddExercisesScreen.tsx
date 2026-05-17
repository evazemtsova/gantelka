import { useState } from 'react';
import type { Exercise } from '../../types';
import { Screen } from '../../components/ui/Screen';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ScreenFooter } from '../../components/ui/ScreenFooter';
import { Button } from '../../components/ui/Button';
import { SearchField } from '../../components/ui/SearchField';
import { CheckboxRow } from '../../components/ui/CheckboxRow';
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
    <Screen withFooter>
      <div className="add-exercises__top">
        <ScreenHeader title="добавить упр." onBack={onBack} />

        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="жим лежа"
        />

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

      <ScreenFooter>
        <Button variant="filled" fullWidth onClick={handleSave}>
          сохранить изменения
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
