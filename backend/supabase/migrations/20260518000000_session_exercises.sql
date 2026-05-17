-- ============================================================================
-- Гантелька — упражнения и подходы в завершённой тренировке
--
-- Реляционная модель (не jsonb-снимок), чтобы при удалении упражнения из
-- exercises оно каскадно пропадало и из истории. Имя/группа отображаются
-- через JOIN с актуальной таблицей exercises — переименование упражнения
-- отразится и в истории.
--
-- Иерархия:
--   sessions (1) → (N) session_exercises → (N) session_sets
--
-- Каскады:
--   exercises → session_exercises  (on delete cascade)
--   sessions  → session_exercises  (on delete cascade)
--   session_exercises → session_sets (on delete cascade)
-- ============================================================================


-- ─── 1. session_exercises ───────────────────────────────────────────────────
create table public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  position int not null
);
create index session_exercises_session_id_idx on public.session_exercises(session_id);
create index session_exercises_exercise_id_idx on public.session_exercises(exercise_id);


-- ─── 2. session_sets ────────────────────────────────────────────────────────
create table public.session_sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references public.session_exercises(id) on delete cascade,
  position int not null,
  reps text,
  weight text
);
create index session_sets_session_exercise_id_idx on public.session_sets(session_exercise_id);


-- ─── 3. RLS ─────────────────────────────────────────────────────────────────
alter table public.session_exercises enable row level security;
alter table public.session_sets enable row level security;

create policy "session_exercises_all_own" on public.session_exercises
  for all using (exists (
    select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()
  ));

create policy "session_sets_all_own" on public.session_sets
  for all using (exists (
    select 1
    from public.session_exercises se
    join public.sessions s on s.id = se.session_id
    where se.id = session_exercise_id and s.user_id = auth.uid()
  )) with check (exists (
    select 1
    from public.session_exercises se
    join public.sessions s on s.id = se.session_id
    where se.id = session_exercise_id and s.user_id = auth.uid()
  ));
