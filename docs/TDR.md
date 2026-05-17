# TDR — Гантелька

Технический обзор. Что и почему построено именно так. Читать перед первым большим изменением.

## Стек

- **React 19** + **TypeScript** + **Vite 8**
- Чистый CSS с BEM, без UI-библиотек, без CSS-фреймворков
- **@dnd-kit** (core / sortable / utilities) — drag-and-drop с поддержкой touch
- Без state-management библиотек (Redux/Zustand/etc.) — `React.useReducer` + `Context`
- Без роутера — навигация через `useState` в `Layout.tsx`
- **Supabase** (Postgres + RLS + GoTrue + PostgREST) для auth и persistence; фронт обращается напрямую через `@supabase/supabase-js`
- Хостинг: Vercel (фронт) + Supabase (БД)

## Главные архитектурные решения

### 1. Нет роутера
Вся навигация — `useState` в [Layout.tsx](../frontend/src/components/Layout.tsx). 3 таба (главная/сводка/профиль) + early-return ветки для оверлеев (Login, WorkoutSession, превью). Внутри табов — собственный `view` state для sub-screens (например, Workouts: list / archive / create / detail / edit).

**Почему:** для PWA без deep-link это проще. Если позже понадобится share-by-URL — добавим react-router без переписывания страниц.

### 2. Единое хранилище через React Context
[src/store/WorkoutsContext.tsx](../frontend/src/store/WorkoutsContext.tsx) — `useReducer` поверх Context. Селекторы: `useActiveWorkouts`, `useArchivedWorkouts`, `useCurrentWorkout`, `useExercises`, `useSessions`.

**Почему:** один источник правды для упражнений, тренировок, сессий, текущей тренировки.

**Persistence через middleware.** `dispatch` обёрнут: сначала `rawDispatch` (optimistic UI), потом fire-and-forget `persistAction(action, ctx)` пишет в Supabase. Компоненты этого не видят — продолжают вызывать `dispatch(...)` как раньше. См. [src/lib/queries.ts](../frontend/src/lib/queries.ts).

**Когда заменить:** если появится сложный кэш с инвалидацией — ввести TanStack Query поверх существующих экшенов. Reducer останется как локальный кэш.

### 3. Канонические типы в `frontend/src/types/index.ts`
`Exercise`, `Workout`, `WorkoutSet`, `MuscleGroup`, `ExerciseType`, `Session`, `SessionExercise`, `SessionSet`. Локальные дубли запрещены — расхождение этих типов мгновенно ломает контракт с бэком.

### 4. Seed-данные в `frontend/src/data/exercises.ts`
`SEED_EXERCISES` и `SEED_WORKOUTS` — стартовые данные для **mock-режима** (`VITE_DEV_AUTH=mock`) и для seed-триггера в БД ([миграция initial](../backend/supabase/migrations/20260517190000_initial.sql) сеет точно те же 17 упражнений + 4 пробных тренировки). В реальном режиме `initialState` пустой, данные приходят через `fetchHydration()` при логине.

### 5. Локализованные строки в `frontend/src/constants/labels.ts`
`MUSCLE_LABELS_CAP`, `MUSCLE_LABELS_LOWER`, `EXERCISE_TYPE_LABELS`, `EXERCISE_PARAMS_LABELS`, `SELECTABLE_MUSCLE_GROUPS`, хелпер `exerciseMeta(ex)`. Никаких локальных словарей в компонентах.

### 6. Дизайн-система — токены и примитивы
CSS-переменные `:root` — единственное место для значений. Структура:

- [src/styles/tokens.css](../frontend/src/styles/tokens.css) — все цвета, шрифты, размеры, отступы, тени
- [src/styles/typography.css](../frontend/src/styles/typography.css) — классы `.t-display` / `.t-h1` / `.t-h2` / `.t-body` / `.t-body-strong` / `.t-input` / `.t-caption`
- [src/styles/utilities.css](../frontend/src/styles/utilities.css) — `.surface`, `.surface--sm-shadow`, `.divided-row`, `.chips-row`

Хардкод цвета `#abd600` / `#d8ff3b` в CSS — баг. Исключение: SVG `fill` в `LogoFull` в `icons.tsx` (задокументировано).

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
    main.tsx                   — root + WorkoutsProvider + глобальные стили
    index.css                  — box-sizing reset + #root height
    styles/
      tokens.css               — все CSS-переменные (:root)
      typography.css           — .t-* классы
      utilities.css            — .surface, .divided-row, .chips-row
    types/index.ts             — Exercise, Workout, WorkoutSet, ...
    data/
      exercises.ts             — SEED_EXERCISES, SEED_WORKOUTS
    constants/
      labels.ts                — все человекочитаемые подписи
    store/
      WorkoutsContext.tsx      — useReducer + provider + селекторы
    components/
      Layout.tsx / Layout.css  — навигация, нижний нав-бар
      ui/                      — переиспользуемые UI-примитивы
        Screen / ScreenFooter / Field
        TextField / SearchField / Chip / EmptyState
        Button / ListItem / ScreenHeader / CheckboxRow /
        SortableItem / Dropdown / ExerciseInfo / icons
    pages/
      Home.tsx                 — главная (2 состояния + превью истории)
      Login.tsx                — лендинг (Google OAuth + Anonymous)
      Dashboard.tsx            — профиль (аватар/имя/email Google-юзера, sign-out)
      Progress.tsx             — заглушка сводки
      WorkoutSession.tsx       — сессия (3 шага: session / date / success)
      SessionDetail.tsx        — детальный просмотр завершённой тренировки
      HistoryAll.tsx           — полный список истории с пагинацией
      exercises/               — feature-папка
        Exercises.tsx, SearchScreen, FiltersPanel,
        ExerciseDetail, CreateExercise, AddToWorkoutScreen,
        Exercises.css          — один CSS на всю feature-папку
      workouts/                — feature-папка
        Workouts.tsx, AddExercisesScreen, ArchiveScreen,
        CreateWorkout, WorkoutDetail,
        Workouts.css           — один CSS на всю feature-папку
    lib/
      supabase.ts              — клиент @supabase/supabase-js
      auth.ts                  — useSession + signInWithGoogle/Anonymously/Out
      queries.ts               — fetchHydration, fetchSessionsPage, persistAction

