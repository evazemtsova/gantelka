# Журнал изменений

Формат: `YYYY-MM-DD HH:MM — что — зачем`. Новые записи сверху. Кратко: 1–2 строки на запись.

---

## 2026-05-18

### Phase 4 (partial) — реальная история на главной
- Новая таблица `public.sessions` с RLS (миграция `20260517210000_sessions.sql`). Поля: `workout_id` (set null при удалении), денормализованный `workout_name`, `exercise_count`, `next_workout_date`, `finished_at`. Индекс `(user_id, finished_at desc)`.
- Тип `Session` в `types/index.ts`. Reducer-state получил `sessions: Session[]`, action `add-session`, селектор `useSessions()`.
- `queries.ts`: hydration параллельно тянет sessions (limit 50, desc по finished_at). `persistAction` пишет в БД при add-session.
- `WorkoutSession`: при клике «готово» на date-шаге диспатчит add-session со снимком `workoutName`/`exerciseCount` + следующая дата. Только потом переход на success.
- `Home`: `HISTORY_STUB` удалён. Реальный список последних 5 сессий с форматом «N месяца • K упражнений». Блок «история» прячется если sessions пусты.

**TODO юзеру:** применить миграцию `backend/supabase/migrations/20260517210000_sessions.sql` в Supabase SQL Editor.

## 2026-05-17

### 23:10 — Fix: визуальная полировка после миграции на дизайн-систему
- `SearchField` в toolbar `Exercises` растягивается на всю свободную ширину (`flex: 1` на `.exercises__toolbar .search-field`) — после миграции схлопывался до контента
- `ListItem` получил симметричный вертикальный padding (12px сверху/снизу): текст теперь по центру между разделителями, а не прижат к нижней линии
- `ExerciseDetail` отрефакторен — кнопки рендерятся как `<ScreenFooter>` внутри Screen `ExerciseInfo` (новый проп `footer`). Старый `.exercise-detail` + `.exercise-detail__actions` со своим padding'ом убран — устранена двойная вложенность Screen'ов
- `ScreenFooter` получил `width: 100%` (надёжность вместо неявного flex stretch)
- Текст кнопки «добавить в тренировку» → «в тренировку»: на 375px-вьюпорте старый текст вместе с iconOnly давал min-content 381px и выдавливал контейнер за правый край screen padding

### 22:30 — Feat: миграция на дизайн-систему (Этапы 1–7)
- Новые файлы: `src/styles/tokens.css` (все CSS-токены в `:root`), `typography.css` (классы `.t-display` / `.t-h1` / `.t-h2` / `.t-body` / `.t-caption`), `utilities.css` (`.surface`, `.divided-row`, `.chips-row`)
- Новые UI-примитивы: `Screen`, `ScreenFooter`, `Field`, `TextField` (с `multiline`), `SearchField` (trigger + full режимы), `Chip`, `EmptyState`
- Обновлены существующие: `Button` (добавлены `size="lg"`, `active`, `iconOnly`), `ListItem`, `CheckboxRow`, `SortableItem`, `Dropdown`, `ScreenHeader`, `ExerciseInfo` — всё через токены, 0 хардкода
- `LogoFull` переехал в `icons.tsx` как единый source of truth
- Все страницы (`Home`, `Login`, `Dashboard`, `Workouts*`, `WorkoutSession`, `Exercises*`) мигрированы на примитивы: 0 `style={{`, 0 хардкода цветов/размеров вне SVG-исключения
- tsc + build зелёные

### 21:45 — Fix: ID новой тренировки → crypto.randomUUID()
В `CreateWorkout` id создаваемой тренировки генерился как `String(Date.now())` — БД отказывала с `invalid input syntax for type uuid`. Заменено на `crypto.randomUUID()` (как уже было в `Exercises` для упражнений).

