-- ============================================================================
-- session_sets.reps и weight: text → numeric
--
-- В UI инпуты numeric/decimal, нечисловые значения не вводятся. Текстовый тип
-- был overengineering и заставлял парсить везде где нужна арифметика.
-- Safe-cast: нечисловые значения (если внезапно есть) → null.
-- ============================================================================

alter table public.session_sets
  alter column reps type numeric using
    case when reps ~ '^-?[0-9]+(\.[0-9]+)?$' then reps::numeric else null end,
  alter column weight type numeric using
    case when weight ~ '^-?[0-9]+(\.[0-9]+)?$' then weight::numeric else null end;
