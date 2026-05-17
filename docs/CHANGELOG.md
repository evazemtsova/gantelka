# Журнал изменений

Формат: `YYYY-MM-DD HH:MM — что — зачем`. Новые записи сверху. Кратко: 1–2 строки на запись.

---

## 2026-05-18

### Полный экран истории + пагинация
- Новый child-screen `HistoryAll` (`pages/HistoryAll.tsx`): список всех завершённых сессий, сорт по `finished_at desc`. Bottom nav скрыт (как у других детальных экранов).
- Точка входа — кликабельная шапка блока «история» на `Home`: «история» слева + мутед «показать все» справа. Tap по строке → открывает HistoryAll.
- Пагинация cursor-based: `fetchSessionsPage(beforeIso, limit)` в `queries.ts`, фильтр `lt('finished_at', cursor)`. Стартует с уже загруженных в global state (первые 50 из hydration), кнопка «загрузить ещё» подгружает следующие 50; пропадает когда сервер вернул `< PAGE_SIZE`.
- Группировка по месяцам пока не делается (юзер сказал не надо для MVP). EmptyState не делается — на пустой истории шапка «история» на Home скрыта, попасть невозможно.

### SessionDetail: дата как центрированный разделитель главы
- Дата вернулась отдельным элементом между шапкой и списком, но теперь явно — моно UPPERCASE 16px, тёмный текст, центрировано, с тонкими горизонтальными линиями по бокам как «глава». Выглядит как осмысленный разделитель сессии, а не как мутед-каптион.
- Структурно gap-проблема решена через врапер: `session-detail__body` — один flex-ребёнок `Screen` (только 30px gap от шапки), внутри дата и список с тесным gap `var(--s-5)`.
- `rightSlot` из `ScreenHeader` удалён обратно — мы его не используем, лишний API в shared-компоненте не нужен.

### SessionDetail: полировка по фидбеку дизайнера
- Дата прижата к заголовку (`margin-top: -8px`, `margin-bottom: var(--s-6)`) — компенсирует нижний отступ `ScreenHeader`, убирает «тройной воздух» между шапкой и первым упражнением. Дата теперь lowercase «17 мая 2026» (uppercase утяжелял).
- Формат пустого подхода: `—` если не введены повторы (раньше было `— × 5 кг`, что читалось как баг). `12 раз` без веса — оставлено (валидный bodyweight-сценарий).
- EmptyState текст: «упражнения не записаны» (вместо «в этой тренировке нет данных по упражнениям» — короче и менее технично).
- `aria-label` на дате — однозначный контекст для скрин-ридеров.

### Детальный просмотр завершённой тренировки
- Миграция `20260518000000_session_exercises.sql`: реляционная модель `session_exercises` + `session_sets`, обе с RLS и каскадами. При удалении упражнения из `exercises` каскад убирает его и из истории (`exercise_id` FK on delete cascade) — поведение, как просил юзер.
- Типы: `SessionSet`, `SessionExercise`, `Session.exercises: SessionExercise[]`.
- `WorkoutSession`: при «готово» собирает снимок выполненных упражнений (фильтр: есть хотя бы один заполненный подход или нажато «готово»). Поле `exerciseCount` = факт выполненных, а не план.
- `queries.ts`:
  - Hydration читает sessions через nested select `*, session_exercises(position, exercises(*), session_sets(position, reps, weight))` — имена/группы приходят JOIN'ом из актуальной `exercises`, а не из снимка. Переименование упражнения отразится и в истории.
  - `add-session` пишет в 3 таблицы последовательно: `sessions` → `session_exercises` (с returning id) → `session_sets`.
- Новый экран `SessionDetail` (`pages/SessionDetail.tsx`): заголовок = название тренировки + дата, список упражнений с подходами `N. reps × weight кг`. Переиспользует `Screen`, `ScreenHeader`, `EmptyState`, `exerciseMeta`.
- `Home.tsx`: `ListItem` истории получил `onClick` → стрелка вернулась, клик открывает `SessionDetail`. Wire-up в `Layout` через `historySessionId`.

**TODO юзеру:** применить миграцию `backend/supabase/migrations/20260518000000_session_exercises.sql` в Supabase SQL Editor.

### Архивная тренировка: восстановление + нормальная ширина «удалить»
- В `WorkoutDetailScreen` добавлен `onUnarchive`. Для архивной тренировки футер показывает filled «восстановить» сверху и outlined «удалить» снизу — обе `fullWidth`. Раньше была одна узкая `flex`-кнопка без соседей (CSS `flex` без братьев не растягивает).
- В `Workouts.tsx` archive-view диспатчит `unarchive-workout` → тренировка возвращается в активные.

### Пробные тренировки получили полный набор действий
- В `Workouts.tsx` убрана ветка `isTrial ? undefined : ...` для `onArchive`/`onEdit`/`onDelete`. Теперь пробные тренировки можно архивировать, редактировать и удалять наравне с обычными — флаг `isTrial` остаётся только для seed-данных, на UI больше не влияет.

### Главная: кнопка «начать тренировку» ведёт на список тренировок
- В состоянии «есть тренировка» кнопка `home__start-btn` теперь вызывает `onOpenWorkouts` — открывается тот же экран Workouts, что и через нав-таб. Раньше открывался preview конкретной `currentWorkout`.
- Удалён мёртвый код: проп `Home.onStartSession`, state `previewWorkoutId` в `Layout`, импорт `WorkoutDetailScreen` (он по-прежнему используется внутри `Workouts` через свой роутинг).

### Главная: персональное приветствие
- В состоянии «есть тренировка» вместо названия тренировки в `Home` показывается «привет, {имя}» — берём первое слово из `user_metadata.full_name`/`name`, lowercase. Без имени (анонимы / нет meta) — «привет!».

### Профиль показывает данные пользователя
- `Dashboard.tsx` читает `session.user.user_metadata` напрямую — миграция не нужна, поля уже есть в `auth.users` от Google OAuth.
- Аватар (`avatar_url`/`picture`), имя (`full_name`/`name`), email — отображаются в карточке профиля. Fallback: круг с первой буквой имени («Гость» для анонимных).
- Для `is_anonymous` пользователей показывается баннер с CTA «войти через google» — раньше был только текстовый notice без действия.

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