### 21:30 — Backend Phase 3: запись данных в Supabase
- `queries.ts.persistAction()` — единая точка записи, switch по `PersistableAction`. Покрывает все 9 мутаций: `set-current`, `add-workout`, `update-workout`, `archive-workout`, `unarchive-workout`, `delete-workout`, `add-exercise`, `update-exercise`, `add-exercise-to-workout`
- `WorkoutsContext`: оборачивает `dispatch` — синхронно применяет к локальному state (optimistic UI), параллельно fire-and-forget пишет в Supabase. На failure — `console.error` (rollback отложен в Phase 4)
- `Layout`: добавлен helper `startSession(workoutId)`, который dispatch'ит `set-current` перед открытием сессии. Используется и в preview-режиме, и в Workouts tab
- Все компоненты страниц остались без изменений — продолжают вызывать `dispatch(...)`, middleware всё делает прозрачно
- Mock-режим (`VITE_DEV_AUTH=mock`) обходит запись полностью

Bundle 483→486 KB (+3 KB).

Теперь полный CRUD работает: создание / редактирование / архивация / удаление тренировок и упражнений переживает рефреш страницы. `currentWorkoutId` сохраняется в `profiles` и подтягивается при следующем логине.

**Известное ограничение:** при сбое записи UI показывает действие как успешное, а БД остаётся прежней. После следующего рефреша состояние «отскочит». Phase 4 — добавить rollback + toast.

### 21:00 — Backend Phase 2: чтение данных из Supabase
- `frontend/src/lib/queries.ts` — `fetchHydration()` параллельно загружает exercises, workouts (с inline join на `workout_exercises` + `exercises`), profile. Маппинг snake_case → camelCase локально в файле, типы `ExerciseRow`/`WorkoutRow`/`ProfileRow`
- `WorkoutsContext`: добавлены `hydrate` и `reset` actions, поле `hydrated`. В реальном режиме initialState пустой, в mock — заполняется seed'ом сразу
- `Layout`: `useEffect` на `userId` — после логина запускает `fetchHydration`. При logout — `dispatch({type:'reset'})`. Error-state с человекочитаемой ошибкой, loading-state пока `!state.hydrated`
- Selectors (`useActiveWorkouts`, `useCurrentWorkout`, `useExercises`, `useArchivedWorkouts`) не изменились — все компоненты страниц работают как раньше

После логина новый юзер видит 4 пробные тренировки + 17 упражнений, которые SQL-триггер засеял на его user_id. После logout state очищается, после следующего login — заново загружается.

**Что осталось:** Phase 3 — записи (create/update/archive/delete) пока пишут только в локальный state, после рефреша пропадают. Phase 3 добавит `await supabase.from(...).insert()` перед dispatch.

### 20:30 — Backend Phase 1: реальный auth через Supabase
- Установлен `@supabase/supabase-js`
- `frontend/src/lib/supabase.ts` — клиент, env-проверка с дружелюбным сообщением
- `frontend/src/lib/auth.ts` — `useSession()` хук + `signInWithGoogle()` / `signInAnonymously()` / `signOut()`. В mock-режиме (`VITE_DEV_AUTH=mock`) возвращает фейковую сессию, не дёргает Supabase
- `Login.tsx` — две кнопки: «войти через Google» (filled, primary) + «без регистрации» (outlined, secondary)
- `Dashboard.tsx` — заменена dev-кнопка на «выйти» через `signOut()`. Для anonymous показывается хинт «данные сохраняются на устройстве, не теряй»
- `Layout.tsx` — `useSession()` вместо локальных `isAuthenticated/hasPickedMode` стейтов. Loading-state — пустой layout. Без сессии — Login
- Удалены `DevSelect.tsx`, `DevSelect.css` — anonymous auth закрыл их функцию

Bundle вырос с 285→482 KB JS (138 KB gzip) — `@supabase/supabase-js` тащит base64/jws/etc. Норма для auth-клиента.

Зачем: переход с фейкового isAuthenticated на настоящие сессии. После этого можно подключать data layer (Phase 2/3).

