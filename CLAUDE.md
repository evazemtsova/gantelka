# Гантелька — CLAUDE.md

PWA фитнес-трекер. Мобильное приложение (max-width 480px).

## Repo layout

```
frontend/       — React 19 + TS + Vite, чистый CSS BEM
backend/        — Supabase (миграции SQL, RLS, триггеры)
docs/           — продуктовая и техническая документация
```

**Команды запускать из `frontend/`:**
```bash
cd frontend
npm install
npm run dev        # vite dev
npm run build      # tsc -b + vite build
npx tsc --noEmit -p tsconfig.app.json
```

## Документация

Перед любой задачей читать:
- [docs/PRINCIPLES.md](docs/PRINCIPLES.md) — универсальные правила (обязательно)
- [docs/FRONTEND.md](docs/FRONTEND.md) — если задача на фронт
- [docs/BACKEND.md](docs/BACKEND.md) — если задача на бек

Контекст по продукту и архитектуре:
- [docs/PRD.md](docs/PRD.md) — что за продукт, флоу пользователя
- [docs/TDR.md](docs/TDR.md) — стек, главные архитектурные решения, структура файлов, навигационный граф, mapping action → Supabase

История изменений:
- [docs/CHANGELOG.md](docs/CHANGELOG.md) — журнал, новые записи сверху

## Стек (короткая сводка)

| Слой | Что |
|---|---|
| Frontend | React 19 + TS + Vite, чистый CSS с BEM |
| State | React Context + useReducer (нет Redux/Zustand) |
| Routing | useState в Layout (нет react-router) |
| DnD | @dnd-kit |
| Auth + БД | Supabase (Postgres + GoTrue + PostgREST) |
| Hosting | Vercel (фронт) + Supabase (бек) |

## Дизайн-токены

```
--accent:        #d8ff3b   /* основной кислотный */
--accent-dark:   #abd600   /* активные иконки, выполненные состояния */
--bg:            #fbf9f8   /* фон приложения */
--bg-dark:       #0f0f0f   /* фон вокруг PWA */
--font-mono:     'Anonymous Pro' /* заголовки */
--font-sans:     'Manrope' /* тело */
```

Объявлены в `:root` в [frontend/src/styles/tokens.css](frontend/src/styles/tokens.css). Хардкод этих цветов в CSS — баг.

## После изменений

1. `tsc` чистый
2. `npm run build` проходит
3. Если user-facing — запись в [docs/CHANGELOG.md](docs/CHANGELOG.md)
4. Если архитектура — обновить [docs/TDR.md](docs/TDR.md)
