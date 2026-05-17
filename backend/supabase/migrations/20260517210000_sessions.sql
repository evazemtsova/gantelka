-- Sessions: запись каждой завершённой тренировки

create table public.sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users on delete cascade,
  workout_id         uuid references public.workouts on delete set null,
  workout_name       text not null,   -- денормализуем, чтобы пережить удаление workout'а
  exercise_count     int not null default 0,
  next_workout_date  text,            -- произвольная строка (например "2.04"); календарь — позже
  finished_at        timestamptz not null default now()
);

create index sessions_user_finished_idx
  on public.sessions(user_id, finished_at desc);

alter table public.sessions enable row level security;

create policy "users see own sessions" on public.sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