### 19:45 — Reorg: monorepo layout frontend/ + backend/
Корень репозитория разделён на `frontend/` (React + Vite) и `backend/` (Supabase миграции). `docs/`, `CLAUDE.md`, `README.md` остаются в корне.

- `src/`, `public/`, `index.html`, `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.env.example` → `frontend/`
- `supabase/` → `backend/supabase/`
- `node_modules` переустановлены в `frontend/`
- Все пути в `docs/*.md`, `CLAUDE.md`, `README.md` обновлены
- В Vercel надо выставить **Root Directory = `frontend`**

Зачем: чёткое разделение слоёв, чтобы при появлении полноценного backend-сервиса (если потребуется) было куда положить.

### 19:30 — Backend Phase 0: Supabase setup
Зафиксирован стек бэка: Supabase (Postgres + Auth + PostgREST) + Vercel. Создано:
- `docs/BACKEND_PLAN.md` — фазовый план миграции (Phase 0 setup → Phase 1 auth → Phase 2 read → Phase 3 write → Phase 4 sessions/sets)
- `supabase/migrations/20260517190000_initial.sql` — схема (`profiles`, `exercises`, `workouts`, `workout_exercises`), RLS-политики на все таблицы, триггер `handle_new_user` для сидинга
- `.env.example` с `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEV_AUTH`
- `.gitignore` обновлён (`.env`)
- `docs/BACKEND.md` переписан под Supabase: контракт, mapping reducer-actions → DB-операций, правила RLS, миграций, security

Auth: Google OAuth (основной) + Anonymous Sign-In (для «попробовать без регистрации»). DevSelect будет удалён в Phase 1. Зачем: фундамент для подключения реального хранилища без блокировки фронта.

### 19:00 — Правила: разделение по специальностям
`CODING_RULES.md` разбит на 3 файла:
- `PRINCIPLES.md` — универсальные принципы (reuse, single source of truth, не делать на будущее, не глушить типы, чек-листы перед коммитом и удалением)
- `FRONTEND.md` — фронт-специфика (UI-компоненты, BEM, Context, TS)
- `BACKEND.md` — стаб с уже зафиксированным контрактом с фронтом + универсальные правила бэка (валидация, миграции, idempotency, тесты)

Зачем: предыдущие правила были фронт-центричными, бек не покрывали. Теперь когда возьмёмся за сервер — есть куда писать. PRINCIPLES — общий потолок над обоими.

### 18:40 — Завершение сессии: выбор следующей тренировки + календарь
На экране после «завершить» — теперь два поля: dropdown «следующая тренировка» (выбор из активных через `<Dropdown>`) и нативный `<input type="date">` (открывает реальный календарь на тапе). До этого было два text-инпута «число»/«месяц» с ручным маппингом названия месяца, и название следующей тренировки было захардкожено `'день рук'`. Кнопка «готово» — disabled пока оба не выбраны. Success-экран показывает выбранное имя и форматирует дату как `DD.MM`.

### 18:25 — Fix: «на главную» после завершения сессии
Кнопки «на главную» и «сводка» на success-экране сбрасывают `mainView` на `'home'` (а «сводка» — переключает таб на analytics). До этого пользователь возвращался на тот таб, с которого начал сессию (новичок после пробной попадал на Workouts).

### 18:10 — Docs/
Заведены `PRD.md`, `TDR.md`, `CODING_RULES.md`, этот журнал. Зачем: чтобы новый разработчик (или ИИ-агент) понимал контекст за 10 минут, и чтобы решения не терялись.

### 17:55 — Удалён сплит
Вырезаны экраны `SplitScreen` / `SplitEdit` / `SplitAdd`, кнопка «сплит» из Workouts, состояние `split` и action `set-split` из reducer, prop `onAddToSplit`, ~84 строки CSS. Переименованы `hasSplit` → `hasWorkout` в Home, чтобы не путало. Зачем: сложно для MVP, не доносил ценность, удлинял онбординг новичка. Вернуть отдельно, если появится подтверждённый запрос.

