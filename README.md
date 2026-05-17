# Гантелька

PWA фитнес-трекер. Мобильное приложение (max-width 480px) — персональный тренировочный блокнот.

## Layout

```
frontend/    — React 19 + TS + Vite
backend/     — Supabase (SQL миграции, RLS, триггеры)
docs/        — продуктовая и техническая документация
```

## Быстрый старт

```bash
cd frontend
npm install
cp .env.example .env.local        # заполнить VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
npm run dev                       # http://localhost:5173
```

Скрипты:
- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint
- `npm run preview` — посмотреть прод-билд

## Документация

- [docs/PRD.md](docs/PRD.md) — продуктовое описание
- [docs/TDR.md](docs/TDR.md) — техническое описание архитектуры
- [docs/PRINCIPLES.md](docs/PRINCIPLES.md) — общие правила кода
- [docs/FRONTEND.md](docs/FRONTEND.md) — правила фронта
- [docs/BACKEND.md](docs/BACKEND.md) — правила бэка
- [docs/BACKEND_PLAN.md](docs/BACKEND_PLAN.md) — план миграции на Supabase
- [docs/CHANGELOG.md](docs/CHANGELOG.md) — журнал изменений

## Деплой

- Frontend → Vercel (Root Directory = `frontend`)
- Backend → Supabase (SQL Editor или Supabase CLI)
