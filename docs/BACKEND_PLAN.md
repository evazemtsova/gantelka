# Backend Plan — Supabase

Живой документ. Правим по мере реализации. Полную сводку правил см. [BACKEND.md](./BACKEND.md).

## Стек

| Что | Чем |
|---|---|
| БД + Auth + API | **Supabase** (managed Postgres + PostgREST + GoTrue) |
| Хостинг фронта | **Vercel** |
| Клиент | `@supabase/supabase-js` (типизированный) |
| Миграции | `backend/supabase/migrations/*.sql`, применяются через CLI или вручную через SQL Editor |
| Своего бекенд-сервиса нет | Логика в БД (RLS, триггеры) + клиент дёргает PostgREST напрямую |

## Архитектура

```
[ PWA на Vercel ]
       │  ① supabase.auth.signInWithOAuth({ provider: 'google' })
       │  ① supabase.auth.signInAnonymously()
       │  ② supabase.from('workouts').select() / insert() / ...
       ▼
[ Supabase ]
   ├── auth.users        ← Google + Anonymous
   ├── public.profiles
   ├── public.exercises
   ├── public.workouts
   └── public.workout_exercises
        │
        │  RLS: user_id = auth.uid()
        ▼
   Postgres
```

## Auth-стратегия

| Путь | Когда |
|---|---|
| **Google OAuth** | основной для постоянных пользователей |
| **Anonymous Sign-In** | «попробовать без регистрации». Создаёт настоящего user в auth.users с `is_anonymous=true`. Все данные сохраняются. Потом можно линкануть к Google. |
| **Dev-bypass** (`VITE_DEV_AUTH=mock`) | разработка фронта без подключения к Supabase. Фронт работает с локальным seed как сейчас. |

Текущий DevSelect (новичок/старичок) **удаляется**. Его место занимает:
- Лендинг с двумя CTA: «войти через Google» / «попробовать без регистрации»
- Anonymous-пользователь стартует с empty Home (триггер на сервере засеет ему пробные тренировки). Дальше — обычный флоу.

## Phases

### Phase 0 — Setup (текущий)
- [x] Документ BACKEND_PLAN
- [x] Миграция `backend/supabase/migrations/*.sql` (схема + RLS + триггер сидинга)
- [x] `frontend/.env.example`
- [ ] **Юзер делает:** создаёт Supabase-проект, включает Google OAuth, включает Anonymous, применяет миграцию, копирует URL/anon-key в `frontend/.env.local`
- [ ] **Юзер делает:** Vercel-проект, линкует репо, прокидывает те же env-vars

### Phase 1 — Auth (0.5 дня)
- `cd frontend && npm i @supabase/supabase-js`
- `frontend/src/lib/supabase.ts` — клиент
- `frontend/src/lib/dev-auth.ts` — bypass-логика по env-флагу
- `Login.tsx` → реальный `signInWithOAuth({ provider: 'google' })`
- Заменить DevSelect → кнопка «попробовать без регистрации» = `signInAnonymously()`
- Session-listener в Layout: `supabase.auth.onAuthStateChange`
- На логаут — `supabase.auth.signOut`

### Phase 2 — Чтение данных (1 день)
- Selectors в `WorkoutsContext` переписываются как async `useEffect`/TanStack Query
- Reducer становится тонким кэшем (или удаляется в пользу TanStack Query — решим)
- Loading-states: skeleton/spinner на Home, Workouts list, Exercises list
- Empty-states: «нет упражнений», «нет тренировок» — уже есть, проверим что переживут реальные данные

### Phase 3 — Запись (0.5 дня)
- Все мутации reducer-actions → Supabase queries:
  - `add-workout` → `workouts.insert`
  - `update-workout` → `workouts.update` + sync workout_exercises (replace по position)
  - `archive-workout` → `workouts.update({ is_archived: true })`
  - `delete-workout` → `workouts.delete`
  - `add-exercise` → `exercises.insert`
  - `update-exercise` → `exercises.update`
  - `add-exercise-to-workout` → `workout_exercises.insert`
  - `set-current` → `profiles.update({ current_workout_id })`
- Optimistic updates (TanStack mutation onMutate) — UI не дёргается

### Phase 4 — Sessions + sets (1–2 дня, позже)
- Новые таблицы `sessions`, `workout_sets`
- Завершение тренировки пишет session-row + sets
- В Сводке — первый график (вес на упражнении по времени)

## Что сделать в Supabase Dashboard

1. **Создать проект** на https://app.supabase.com (Free tier)
2. **Auth → Providers → Google** — включить, заполнить Client ID/Secret (создать OAuth credentials в Google Cloud Console)
3. **Auth → Settings → Anonymous Sign-Ins** — включить
4. **Auth → URL Configuration:**
   - Site URL: `http://localhost:5173` (dev)
   - Redirect URLs: добавить `http://localhost:5173/**`, `https://<project>.vercel.app/**`, и продакшен-домен когда появится
5. **SQL Editor** → запустить содержимое `backend/supabase/migrations/20260517190000_initial.sql`
6. **Project Settings → API** — скопировать `URL` и `anon` ключ. Положить в `frontend/.env.local` и в Vercel env vars.

## Что сделать в Vercel

1. **New Project** → импортировать `evazemtsova/gantelka` из GitHub
2. **Framework Preset:** Vite (detected)
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `dist` (default)
5. **Environment Variables:**
   - `VITE_SUPABASE_URL` = `https://<ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJ...`
   - `VITE_DEV_AUTH` = (пусто в проде)
6. **Deploy.** Получишь URL `<project>.vercel.app` — добавь его в Supabase Redirect URLs (см. шаг 4 выше).

## Дальнейший workflow миграций

После первого ручного применения через SQL Editor — адаптируем Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase migration new feature-name
# редактируем созданный .sql
npx supabase db push  # применяет на remote
```

Все миграции в Git, всегда вперёд-совместимы.

## Открытые решения (не блокеры)

- **Reducer vs TanStack Query.** Сейчас склоняюсь к TanStack Query — он сам решает кэш, инвалидацию, optimistic. Reducer оставить только для чисто UI-state (modals, выбранный экран).
- **Realtime.** Supabase даёт live-подписку на таблицы. Для нашего сценария (один юзер на устройстве) — не нужно сейчас.
- **Storage.** Пока не нужно. Появится если будут аватары / медиа упражнений.
- **Sessions + sets schema.** Phase 4, не сейчас. Но имей в виду — добавится 2 таблицы.

## Что считаем DONE для Phase 0

- ✅ Эти файлы в репо
- ⏳ Supabase-проект создан, миграция применена, env-vars в `frontend/.env.local` и Vercel
- ⏳ `npm run dev` запускается без падений (хотя интеграции пока нет — фронт работает на старом контексте)

Дальше переходим в Phase 1.
