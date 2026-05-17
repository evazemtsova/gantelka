-- ============================================================================
-- Гантелька — initial schema
--
-- Tables:
--   profiles            ← расширение auth.users (current_workout_id)
--   exercises           ← упражнения пользователя
--   workouts            ← тренировки пользователя
--   workout_exercises   ← порядок упражнений в тренировке
--
-- Security:
--   RLS на всех таблицах. Доступ только к своим строкам (user_id = auth.uid()).
--
-- Trigger:
--   on_auth_user_created → создаёт profile + засеивает пробные упражнения и
--   тренировки. Работает и для Google-юзеров, и для anonymous.
-- ============================================================================


-- ─── 1. Profiles ────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  current_workout_id uuid,
  created_at timestamptz not null default now()
);


-- ─── 2. Exercises ───────────────────────────────────────────────────────────
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  muscle_group text not null check (
    muscle_group in ('chest','back','shoulders','arms','legs','glutes','core','cardio')
  ),
  exercise_type text not null check (
    exercise_type in ('strength','cardio','stretching')
  ),
  is_custom boolean not null default false,
  description text,
  created_at timestamptz not null default now()
);
create index exercises_user_id_idx on public.exercises(user_id);


-- ─── 3. Workouts ────────────────────────────────────────────────────────────
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  date text,                                  -- пока строкой, как во фронте
  is_archived boolean not null default false,
  is_trial boolean not null default false,
  created_at timestamptz not null default now()
);
create index workouts_user_id_idx on public.workouts(user_id);


-- ─── 4. Workout exercises (порядок) ────────────────────────────────────────
create table public.workout_exercises (
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  position int not null,
  primary key (workout_id, position)
);
create index workout_exercises_exercise_id_idx on public.workout_exercises(exercise_id);


-- FK profiles.current_workout_id → workouts (теперь когда workouts существует)
alter table public.profiles
  add constraint profiles_current_workout_id_fkey
  foreign key (current_workout_id) references public.workouts(id) on delete set null;


-- ─── 5. RLS ─────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- exercises
create policy "exercises_select_own" on public.exercises
  for select using (auth.uid() = user_id);
create policy "exercises_insert_own" on public.exercises
  for insert with check (auth.uid() = user_id);
create policy "exercises_update_own" on public.exercises
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercises_delete_own" on public.exercises
  for delete using (auth.uid() = user_id);

-- workouts
create policy "workouts_select_own" on public.workouts
  for select using (auth.uid() = user_id);
create policy "workouts_insert_own" on public.workouts
  for insert with check (auth.uid() = user_id);
create policy "workouts_update_own" on public.workouts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workouts_delete_own" on public.workouts
  for delete using (auth.uid() = user_id);

-- workout_exercises — доступ через ownership родительской workouts
create policy "workout_exercises_select_own" on public.workout_exercises
  for select using (exists (
    select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()
  ));
create policy "workout_exercises_insert_own" on public.workout_exercises
  for insert with check (exists (
    select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()
  ));
create policy "workout_exercises_update_own" on public.workout_exercises
  for update using (exists (
    select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()
  ));
create policy "workout_exercises_delete_own" on public.workout_exercises
  for delete using (exists (
    select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()
  ));


-- ─── 6. Trigger: seed на создание пользователя ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  -- ids упражнений для линковки в пробные тренировки
  ex_bench_press        uuid := gen_random_uuid();
  ex_bench_press_custom uuid := gen_random_uuid();
  ex_pushups            uuid := gen_random_uuid();
  ex_pullups            uuid := gen_random_uuid();
  ex_back_stretch       uuid := gen_random_uuid();
  ex_dumbbell_press     uuid := gen_random_uuid();
  ex_barbell_squat      uuid := gen_random_uuid();
  ex_squat              uuid := gen_random_uuid();
  ex_lunges             uuid := gen_random_uuid();
  ex_ladder             uuid := gen_random_uuid();
  ex_bridge             uuid := gen_random_uuid();
  ex_bulgarian          uuid := gen_random_uuid();
  ex_leg_abduction      uuid := gen_random_uuid();
  ex_leg_spread         uuid := gen_random_uuid();
  ex_treadmill_walk     uuid := gen_random_uuid();
  ex_crunches           uuid := gen_random_uuid();
  ex_treadmill_run      uuid := gen_random_uuid();

  w_glutes uuid := gen_random_uuid();
  w_arms   uuid := gen_random_uuid();
  w_quads  uuid := gen_random_uuid();
  w_back   uuid := gen_random_uuid();
