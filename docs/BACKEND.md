# Правила — бек

Дополнение к [PRINCIPLES.md](./PRINCIPLES.md). Только специфичное для серверной части.

## Стек

**Supabase** (managed Postgres + PostgREST API + GoTrue Auth).

- Хостинг фронта: Vercel
- БД: Supabase Postgres
- Auth: Supabase (Google OAuth + Anonymous)
- API: PostgREST через `@supabase/supabase-js` (фронт обращается напрямую)
- Безопасность: RLS на всех таблицах
- Миграции: `backend/supabase/migrations/*.sql`

**Своего бекенд-сервиса нет.** Логика — в БД (RLS, триггеры, view, RPC при необходимости). Если в будущем потребуется тяжёлая серверная логика — поднимем отдельный сервис рядом, БД остаётся в Supabase.

## Контракт с фронтом

Эталон domain-моделей — [src/types/index.ts](../frontend/src/types/index.ts).

```
Exercise         { id, name, muscleGroup, exerciseType, isCustom?, description? }
Workout          { id, name, date, exercises: Exercise[], isArchived?, isTrial? }
WorkoutSet       { id, reps: string, weight: string }
Session          { id, workoutId, workoutName, exerciseCount, nextWorkoutDate, finishedAt, exercises: SessionExercise[] }
SessionExercise  { id, name, muscleGroup, exerciseType, isCustom?, sets: SessionSet[] }
SessionSet       { reps: string, weight: string }
```

- БД хранит `is_archived` / `is_trial` / `muscle_group` / `exercise_type` (snake_case), клиент маппит на camelCase
- `exercises` в Workout приходит inline через nested select (`workout_exercises` + `exercises`), а не списком id
- `exercises` в Session приходит через nested select `session_exercises` + `exercises` + `session_sets`. Имя/группа упражнения берутся из актуальной `exercises` (JOIN), не из снимка — рейнейм отражается и в истории
- `isTrial: true` — флаг seed'а пробных тренировок. UX-ограничений больше нет (раньше нельзя было удалить/архивировать)
- Каскады: удаление упражнения каскадно очищает `session_exercises` → `session_sets` (упражнение пропадает из истории во всех сессиях)

## Mapping reducer-actions → DB-операции

Полный mapping вынесен в [TDR.md](./TDR.md). Дублировать не будем — единая точка правды.

## Правила работы с Supabase

### 1. Никогда не использовать service_role на клиенте
Только `anon` ключ. Service-role-ключ — только для серверных скриптов / Supabase Edge Functions, никогда не в `import.meta.env`.

### 2. RLS — обязательна на каждой новой таблице
Шаблон при создании таблицы:
```sql
create table public.foo (...);
alter table public.foo enable row level security;
create policy "foo_select_own" on public.foo for select using (auth.uid() = user_id);
-- … insert / update / delete
```
Если RLS не включить — таблица читается всеми. Это критический баг.

### 3. Миграции — атомарно, в файлах
- Один файл миграции = одна логическая правка
- Файл нельзя редактировать после применения на проде — только новая миграция
- Имена: `YYYYMMDDHHMMSS_<short_name>.sql`

### 4. Idempotency
- DDL: `create table if not exists` / `drop ... if exists` где уместно (для повторного запуска на чистой БД)
- DML триггеры: `on conflict do nothing` где уместно

### 5. Don't trust the client
RLS защищает доступ. Но на бизнес-логику — отдельные проверки в триггерах / RPC, не на клиенте.

Например: «нельзя архивировать чужую тренировку» — это RLS. Любое будущее «нельзя X» — выбираем уровень осознанно: RLS (data-боундари), триггер (бизнес-правило в БД), UI-only (мягкое ограничение для UX, обходимое).

### 6. Performance
- Индекс на `user_id` обязателен — все запросы фильтруют по нему
- Eager-load связанных через PostgREST nested select, а не N+1 запросами
- Запросы списков — с лимитом, даже если пока «у пользователя 4 тренировки»

### 7. Что НЕ делать
- Не хранить чувствительное в `auth.users.user_metadata` (оно публично читается)
- Не доверять `is_anonymous` для бизнес-решений (юзер может быть anonymous но это валидный auth)
- Не использовать `auth.uid()` в DEFAULT колонок — оно может быть null в триггере. Только в RLS-политиках и в RPC.

## Структура

```
backend/
  supabase/
    migrations/             — DDL, по одному файлу на изменение
    config.toml             — конфиг CLI (появится после `supabase init`)

frontend/
  src/
    lib/
      supabase.ts           — клиент @supabase/supabase-js
      queries.ts            — функции-обёртки над таблицами (типизированные)
```

## Перед коммитом бэка

В дополнение к [PRINCIPLES § 7](./PRINCIPLES.md#7-перед-коммитом):

1. Миграция применяется на чистой БД (тест: `supabase db reset` локально)
2. RLS включён на каждой новой таблице, политики покрывают select/insert/update/delete
3. Типы фронта (`frontend/src/types/index.ts`) согласованы со схемой
4. Если меняется контракт — обновлены `BACKEND.md` и `TDR.md` (mapping таблица)