### 17:30 — Превью тренировки перед сессией
`Home → начать тренировку` теперь открывает `WorkoutDetail` с кнопкой «запустить», а не сразу WorkoutSession. У пробных тренировок (`isTrial: true`) — только «запустить» + back; у обычных — ещё archive/edit/delete. Зачем: дать пользователю шанс посмотреть упражнения и передумать.

### 16:40 — Большой рефакторинг: R2 + R5 + R8
- **R2 (labels):** все `MUSCLE_LABELS`/`TYPE_LABELS` вынесены в `src/constants/labels.ts`. Удалены 4 дубля.
- **R5 (split god-files):** `Workouts.tsx` (640 строк) → `pages/workouts/` (8 файлов). `Exercises.tsx` (440) → `pages/exercises/` (6 файлов). `CreateExercise` тоже переехал. Один CSS на feature-папку.
- **R8 (CSS-токены):** `--accent-dark`, `--bg-dark` добавлены в `:root`. Все хардкоды `#abd600`/`#0f0f0f` заменены на переменные.

Зачем: подготовить фронт к подключению бэка — единая модель, тонкие файлы, дизайн-токены.

### 15:30 — Большой рефакторинг: R1 + R3 + R4
- **R3 (типы):** канонические `Exercise`, `Workout`, `WorkoutSet` в `types/index.ts`. Удалены `WorkoutEntry`, `WorkoutOption`, `SetEntry`, `SessionExercise`.
- **R1 (данные):** `src/data/exercises.ts` с `SEED_EXERCISES` (17 упражнений, дубли убраны) и `SEED_WORKOUTS` (4 пробные с флагом `isTrial`). Удалены `EXERCISES_POOL`, `SAMPLE_EXERCISES`, `MOCK_EXERCISES`, `MOCK_WORKOUTS`, `INITIAL_ACTIVE`.
- **R4 (state):** `WorkoutsContext` с `useReducer`. Селекторы `useActiveWorkouts`, `useArchivedWorkouts`, `useCurrentWorkout`, `useExercises`. Поднят `currentWorkout` из Home в context.

Зачем: до этого данные жили в трёх копиях, экшены не писали в стор — при подключении API контракт сломался бы.

### 14:50 — Экран выбора пробной тренировки
«Начать пробную» теперь ведёт на таб «Тренировки» (вместо отдельного экрана). В именах мок-тренировок добавлено «пробная». Зачем: пользователь сам сказал использовать существующий экран, не плодить новый.

### 14:30 — Dev-кнопка в профиле
Временная кнопка «dev режим» в Dashboard для возврата на DevSelect. Зачем: удобно переключаться между сценариями новичок/старичок при ручном тестировании. Удалить перед запуском.

### 13:40 — DevSelect (технический экран)
После логина показывается экран «выбери сценарий: новичок / старичок». Зачем: пока нет бэка, надо тестировать оба state'а Home без перезапуска. Удалить перед запуском.

### 13:10 — Завершение тренировки: дата → success
После «завершить» — экран выбора даты следующей тренировки (число + месяц) с disabled-кнопкой «готово», после — экран «УРА! Тренировка завершена / Следующая 2.04 / День рук». Зачем: positive reinforcement в конце сессии + закрепить ритм.

### 12:30 — WorkoutSession + ExerciseInfo
Реализована сессия: аккордеон упражнений, подходы (раз × кг), `(i)` инфо (общий компонент `ExerciseInfo`, переиспользуется в Exercises), `+ подход`, `готово`, sticky «завершить». Зачем: ядро продукта.

### 11:00 — Home (2 состояния) + Login
- Лендинг-логин с GANTELKA + блок «бесплатно» с фичами + футером.
- Home empty («нет тренировки?») и Home with-workout (имя тренировки + история).

Зачем: первый пользовательский путь.