begin
  -- 1. profile
  insert into public.profiles (id) values (new.id);

  -- 2. seed exercises (17 шт., соответствует src/data/exercises.ts)
  insert into public.exercises (id, user_id, name, muscle_group, exercise_type, is_custom, description) values
    (ex_bench_press,        new.id, 'Жим штанги лёжа',        'chest',     'strength',  false, null),
    (ex_bench_press_custom, new.id, 'Жим штанги лёжа',        'chest',     'strength',  true,  null),
    (ex_pushups,            new.id, 'Отжимания',              'chest',     'strength',  true,  null),
    (ex_pullups,            new.id, 'Подтягивания',           'back',      'strength',  false, null),
    (ex_back_stretch,       new.id, 'Растяжка спины',         'back',      'stretching',false, null),
    (ex_dumbbell_press,     new.id, 'Жим гантелей стоя',      'shoulders', 'strength',  false, null),
    (ex_barbell_squat,      new.id, 'Приседания со штангой',  'legs',      'strength',  false, null),
    (ex_squat,              new.id, 'Приседания',             'legs',      'strength',  false, null),
    (ex_lunges,             new.id, 'Выпады',                 'legs',      'strength',  false, null),
    (ex_ladder,             new.id, 'Лестница',               'glutes',    'cardio',    true,  null),
    (ex_bridge,             new.id, 'Мост',                   'glutes',    'strength',  false, null),
    (ex_bulgarian,          new.id, 'Болгарские приседы',     'glutes',    'strength',  true,  'лучше делать с зеленой резинкой'),
    (ex_leg_abduction,      new.id, 'Отведение ног',          'glutes',    'cardio',    false, null),
    (ex_leg_spread,         new.id, 'Разведение ног',         'glutes',    'cardio',    false, null),
    (ex_treadmill_walk,     new.id, 'Ходьба на дорожке',      'glutes',    'cardio',    true,  null),
    (ex_crunches,           new.id, 'Скручивания',            'core',      'strength',  false, null),
    (ex_treadmill_run,      new.id, 'Бег на дорожке',         'cardio',    'cardio',    false, null);

  -- 3. seed пробных тренировок (4 шт., соответствует SEED_WORKOUTS)
  insert into public.workouts (id, user_id, name, date, is_trial) values
    (w_glutes, new.id, 'День ног ягодицы пробная', '24 марта', true),
    (w_arms,   new.id, 'День рук пробная',         'нет даты', true),
    (w_quads,  new.id, 'День ног квадры пробная',  'нет даты', true),
    (w_back,   new.id, 'День спины пробная',       'нет даты', true);

  -- 4. упражнения в тренировках (только glutes set: ягодицы и квадры)
  insert into public.workout_exercises (workout_id, exercise_id, position) values
    (w_glutes, ex_ladder,        0),
    (w_glutes, ex_bridge,        1),
    (w_glutes, ex_bulgarian,     2),
    (w_glutes, ex_leg_abduction, 3),
    (w_glutes, ex_leg_spread,    4),
    (w_quads,  ex_ladder,        0),
    (w_quads,  ex_bridge,        1),
    (w_quads,  ex_bulgarian,     2),
    (w_quads,  ex_leg_abduction, 3),
    (w_quads,  ex_leg_spread,    4);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