backend/                       — Supabase
  supabase/
    migrations/                — DDL по одному файлу на изменение
      20260517190000_initial.sql           — profiles/exercises/workouts/workout_exercises + RLS + seed-триггер
      20260517210000_sessions.sql          — sessions + RLS
      20260518000000_session_exercises.sql — session_exercises + session_sets + RLS, каскады

docs/                          — продуктовая и техническая дока
```

**Правила структуры:**
- Один TSX = один экран / sub-screen
- CSS — монолит на feature-папку (один .css на `workouts/`, один на `exercises/`)
- Каждый sub-screen экспортируется именованным экспортом (`export function ...`)
- Главная страница папки — `default export`

## Модель данных

```ts
Exercise         { id, name, muscleGroup, exerciseType, isCustom?, description? }
Workout          { id, name, date, exercises: Exercise[], isArchived?, isTrial? }
WorkoutSet       { id, reps: string, weight: string }   // string — форма ввода
MuscleGroup      'chest'|'back'|'shoulders'|'arms'|'legs'|'glutes'|'core'|'cardio'
ExerciseType     'strength'|'cardio'|'stretching'

Session          { id, workoutId, workoutName, exerciseCount, nextWorkoutDate, finishedAt, exercises: SessionExercise[] }
SessionExercise  { id, name, muscleGroup, exerciseType, isCustom?, sets: SessionSet[] }
SessionSet       { reps: string, weight: string }
```

`isTrial` — флаг пробной тренировки (живёт в seed-данных и БД, но UX-ограничений больше не накладывает: у пробных полный набор действий как у обычных). `workoutName` в `Session` — снимок имени на момент завершения (на случай переименования/удаления шаблона). Сам список `exercises` хранится реляционно (`session_exercises` + `session_sets`) с каскадами — удаление упражнения из каталога убирает его и из истории.

## Навигационный граф

```
Login ──▶ Home (empty / with-workout)
   │       │
   │       ├── "начать пробную"   ─▶ Workouts tab
   │       ├── "начать тренировку" ─▶ Workouts tab
   │       ├── "упражнения"        ─▶ Exercises tab
   │       ├── "тренировки"        ─▶ Workouts tab
   │       ├── item истории        ─▶ SessionDetail
   │       └── "история · показать все" ─▶ HistoryAll ─▶ item ─▶ SessionDetail
   │
   ├── "войти через Google"  ─▶ supabase.auth.signInWithOAuth
   └── "без регистрации"     ─▶ supabase.auth.signInAnonymously

Workouts ─▶ detail-active ─▶ "запустить" ─▶ WorkoutSession
Workouts ─▶ archive ─▶ detail-archived ─▶ "восстановить" / "удалить"
WorkoutSession ─▶ "завершить" ─▶ дата следующей ─▶ "УРА!" ─▶ Home
Profile ─▶ "войти через google" (для anonymous) / "выйти" ─▶ Login
```

## Известные ограничения / TODO

- Нет деструктивных подтверждений (back во время сессии теряет введённые подходы)
- Нет offline-кеша (PWA пока без service worker)
- Подходы в сессии — `numeric` в БД, `number | null` на фронте. Null = поле не введено
- `LogoFull` SVG в `icons.tsx` содержит хардкод `fill="#D8FF3B"` (допустимо: `currentColor` не работает для fill отдельных путей многоцветного SVG)
- **persistAction errors:** при сбое записи в Supabase сейчас только `console.error`, нет rollback'а и user-visible toast. Optimistic UI остаётся ложно-успешным
- **Сводка (Progress.tsx) — заглушка.** Когда появятся графики (вес/тоннаж по упражнению во времени, частота тренировок) — там же
- **mock-режим:** seed-данные локальны, ничего не пишется в БД. Полезно для UI-разработки без подключения к Supabase

## Mapping action → Supabase

Reducer-actions пишутся в БД через [persistAction()](../frontend/src/lib/queries.ts) middleware:

| Action | Supabase-операция |
|---|---|
| `set-current` | `profiles.update({ current_workout_id })` |
| `add-workout` | `workouts.insert` + sync `workout_exercises` |
| `update-workout` | `workouts.update` + sync `workout_exercises` (replace по position) |
| `archive-workout` | `workouts.update({ is_archived: true })` (+ обнуление `current_workout_id` если это был current) |
| `unarchive-workout` | `workouts.update({ is_archived: false })` |
| `delete-workout` | `workouts.delete` (RLS-cascade чистит `workout_exercises`) |
| `add-exercise` | `exercises.insert` |
| `update-exercise` | `exercises.update` |
| `add-exercise-to-workout` | `workout_exercises.insert` (с авто-position) |
| `add-session` | `sessions.insert` + `session_exercises.insert` + `session_sets.insert` (последовательно) |

`hydrate` и `reset` — чисто UI-state, не пишутся.
