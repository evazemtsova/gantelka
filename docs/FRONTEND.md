# Правила — фронт

Дополнение к [PRINCIPLES.md](./PRINCIPLES.md). Только специфичное для React/TS/CSS.

## 1. UI-компоненты — таблица переиспользования

**Перед тем как написать `<button>` / `<input>` / новый CSS-класс — проверь:**

| Нужно | Используй |
|---|---|
| Кнопка (filled/outlined/icon-only, `size`, `active`, `fullWidth`, `flex`) | `<Button>` |
| Контейнер экрана (padding + flex-col + gap) | `<Screen>` (prop `withFooter`, `noPadding`) |
| Залипающий футер экрана | `<ScreenFooter>` (prop `column`) |
| Поле формы с лейблом | `<Field label="...">` |
| Строка текстового ввода или textarea | `<TextField>` (prop `multiline`, `inputMode`) |
| Поле поиска — кнопка-триггер | `<SearchField onClick={...}>` |
| Поле поиска — с вводом и крестиком | `<SearchField value={...} onChange={...}>` |
| Тег-переключатель (selected/unselected) | `<Chip>` |
| Пустое состояние списка | `<EmptyState>` |
| Элемент списка со стрелкой | `<ListItem>` |
| Заголовок экрана с «назад» и обрезанием «..» | `<ScreenHeader>` |
| Строка с чекбоксом | `<CheckboxRow>` |
| Перетаскиваемая строка | `<SortableItem>` + `DndContext` |
| Селект | `<Dropdown>` |
| Детальная карточка упражнения | `<ExerciseInfo>` |
| Иконка или логотип | [components/ui/icons.tsx](../frontend/src/components/ui/icons.tsx) |

**Антипаттерн:** кастомный `<button>` / `<input>` / `<textarea>` с дублированными стилями `border + box-shadow + uppercase`. Если примитив не покрывает кейс — расширь его через prop, не делай локальный аналог.

## 2. Single source of truth для фронта

| Что | Где |
|---|---|
| Domain-типы (`Exercise`, `Workout`, `WorkoutSet`) | [types/index.ts](../frontend/src/types/index.ts) |
| Seed-данные (стартовые упражнения и тренировки) | [data/exercises.ts](../frontend/src/data/exercises.ts) |
| Состояние тренировок и упражнений | [store/WorkoutsContext.tsx](../frontend/src/store/WorkoutsContext.tsx) |
| Подписи (группы мышц, типы, параметры) | [constants/labels.ts](../frontend/src/constants/labels.ts) |
| Цвета, шрифты, размеры | [styles/tokens.css](../frontend/src/styles/tokens.css) |
| Типографика (`.t-h1`, `.t-body`, `.t-caption` …) | [styles/typography.css](../frontend/src/styles/typography.css) |
| Утилиты (`.surface`, `.divided-row`, `.chips-row`) | [styles/utilities.css](../frontend/src/styles/utilities.css) |

**Запрещено:**
- Локальные `MUSCLE_LABELS` / `TYPE_LABELS` в компонентах
- Локальные `interface WorkoutEntry` / любые дубликаты domain-типов
- `const SAMPLE_EXERCISES` / любые мок-массивы в компонентах
- Хардкод цветов `#d8ff3b` / `#abd600` / `#0f0f0f` в CSS — только `var(--accent)` / `var(--accent-dark)` / `var(--bg-dark)`

**Исключение:** SVG, инлайнированные в TSX, не подхватывают CSS-переменные. Там хардкод временно ок — пометить TODO.

## 3. State — через context, не через props

Новое поле касается тренировок / упражнений / текущей тренировки → добавь экшен в `WorkoutsContext`. Не прокидывай через 4 уровня props.

**Через props можно:**
- Колбэки навигации (`onBack`, `onShowSubPage`, `onStartSession`)
- UI-флаги, локальные для экрана (`hideNav`, `isArchived`)
- Сущность, открытая на текущем экране (`workout`, `exercise`)

## 4. BEM

```
.block                    /* компонент */
.block__element           /* часть */
.block--modifier          /* состояние блока */
.block__element--modifier /* состояние части */
```

- Один CSS-файл на feature-папку (`workouts/`, `exercises/`) — все sub-screens разделяют его
- Один CSS на UI-компонент (`Button.css` рядом с `Button.tsx`)
- Inline styles запрещены. Исключение: временные dev-страницы с комментарием

## 5. Структура страницы с sub-screens

Главный экран — `default export`. Sub-screens — именованные экспорты в отдельных файлах в той же feature-папке. Переключение через `view` state:

```tsx
type View = 'list' | 'detail' | 'edit';
const [view, setView] = useState<View>('list');

if (view === 'detail') return <Detail ... />;
if (view === 'edit')   return <Edit ... />;
return <List ... />;
```

Веток > 5 → разделять дальше.

## 6. TypeScript

- Никаких `any`, `as any`. Если приходится — комментарий почему
- Все props через `interface ...Props`, объявляй рядом с компонентом
- Optional поля через `?`, не `| undefined`
- Union literals, а не enums: `type View = 'a' | 'b'`
- `as const` для константных массивов, где важен литеральный тип

## 7. Что НЕ делать на фронте

- Не делать дублирующий новый файл, если sub-screen вписывается в существующий flow (урок «начать пробную»: сначала сделал отдельный экран, потом выяснилось, что нужно было просто использовать таб «Тренировки»)
- Не плодить компоненты-обёртки под одну строчку
- Не оставлять закомментированный JSX
- Не добавлять зависимости легко. Перед `npm install X` — спроси, чем не подходит то, что уже есть

## 8. Перед коммитом фронта

В дополнение к [PRINCIPLES § 7](./PRINCIPLES.md#7-перед-коммитом). Команды запускать из `frontend/`:

1. `npx tsc --noEmit -p tsconfig.app.json` — clean
2. `npm run build` — успешно
3. HMR в браузере — изменения видны, нет ошибок в консоли
4. Если изменение видно пользователю — проверить визуально на 375×667 (узкий iPhone). Для проверки сценариев «новичок / старичок» — Logout → Login → войти как Anonymous (новичок) или Google (старичок)

## 9. PWA / мобайл

- Тестировать в Chrome DevTools mobile view (375×667 — iPhone SE — узкий случай)
- Все кликабельные зоны ≥ 44×44
- Inputs с `inputMode` / `type="date"` / `type="tel"` — нативные клавиатуры
- HTML5 Drag-and-Drop НЕ работает на мобайле — только `@dnd-kit`

## 10. Визуальный язык

«Гантелька» — **brutalist-mobile-notebook**. Это сознательная стилистика, важно её не размывать.

**Графический язык:**
- Жёсткий чёрный бордер + офсет-тень + плоская заливка — основной язык. Никаких градиентов и `border-radius` без явной причины
- Высокий контраст: акцентный кислотно-жёлтый `#d8ff3b` — единственный «цветной» цвет, остальное чёрное на молочно-белом
- Два шрифта: `Anonymous Pro` (моноширинный, для display/h1/числовых акцентов) и `Manrope` (sans, для всего остального)
- UPPERCASE везде кроме длинных абзацев (subtitle лендинга, описания упражнений) — часть айдентики
- Mobile-only, одна рука. Все интерактивные элементы ≥ 44×44; «отменить» — всегда отдельная кнопка в футере, не ссылка в тексте
- Никаких модалок / popup'ов — sub-screen вместо модалки

**Семантика акцентов:**
- `var(--accent)` (жёлтый) — **CTA / положительное действие / brand**. «Сохранить», «создать», «завершить», «начать тренировку», `+ add`
- `var(--accent-dark)` (тёмно-зелёный) — **выполненное / активное состояние**. Active nav-tab, иконка done, активная кнопка «готово» в сессии, focus-border у инпута
- Чёрный фон — **инверсия**. Кнопка «начать пробную» на Home (чёрный фон + жёлтый текст), `highlight` в подзаголовке лендинга, тёмная секция лендинга

**Источник правды по визуалу — это код:**
- Цвета/размеры/отступы → [styles/tokens.css](../frontend/src/styles/tokens.css)
- Типографика → [styles/typography.css](../frontend/src/styles/typography.css) (`.t-h1`, `.t-body` …)
- Поверхности/линии → [styles/utilities.css](../frontend/src/styles/utilities.css) (`.surface`, `.divided-row`)
- Если в любом другом месте появилось значение цвета/размера литералом — это баг

**Что НЕ делать:**
- Не вводить CSS-in-JS / styled-components / Tailwind — слой остаётся «чистый CSS + BEM»
- Не вводить CSS Modules — сложность не оправдывает
- Не делать радиусов, gradients, transitions длиннее 0.15s — это меняет визуальный язык, нужно обсуждение
- Не делать «универсальный» полиморфный `<Box>` / `<Stack>` — лучше явные `Screen` / `Field` / `ScreenFooter`
- Не делать dark mode — продукт спроектирован вокруг светлой палитры + жёлтый акцент
