# Гантелька — CLAUDE.md

PWA фитнес-трекер. Мобильное приложение (max-width 480px). Разработка ведётся поэтапно в диалоге.

## Стек

- React 19 + TypeScript + Vite
- Чистый CSS, BEM-именование — без UI-библиотек, без CSS-фреймворков
- Google Fonts: Anonymous Pro, Manrope (подключены в index.html)
- Шрифт body: Inter (index.css)
- Нет state-management библиотек (store/ и hooks/ пустые)
- Нет персистентности — всё в локальном state
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — drag-and-drop с поддержкой touch

## Цвета и оформление

```
Акцент:        #d8ff3b / #abd600  (активные иконки, кнопки)
Фон приложения: #fbf9f8
Фон страницы:   #0f0f0f (body — тёмный, вокруг PWA)
```

## Архитектура навигации

Нет роутера. Весь роутинг — `useState` в `Layout.tsx`.

```
Page: 'main' | 'analytics' | 'profile'   — нижняя навигация (3 вкладки)
MainView: 'home' | 'exercises' | 'workouts'  — внутри вкладки main
```

Нижняя навигация скрывается при subpage: `hideNav` + `onShowSubPage` / `onHideSubPage` пробрасываются в `Exercises` и `Workouts`.

Внутри `Exercises` и `Workouts` — собственный `view` state для экранов второго уровня.

## Структура файлов

```
src/
  App.tsx                          — просто <Layout />
  index.css                        — глобальные сбросы, body, #root
  types/index.ts                   — все типы данных
  components/
    Layout.tsx / Layout.css        — нижняя навигация, маршрутизация
    ui/
      ListItem.tsx / .css          — универсальный элемент списка
      ScreenHeader.tsx / .css      — заголовок экрана с кнопкой назад
      Button.tsx / .css            — кнопка (filled/outlined/iconOnly/flex/fullWidth)
      CheckboxRow.tsx / .css       — строка-элемент списка с чекбоксом (name, meta, checked, onClick)
      SortableItem.tsx / .css      — перетаскиваемый элемент списка (dnd-kit)
      Dropdown.tsx / .css          — выпадающий список
      icons.tsx                    — все SVG-иконки
  pages/
    Home.tsx / .css                — заглушка, кнопки входа в разделы
    Exercises.tsx / .css           — упражнения (полностью реализовано)
    CreateExercise.tsx / .css      — создание/редактирование упражнения
    Workouts.tsx / .css            — тренировки (полностью реализовано)
    Progress.tsx                   — заглушка (вкладка "Сводка")
    Dashboard.tsx                  — заглушка (вкладка "Профиль")
```

## Типы данных (src/types/index.ts)

```ts
MuscleGroup: 'chest'|'back'|'shoulders'|'arms'|'legs'|'glutes'|'core'|'cardio'
ExerciseType: 'strength'|'cardio'|'stretching'

Exercise      { id, name, muscleGroup, exerciseType, isCustom?, description? }
WorkoutSet    { id, exerciseId, reps?, weight?, duration?, restTime? }
Workout       { id, title, date, sets, notes?, durationMinutes? }
BodyMeasurement { id, date, weightKg?, bodyFatPct?, notes? }
```

Внутри `Workouts.tsx` используется локальный тип `WorkoutEntry { id, name, date, exercises: Exercise[] }` — упрощённый, без sets.

Внутри `Exercises.tsx` используется локальный тип `WorkoutOption { id, name, date, exerciseCount }` — для экрана добавления в тренировку.

## Ключевые UI-компоненты

### Button
```tsx
// Filled (акцентная), full-width:
<Button variant="filled" fullWidth icon={<PlusIcon />} onClick={...}>создать тренировку</Button>

// В flex-строке — обе кнопки flex: 1:
<Button variant="filled" flex onClick={...}>сохранить</Button>
<Button variant="outlined" flex onClick={...}>отменить</Button>

// Иконка-кнопка (50×50):
<Button iconOnly onClick={...}><TrashIcon /></Button>
```
Props: `variant?` (filled/outlined, default outlined), `icon?` (слева), `iconOnly?`, `flex?`, `fullWidth?`, `onClick?`, `children`

### ListItem
```tsx
<ListItem name="..." meta="..." onClick={() => ...} arrow={true} />
// arrow={false} — для списков только на просмотр (без стрелки)
```

