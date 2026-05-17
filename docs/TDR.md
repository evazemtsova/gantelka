# TDR — Гантелька

Технический обзор. Что и почему построено именно так. Читать перед первым большим изменением.

## Стек

- **React 19** + **TypeScript** + **Vite 8**
- Чистый CSS с BEM, без UI-библиотек, без CSS-фреймворков
- **@dnd-kit** (core / sortable / utilities) — drag-and-drop с поддержкой touch
- Без state-management библиотек (Redux/Zustand/etc.) — `React.useReducer` + `Context`
- Без роутера — навигация через `useState` в `Layout.tsx`
- Без persistence (пока). Всё в памяти.

## Главные архитектурные решения

### 1. Нет роутера
Вся навигация — `useState` в [Layout.tsx](../frontend/src/components/Layout.tsx). 3 таба (главная/сводка/профиль) + early-return ветки для оверлеев (Login, DevSelect, WorkoutSession, превью). Внутри табов — собственный `view` state для sub-screens (например, Workouts: list / archive / create / detail / edit).

**Почему:** для PWA без deep-link это проще. Если позже понадобится share-by-URL — добавим react-router без переписывания страниц.

### 2. Единое хранилище через React Context
[src/store/WorkoutsContext.tsx](../frontend/src/store/WorkoutsContext.tsx) — `useReducer` поверх Context. Селекторы: `useActiveWorkouts`, `useArchivedWorkouts`, `useCurrentWorkout`, `useExercises`.

**Почему:** один источник правды для упражнений, тренировок, текущей тренировки. До этого данные жили в каждом компоненте отдельно — при подключении API контракт сломался бы.

**Когда заменить:** при первой реальной асинхронной работе (API) — можно ввести React Query / SWR поверх существующих экшенов. Reducer останется как локальный кэш.

### 3. Канонические типы в `frontend/src/types/index.ts`
`Exercise`, `Workout`, `WorkoutSet`, `MuscleGroup`, `ExerciseType`. Локальные дубли запрещены — расхождение этих типов мгновенно ломает контракт с бэком.

### 4. Seed-данные в `frontend/src/data/exercises.ts`
`SEED_EXERCISES` и `SEED_WORKOUTS` — единственный источник стартовых данных. Reducer заводит их в initial state. Когда появится API — `initialState` заменится на пустой, данные приедут асинхронно.

### 5. Локализованные строки в `frontend/src/constants/labels.ts`
`MUSCLE_LABELS_CAP`, `MUSCLE_LABELS_LOWER`, `EXERCISE_TYPE_LABELS`, `EXERCISE_PARAMS_LABELS`, `SELECTABLE_MUSCLE_GROUPS`, хелпер `exerciseMeta(ex)`. Никаких локальных словарей в компонентах.

### 6. Дизайн-токены в `:root`
[src/components/Layout.css](../frontend/src/components/Layout.css) объявляет все цвета, шрифты, размеры, тени как CSS-переменные. Хардкод цвета `#abd600` в CSS — это баг, заменять на `var(--accent-dark)`.

## Структура файлов

```
frontend/                      — React-приложение
  package.json
  vite.config.ts
  tsconfig*.json
  .env.example                 — VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_DEV_AUTH
  index.html
  public/
  src/
    App.tsx                    — просто <Layout/>
    main.tsx                   — root + WorkoutsProvider
    index.css                  — global reset, body
    types/index.ts             — Exercise, Workout, WorkoutSet, ...
    data/
      exercises.ts             — SEED_EXERCISES, SEED_WORKOUTS
    constants/
      labels.ts                — все человекочитаемые подписи
    store/
      WorkoutsContext.tsx      — useReducer + provider + селекторы
    components/
      Layout.tsx / Layout.css  — навигация, нижний нав-бар, :root токены
      ui/                      — переиспользуемые UI-примитивы
        Button / ListItem / ScreenHeader / CheckboxRow /
        SortableItem / Dropdown / ExerciseInfo / icons
    pages/
      Home.tsx                 — главная (2 состояния)
      Login.tsx                — лендинг
      DevSelect.tsx            — времянка (удалить перед запуском)
      Dashboard.tsx            — заглушка профиля
      Progress.tsx             — заглушка сводки
      WorkoutSession.tsx       — сессия (3 шага: session / date / success)
      exercises/               — feature-папка
        Exercises.tsx, SearchScreen, FiltersPanel,
        ExerciseDetail, CreateExercise, AddToWorkoutScreen,
        Exercises.css          — один CSS на всю feature-папку
      workouts/                — feature-папка
        Workouts.tsx, AddExercisesScreen, ArchiveScreen,
        CreateWorkout, WorkoutDetail,
        Workouts.css           — один CSS на всю feature-папку

backend/                       — Supabase
  supabase/
    migrations/                — DDL по одному файлу на изменение
      20260517190000_initial.sql

docs/                          — продуктовая и техническая дока
```

**Правила структуры:**
- Один TSX = один экран / sub-screen
- CSS — монолит на feature-папку (один .css на `workouts/`, один на `exercises/`)
- Каждый sub-screen экспортируется именованным экспортом (`export function ...`)
- Главная страница папки — `default export`

## Модель данных

```ts
Exercise        { id, name, muscleGroup, exerciseType, isCustom?, description? }
Workout         { id, name, date, exercises: Exercise[], isArchived?, isTrial? }
WorkoutSet      { id, reps: string, weight: string }   // string — форма ввода
MuscleGroup     'chest'|'back'|'shoulders'|'arms'|'legs'|'glutes'|'core'|'cardio'
ExerciseType    'strength'|'cardio'|'stretching'
```

`isTrial` — флаг пробной тренировки. У таких в детальном экране только кнопка «запустить», без edit/delete/archive.

## Навигационный граф

```
Login ──▶ DevSelect ──▶ Home (empty / with-workout)
                          │
                          ├── "начать пробную"   ─▶ Workouts tab
                          ├── "начать тренировку" ─▶ WorkoutDetail preview ─▶ запустить ─▶ WorkoutSession
                          ├── "упражнения"        ─▶ Exercises tab
                          └── "тренировки"        ─▶ Workouts tab

Workouts ─▶ detail-active ─▶ запустить ─▶ WorkoutSession
WorkoutSession ─▶ дата следующей ─▶ "УРА!" ─▶ Home
```

## Известные ограничения

- Нет деструктивных подтверждений (back во время сессии теряет введённые подходы)
- Нет offline-кеша (PWA пока без service worker)
- Подходы в сессии — string, не валидируются на число
- DevSelect виден в проде — убрать через env-флаг или удалить
- SVG-иконки в Layout.tsx с хардкодом цвета `#ABD600` (inline SVG не подхватывает CSS-переменные)

## Что готово для бэка

Reducer-экшены маппятся 1-в-1 на типичные REST-эндпоинты:
- `add-workout` → POST /workouts
- `update-workout` → PATCH /workouts/:id
- `archive-workout` / `delete-workout` → PATCH/DELETE
- `add-exercise` / `update-exercise` → POST/PATCH /exercises
- `add-exercise-to-workout` → POST /workouts/:id/exercises
- `set-current` → PATCH /me

Когда подключаем API — добавляем `effects` (миддлвара или useEffect-обёртки над хуками), не трогаем редьюсер.