### ScreenHeader
```tsx
<ScreenHeader title="название" onBack={() => ...} />
```
Заголовок обрезается с `..` если не помещается (text-overflow: ".." + ellipsis fallback).

### SortableItem
```tsx
<SortableItem id="unique-id" name="..." meta="..." onRemove={() => ...} />
```
Используется внутри `DndContext` + `SortableContext` из dnd-kit. Рендерит: ручку для drag, имя/мета, кнопку удаления. Sensors настраиваются в родительском компоненте.

### CheckboxRow
```tsx
<CheckboxRow name="..." meta="..." checked={bool} onClick={() => ...} />
```
Строка списка с чекбоксом справа (50×46px, белый фон, border, shadow). При `checked` — показывает галочку SVG. Используется в: `AddExercisesScreen`, `SplitAddScreen` (Workouts), `AddToWorkoutScreen` (Exercises).

### icons.tsx
SearchIcon, FilterIcon, PlusIcon, CloseIcon, EditIcon, TrashIcon,
DragHandleIcon, ArrowIcon, BackIcon, AddToWorkoutIcon

## Drag-and-drop (dnd-kit)

Стандартная настройка в каждом экране с перетаскиванием:
```tsx
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
);

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over || active.id === over.id) return;
  const oldIndex = items.findIndex(item => item.id === active.id);
  const newIndex = items.findIndex(item => item.id === over.id);
  setItems(prev => arrayMove(prev, oldIndex, newIndex));
}

<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
    <ul>
      {items.map(item => <SortableItem key={item.id} id={item.id} ... />)}
    </ul>
  </SortableContext>
</DndContext>
```

Если элементы не уникальны (например, одно упражнение добавлено дважды), генерируется `dndId`:
```tsx
interface ExerciseItem { dndId: string; ex: Exercise; }
// при добавлении: { dndId: newDndId(), ex }
// arrayMove по dndId, onSave: items.map(i => i.ex)
```

**Важно:** HTML5 Drag and Drop API не работает на мобильных устройствах. Только dnd-kit.

## Что реализовано

### Exercises (src/pages/Exercises.tsx)
- Список с фильтрацией (группа мышц, только мои)
- Поиск по имени (отдельный экран)
- Создание упражнения (CreateExercise)
- Детальный просмотр + редактирование
- Добавление упражнения в тренировку (`AddToWorkoutScreen`): 3 состояния — выбор тренировки / нет тренировок / добавлено
- 10 примеров в `SAMPLE_EXERCISES`, 4 mock-тренировки в `MOCK_WORKOUTS`

### Workouts (src/pages/Workouts.tsx)
Views: `'list' | 'archive' | 'create' | 'edit' | 'detail-active' | 'detail-archived' | 'split' | 'split-edit' | 'split-add'`

- **list** — список активных тренировок; empty state (нет тренировок) — только заголовок + кнопка "создать тренировку"
- **create / edit** — `CreateWorkoutScreen`: название + список упражнений с drag-and-drop сортировкой (`SortableItem`) + добавление из пула
- **detail-active** — просмотр активной: убрать в архив / редактировать / удалить
- **detail-archived** — просмотр архивной: добавить в сплит / удалить
- **archive** — список архивных тренировок
- **split** — пустой экран сплита (кнопка "создать сплит")
- **split-edit** — `SplitEditScreen`: список тренировок сплита с drag-and-drop + удаление + кнопка "добавить тренировку"
- **split-add** — `SplitAddScreen`: чекбокс-список активных тренировок (не в черновике сплита); использует `CheckboxRow`

Состояние сплита: `split` (сохранённый), `splitDraft` (редактируемый черновик).

4 примера в `INITIAL_ACTIVE`.

## Что не реализовано

- Персистентность (localStorage / backend)
- Страница Progress / Analytics (заглушка)
- Страница Dashboard / Profile (заглушка)
- Глобальный стейт
- Реальный сплит (выбор в AddToSplitScreen не сохраняется между сессиями)
- Логирование подходов/весов в тренировке (WorkoutSet не используется в UI)

## Паттерны кода

- Каждый компонент / страница = свой .css файл, BEM
- Sub-screens реализуются как отдельные функции внутри того же файла, переключаются через view state
- CSS-паттерн: `компонент__элемент--модификатор`
- Нижняя навигация: иконки встроены в Layout.tsx (не в icons.tsx)
- Метки групп мышц и типов — локальные словари `MUSCLE_LABELS`, `TYPE_LABELS` в каждом файле (дублирование)
