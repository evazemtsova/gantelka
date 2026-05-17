## # DESIGN_SYSTEM.md — Гантелька

> Источник правды по визуалу. Любое расхождение между этим документом и кодом — **баг кода**, не документа.
> Связанные: [PRD.md](./PRD.md) (что строим), [FRONTEND.md](./FRONTEND.md) (как пишем фронт), [TDR.md](./TDR.md) (архитектура).

---

## 0. Кратко — что не так сейчас и зачем эта дока

Сейчас стили разъехались по 16 CSS-файлам, в каждой feature-папке свой набор «полей», «кнопок», «шапок», «лейблов». Конкретно:

- **6 экранов** копируют одну и ту же конструкцию контейнера `.screen` (`padding: var(--screen-padding); display: flex; flex-direction: column; gap: 25-30px`).
- **4 разных h1** (`.home__title`, `.workouts__title`, `.exercises__title`, `.screen-header__title`) с побайтово идентичным CSS.
- **15+ мест** дублируют поверхность «белая карточка с чёрным бордером и тенью» (`background:#fff; border:1px solid var(--border); box-shadow:var(--shadow)`).
- **5 разных полей ввода** в разных файлах (`.create__input`, `.create-workout__input`, `.add-exercises__input`, `.search-screen__input`, `.session__input`) — все хотят быть одним и тем же `<TextField>`.
- **3 разных «нижних футера экрана с 2 кнопками»** (`.workout-detail__actions`, `.create-workout__actions`, `.create__actions`, `.session__footer--row`).
- **Дубль toggle-chip** (`.create__toggle`) — нет в UI-примитивах, хотя используется в двух полях `CreateExercise` и легко применим в фильтрах.
- **Шкала отступов хаотична**: `gap` принимает 8 разных значений (8, 10, 12, 20, 24, 25, 28, 30) без системы.
- **Шкала размеров шрифта — 12 значений** (11, 12, 14, 16, 18, 20, 28, 36, 40, 56, 60), часть не используется.
- **Критический баг**: в [Layout.css:5](../frontend/src/components/Layout.css#L5) — `--accent-dark: var(--accent-dark);` (самореферентная переменная, никогда не разрешается). Все «активные» состояния, рассчитывающие на этот цвет, по факту падают на дефолт браузера.
- **Конфликт глобал-стилей**: [index.css](../frontend/src/index.css) задаёт `body { background: var(--bg-dark); color: #f1f1f1; font-family: 'Inter'; }`, а [Layout.css](../frontend/src/components/Layout.css) — `body { background: var(--bg); color: var(--text); font-family: 'Manrope' }`. Inter не используется, `var(--bg-dark)` виден только в зазоре по бокам PWA-вьюпорта на десктопе — но логически это случайность.
- **Inline-стили в [Dashboard.tsx](../frontend/src/pages/Dashboard.tsx) и [Layout.tsx](../frontend/src/components/Layout.tsx#L134)** — прямой запрет по [FRONTEND.md §4](./FRONTEND.md#4-bem).
- **Хардкод цветов в SVG** (`#D8FF3B`, `#ABD600`, `#000`) в `Layout.tsx`, `Login.tsx`, `Home.tsx` — есть TODO в [FRONTEND.md §2](./FRONTEND.md#2-single-source-of-truth-для-фронта), но в SVG это исправимо через `currentColor`.
- **Дубль логотипа**: `GantelkaLogo` в [Login.tsx](../frontend/src/pages/Login.tsx#L5) и `GantelbkaLogo` (опечатка) в [Home.tsx](../frontend/src/pages/Home.tsx#L6) — одинаковые 8 path'ов, скопированы байт-в-байт.

Цель этой доки — описать одну систему и **TZ на её внедрение** ([§ 10](#10-tz-—-что-надо-фронтендеру-сделать)).

---

## 1. Принципы визуала

«Гантелька» — **brutalist-mobile-notebook**. Это сознательная стилистика, важно её не размывать.

- **Жёсткий чёрный бордер + офсет-тень + плоская заливка** — основной графический язык. Никаких градиентов, никаких радиусов скругления (нигде нет `border-radius` — и не должно появляться без явной причины).
- **Контраст высокий**: акцентный кислотно-жёлтый `#d8ff3b` — единственный «цветной» цвет, остальное чёрное на молочно-белом.
- **Типографика — два шрифта**: `Anonymous Pro` (моноширинный, для display/h1/числовых акцентов) и `Manrope` (sans, для всего остального).
- **Всё UPPERCASE**, кроме длинных абзацев (subtitle лендинга, описания упражнений). UPPERCASE — часть айдентики.
- **Одна рука, мобайл-only**. Все интерактивные элементы ≥44×44 (по [FRONTEND.md §9](./FRONTEND.md#9-pwa--мобайл)), `<Button>` высота 50, основные CTA 64. Это значит — никаких мелких ссылок «отменить» в строке текста; «отменить» — всегда полноценная вторая кнопка в футере.
- **Никаких модалок / popup'ов**. Sub-screen вместо модалки (см. PRD).

---

## 2. Цветовые токены

Переменные в `:root` в [Layout.css](../frontend/src/components/Layout.css). Это **единственное** место их объявления.

### 2.1 Палитра (сырые цвета — никогда не использовать напрямую в CSS компонентов)

| Token | Value | Где видим |
|---|---|---|
| `--accent` | `#d8ff3b` | основной кислотный жёлтый |
| `--accent-dark` | `#abd600` | активные иконки навбара, выполненные состояния, active CTA |
| `--ink` | `#000000` | чёрный (текст, бордер, инвертированный фон в лендинге) |
| `--paper` | `#fbf9f8` | молочно-белый фон приложения |
| `--paper-dark` | `#0f0f0f` | фон вокруг PWA на десктопе, тёмная секция лендинга |
| `--surface` | `#ffffff` | поверхность карточек, инпутов, кнопок-аутлайнов |
| `--surface-active` | `#e4e2e2` | выбранный toggle, активный фильтр |
| `--surface-hover` | `#f5f5f5` | hover у dropdown-item (desktop only) |
| `--muted` | `#c6c6c6` | приглушённый серый — используется и для текста, и для линий-разделителей |

> ⚠️ Прим. сейчас в коде `--bg` = `--paper`, `--bg-dark` = `--paper-dark`, `--text` = `--ink`, `--border` = `--ink`, `--text-muted` = `--muted`. Не переименовываем — много мест поломает. Но **новые токены** (см. ниже) уже семантические.

### 2.2 Семантические токены (это используем в CSS компонентов)

```css
:root {
  /* — palette — */
  --accent:           #d8ff3b;
  --accent-dark:      #abd600;     /* был сломан, чинить — см. § 10 п.1 */
  --bg:               #fbf9f8;
  --bg-dark:          #0f0f0f;
  --surface:          #ffffff;
  --surface-active:   #e4e2e2;
  --surface-hover:    #f5f5f5;

  /* — text — */
  --text:             #000000;
  --text-inverse:     #ffffff;
  --text-muted:       #c6c6c6;

  /* — lines / borders — */
  --border:           #000000;     /* сильный бруталистский бордер */
  --divider:          #c6c6c6;     /* тонкая линия между строк списка */
}
```

**Правило**: `var(--text-muted)` — только для **текста** (placeholder, второстепенная подпись). Для **линии** — `var(--divider)`. Сейчас этим одним токеном `--text-muted` сделано и то и другое — это смысловой коллапс, потому что менять серый текст и серый разделитель имеет смысл независимо.

### 2.3 Семантика акцента

- `--accent` (жёлтый) — **CTA / положительное действие / brand**. «Сохранить», «создать», «завершить», «начать тренировку», `+` add.
- `--accent-dark` (тёмно-зелёный) — **выполненное / активное состояние**. Active nav-tab, иконка done, активная кнопка done в сессии, focus-border у инпута.
- `--ink` чёрный фон — **инверсия**. Кнопка `начать пробную` на Home (чёрный фон + жёлтый текст), `highlight` в подзаголовке лендинга, тёмная секция лендинга.

---

## 3. Типографика

### 3.1 Шрифты

| CSS-var | Family | Когда |
|---|---|---|
| `--font-mono` | `'Anonymous Pro', monospace` | заголовки экранов (h1), display-числа, success «УРА!» |
| `--font-sans` | `'Manrope', system-ui, sans-serif` | всё остальное |

Удалить ссылки на `'Inter'` из [index.css](../frontend/src/index.css) — шрифт не подключен, не используется, оставлен случайно от cra/vite-стартера.

### 3.2 Шкала размеров

Сократить с **12 до 7 размеров**. Это семантические токены, не повторять литералы в коде:

```css
:root {
  /* display — только лендинг + success */
  --text-display-lg: 60px;   /* "ура!", "брось зал" */
  --text-display-md: 56px;   /* "гантелька" на лендинге */

  /* h1 экрана */
  --text-h1:         40px;   /* "тренировки", "упражнения", "нет тренировки?" */

  /* секции */
  --text-h2:         20px;   /* "активные тренировки (3)", "история", section titles */

  /* body */
  --text-body:       18px;   /* основной читаемый размер: имя упражнения в сессии, login subtitle */
  --text-input:      16px;   /* инпуты — НЕ 20px! 20 в инпутах ломает мобайл, теперь стандартизируем по value 16 */
  --text-caption:    12px;   /* labels полей, nav-метки */
}
```

Это **минус 5 размеров**: 11, 14, 28, 36 — выкидываем, везде заменяем на ближайший из шкалы.
- `font-size: 11px` (login footer) → 12px caption.
- `font-size: 14px` (Dashboard inline) → 18px body или 12px caption (по контексту).
- `font-size: 28px` (session__set-num mono) → оставить как **исключение** для num-glyph, либо повысить до 36 для лучшей читаемости и убрать 28. Решение: **исключение, не входит в шкалу** — задокументировать в [§ 7.6 Set row](#76-set-row-сессия).
- `font-size: 36px` (login features title) → 40px h1.

### 3.3 Текстовые стили (composable utility-классы)

В дизайн-системе **класс — это композиция (фамилия + размер + вес + line-height + uppercase)**, а не отдельные строчки в каждом BEM-блоке. Внедрить как утилитные классы в `frontend/src/styles/typography.css`:

| Класс | Спецификация | Где |
|---|---|---|
| `.t-display` | mono, 60, 400, lh 1, UPPER | success, hero promo |
| `.t-h1` | mono, 40, 400, lh 48, UPPER | заголовок экрана |
| `.t-h2` | sans, 20, 500, lh 20, UPPER | section title |
| `.t-body-strong` | sans, 20, 500, UPPER | значения, кнопки-чипы, инпуты по visual'у |
| `.t-body` | sans, 20, 400, lh 27.5 | названия в списках (без uppercase) |
| `.t-input` | sans, 18, 500, UPPER | плейсхолдеры и текст в инпутах |
| `.t-caption` | sans, 12, 500, ls 1.2, UPPER | label поля, nav-метки, meta строки |

Все компоненты **только** ссылаются на эти классы или используют их через CSS-`composes` (если потребуется). Никаких `font-family: var(--font-mono); font-size: 40px; ...` в `.workouts__title` — заменить на `.t-h1`.

---

## 4. Шкала отступов

8-step scale, базовый шаг 4. Прибиваем гвоздями:

```css
:root {
  --s-1: 4px;
  --s-2: 8px;
  --s-3: 10px;    /* legacy — основной inter-item gap */
  --s-4: 12px;
  --s-5: 16px;
  --s-6: 20px;
  --s-7: 24px;
  --s-8: 28px;
  --s-9: 30px;    /* legacy — gap между секциями экрана */
}
```

Сейчас в коде гулят 8/10/12/20/24/25/28/30 — стандартизировать **до этого набора**. `25px` → `24px`, `27.5px` (line-height в списках) → оставить (это `1.375 * 20`, расчётное значение для leading'а).

### 4.1 Стандартные расстояния

| Контекст | Token | Px |
|---|---|---|
| внутренний gap внутри row | `--s-4` | 12 |
| между полем и его label | `--s-3` | 10 |
| между строками списка / item'ами | `--s-7` | 24 (было 25 — округлить) |
| между секциями экрана | `--s-9` | 30 |
| padding экрана | `--screen-padding` | `36px 24px 24px` — оставить как есть |

---

## 5. Поверхности и тени

### 5.1 Тени

```css
:root {
  --shadow:     4px 4px 2px 0 rgba(0, 0, 0, 0.25);   /* основная — кнопки, инпуты, карточки */
  --shadow-sm:  2px 2px 2px 0 rgba(0, 0, 0, 0.25);   /* мелкие — чекбоксы, sortable-handle */
}
```

`--shadow-sm` сейчас захардкожен в `.filters__checkbox` и `.checkbox-row__box` — вынести в токен.

### 5.2 Surface — единая база для всех «карточек»

Сейчас 15+ компонентов дублируют:
```css
background: #fff;
border: 1px solid var(--border);
box-shadow: var(--shadow);
```

Вынести в **mixin-класс** `.surface`:

```css
.surface {
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.surface--sm-shadow { box-shadow: var(--shadow-sm); }
.surface--active   { background: var(--surface-active); }
```

Любая «бруталистская белая плитка» (инпут, кнопка, dropdown, search-field, toggle-chip) использует `.surface` как базу и сверху добавляет свой layout/typography.

### 5.3 Линии и разделители

Между элементами списка — горизонтальная линия `--divider`:
```css
border-bottom: 1px solid var(--divider);
```

Сейчас этот паттерн повторяется в `.list-item`, `.checkbox-row`, `.sortable-item`, `.dropdown__item` — вместе с одинаковым `:first-child / :last-child` сбросом. Вынести в utility-класс `.divided-row`:

```css
.divided-row { padding: 12px 0; border-bottom: 1px solid var(--divider); }
.divided-row:first-child { padding-top: 0; }
.divided-row:last-child  { padding-bottom: 0; border-bottom: none; }
```

---

## 6. Иконки

Все иконки — inline SVG в [icons.tsx](../frontend/src/components/ui/icons.tsx) (общие) и в страничных компонентах (PlayIcon, HomeIcon, AnalyticsIcon, ProfileIcon, GantelkaLogo).

### 6.1 Правила

1. **SVG-иконки реагируют на цвет через `currentColor`**, а не через хардкод `fill="#000"` / `stroke="#000"`. Это позволяет управлять цветом из CSS через `color`.
2. **Цвет иконки = `color` родителя**. Кнопка/строка ставит `color: var(--accent-dark)` — иконка автоматически окрашивается.
3. **Размер по умолчанию 24×24**, для мелких — 20×20. Шкала: 16, 20, 24, 30, 50. Других быть не должно.
4. **Логотип `Gantelka` — один компонент** `<LogoFull />` в [components/ui/icons.tsx](../frontend/src/components/ui/icons.tsx). Сейчас он скопирован байт-в-байт в `Login.tsx` и `Home.tsx` (с опечаткой `Gantelbka`).

### 6.2 Что не починить через currentColor

Логотип «гантелька» — это многоцветный SVG (жёлтые pill + чёрная обводка). Здесь цвет жёлтый — это **brand-fill**, ему придётся остаться хардкодом или использовать `fill="var(--accent)"` — но это **работает только во внешнем SVG-файле, не в инлайне через CSS-vars JSX**. Решение: использовать `style={{ fill: 'var(--accent)' }}` на нужном path, или принять хардкод и пометить TODO. По текущему [FRONTEND.md §2](./FRONTEND.md#2-single-source-of-truth-для-фронта) хардкод в inline-SVG разрешён.

Но `HomeIcon`/`AnalyticsIcon`/`ProfileIcon` в [Layout.tsx](../frontend/src/components/Layout.tsx) — там цвет переключается по `active`. Сделать `fill={active ? 'currentColor' : 'none'} stroke="currentColor"` и в CSS управлять через `.nav-item.active { color: var(--accent-dark); }`. Это уже **реализуется** в `nav-item.active` — `color: var(--accent-dark)` — но иконка хардкодит `'#ABD600'`. Чинить.

---

## 7. UI-компоненты (примитивы)

Файлы — в `frontend/src/components/ui/`. **Перед написанием нового — проверить здесь и в [FRONTEND.md §1](./FRONTEND.md#1-ui-компоненты--таблица-переиспользования).**

### 7.1 `<Screen>` — НОВОЕ

Контейнер экрана. Сейчас этот паттерн повторяется в 6 файлах:
```css
.workouts, .workouts-archive, .workout-detail, .create-workout, .add-exercises, .exercises, .filters, .create, .exercise-info, .home
```

Все они задают:
```css
padding: var(--screen-padding);
display: flex;
flex-direction: column;
gap: 25-30px;
min-height: 100%;
```

```tsx
interface ScreenProps {
  children: ReactNode;
  withFooter?: boolean;  // меняет justify-content на space-between
  noPadding?: boolean;   // для случаев типа ExerciseDetail, где сам компонент управляет паддингом
}
```

CSS:
```css
.screen {
  padding: var(--screen-padding);
  display: flex;
  flex-direction: column;
  gap: var(--s-9);
  min-height: 100%;
}
.screen--with-footer { justify-content: space-between; }
.screen--no-padding  { padding: 0; }
```

### 7.2 `<ScreenHeader>` — есть, расширить

Уже существует. Стиль `.t-h1` на title — заменить захардкоженные правила.

### 7.3 `<ScreenFooter>` — НОВОЕ

Sticky-низ экрана с CTA. Сейчас этот паттерн повторяется в:
- `session__footer` / `session__footer--row`
- `workout-detail__actions` / `workout-detail__actions-stack`
- `create-workout__actions`
- `create__actions`

```tsx
<ScreenFooter>
  <Button variant="filled" flex>Сохранить</Button>
  <Button variant="outlined" flex>Отменить</Button>
</ScreenFooter>
```

```css
.screen-footer {
  flex-shrink: 0;
  padding-top: var(--s-7);
  display: flex;
  gap: var(--s-3);
}
.screen-footer--column { flex-direction: column; }
```

### 7.4 `<Field>` — НОВОЕ

Лейбл + содержимое (input/dropdown/что угодно). Сейчас этот паттерн повторяется в:
- `create__field` (CreateExercise)
- `create-workout__field` (CreateWorkout)
- `filters__field` (FiltersPanel)
- `exercise-info__field` (ExerciseInfo)
- `session__date-section` (WorkoutSession)

```tsx
<Field label="Название">
  <TextField placeholder="например: жим лежа" value={name} onChange={setName} />
</Field>
```

```css
.field { display: flex; flex-direction: column; gap: var(--s-3); }
.field__label { /* class composes(.t-caption) */ }
.field__label--optional span { color: var(--text-muted); }
```

### 7.5 `<TextField>` — НОВОЕ (заменяет 5 копий)

Уже помечен TODO в [FRONTEND.md §1](./FRONTEND.md#1-ui-компоненты--таблица-переиспользования). Текущие реализации:
- `.create__input` / `.create__textarea`
- `.create-workout__input`
- `.add-exercises__input` (внутри `.add-exercises__search` обёртки)
- `.search-screen__input`
- `.session__input` / `.session__input--date`

```tsx
interface TextFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'date';
  inputMode?: 'numeric' | 'decimal' | 'text';
  multiline?: boolean;    // → textarea
  rows?: number;
}
```

```css
.text-field {
  /* composes .surface */
  height: var(--input-height);
  padding: 0 var(--s-4);
  outline: none;
  /* composes .t-input */
}
.text-field--multiline { height: 106px; padding: var(--s-3) var(--s-4); resize: none; }
.text-field:focus { border-color: var(--accent-dark); }
.text-field::placeholder { color: var(--text-muted); }
```

### 7.6 Set row (сессия) — НЕ выносить

Конструкция `[set-num] [reps input] [kg input] [trash]` уникальна для WorkoutSession. Оставить в `WorkoutSession.css`, но **внутренние инпуты использовать `<TextField inputMode="numeric">`**. `set-num` 28px mono — задокументированное исключение.

### 7.7 `<SearchField>` — НОВОЕ

Сейчас в коде живёт **три варианта** поиска:
- `.exercises__search` (триггер — выглядит как поле, но открывает экран `SearchScreen`)
- `.search-screen__input-wrap` + `.search-screen__input` + `.search-screen__clear` (полноценное поле на экране поиска)
- `.add-exercises__search` + `.add-exercises__input` + `.add-exercises__clear` (полноценное поле в add-exercises)

Все три имеют одинаковую визуальную форму. Решение:

```tsx
interface SearchFieldProps {
  value?: string;
  onChange?: (v: string) => void;
  onClick?: () => void;       // если задан — рендерится как trigger (placeholder + поиск иконка)
  placeholder?: string;
}
```

Один компонент с двумя режимами: trigger (только onClick → переход на SearchScreen) и full (value+onChange+clear).

### 7.8 `<Chip>` (selectable toggle) — НОВОЕ

`.create__toggle` в CreateExercise — selectable taggle-chip. Использовать его же для:
- выбора типа упражнения (силовое/кардио/растяжка)
- выбора параметров (вес, повторения, ...)
- потенциально для фильтра по группе мышц (сейчас Dropdown — но визуально chips подошли бы лучше)

```tsx
interface ChipProps {
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
}
```

```css
.chip {
  /* composes .surface */
  height: var(--input-height);
  padding: 0 var(--s-4);
  /* composes .t-body-strong */
  white-space: nowrap;
  transition: background 0.1s;
}
.chip--selected { background: var(--surface-active); }
.chips-row { display: flex; gap: var(--s-3); flex-wrap: wrap; }
```

### 7.9 `<EmptyState>` — НОВОЕ

`.workouts-archive__empty`, `.workout-detail__empty` — одинаковый паттерн.

```tsx
<EmptyState>В архиве пусто</EmptyState>
```

```css
.empty-state {
  /* composes .t-body-strong (uppercase 20/500), color: var(--text-muted) */
}
```

### 7.10 Существующие — что трогать

| Компонент | Что делать |
|---|---|
| `<Button>` | оставить, но удалить override в `Login.css` `.login__cta-stack .btn { height: 64px; ... }`. Добавить вариант `size="lg"` (64px) для login CTA. |
| `<ListItem>` | заменить inline-стили name/meta на `.t-body` / `.t-caption`. |
| `<CheckboxRow>` | то же, и переиспользовать `.divided-row`. |
| `<SortableItem>` | то же, и переиспользовать `.divided-row`. |
| `<Dropdown>` | заменить hover-цвет на `var(--surface-hover)`; item использует `.divided-row`. |
| `<ExerciseInfo>` | использовать `<Screen>`, `<Field>` и текстовые утилиты. |
| `<ScreenHeader>` | title — `.t-h1`. |
| `<icons>` | все SVG: `currentColor` вместо хардкода. |

---

## 8. Архитектура CSS-файлов

### 8.1 Что сейчас (плохо)

```
src/
  App.css                              — пустой комментарий (мусор)
  index.css                            — конфликтует с Layout.css
  components/Layout.css                — токены + лейаут (норм, но баг с --accent-dark)
  components/ui/Button.css
  components/ui/CheckboxRow.css
  components/ui/Dropdown.css
  components/ui/ExerciseInfo.css
  components/ui/ListItem.css
  components/ui/ScreenHeader.css
  components/ui/SortableItem.css
  pages/Home.css                       — 110 строк, ~70% — то, что должно быть в utility / Button
  pages/Login.css                      — 136 строк, частично кастом, частично override <Button>
  pages/WorkoutSession.css             — 227 строк, ~40% — кнопки/инпуты, должно быть в primitives
  pages/exercises/Exercises.css        — 318 строк (САМЫЙ ТОЛСТЫЙ), 4 экрана в одном файле
  pages/exercises/CreateExercise.css   — 115 строк
  pages/workouts/Workouts.css          — 252 строки, 5 экранов в одном файле
```

Итого ≈1500 строк CSS, из которых **на глаз 40–50% — дубли**.

### 8.2 Целевая структура

```
src/
  styles/
    tokens.css           — все CSS-vars (перенести из Layout.css)
    reset.css            — bg-sizing, body (один файл, бывшие index.css + reset из Layout.css)
    typography.css       — .t-display, .t-h1, .t-h2, .t-body, .t-body-strong, .t-input, .t-caption
    utilities.css        — .surface, .surface--*, .divided-row, .chips-row, layout-хелперы
  components/
    Layout.tsx / Layout.css            — только nav, content, bottom-nav
    ui/
      Button.tsx / .css
      Chip.tsx / .css                  ← НОВЫЙ
      Dropdown.tsx / .css
      Field.tsx / .css                 ← НОВЫЙ
      ListItem.tsx / .css
      CheckboxRow.tsx / .css
      SortableItem.tsx / .css
      Screen.tsx / .css                ← НОВЫЙ
      ScreenFooter.tsx / .css          ← НОВЫЙ
      ScreenHeader.tsx / .css
      SearchField.tsx / .css           ← НОВЫЙ
      TextField.tsx / .css             ← НОВЫЙ
      EmptyState.tsx / .css            ← НОВЫЙ
      ExerciseInfo.tsx / .css
      icons.tsx                        — добавить LogoFull
  pages/
    Home.css                           — ужать с 110 до ~30 строк (только то, что специфично для Home)
    Login.css                          — ужать со 136 до ~60 (только лендинг-специфика: hero-bg, features-section)
    WorkoutSession.css                 — ужать с 227 до ~80 (только set-row, success-стейт)
    exercises/Exercises.css            — разнести в файлы по экранам ИЛИ оставить один (см. § 8.3)
    workouts/Workouts.css              — то же
```

Импорт в `main.tsx`:
```ts
import './styles/tokens.css';
import './styles/reset.css';
import './styles/typography.css';
import './styles/utilities.css';
```

### 8.3 Один CSS на feature vs по экранам

По [FRONTEND.md §4](./FRONTEND.md#4-bem) — один CSS на feature-папку. Оставляем это правило, но **в `Workouts.css` и `Exercises.css` после миграции должно остаться < 100 строк** (только то, что не уехало в утилиты/примитивы). Если осталось много — это сигнал, что не вынесли в систему.

---

## 9. Паттерны экранов

Чтобы не описывать каждый экран отдельно — все собраны из 4 базовых паттернов:

### 9.1 Form-screen (CreateExercise, CreateWorkout, FiltersPanel)

```tsx
<Screen withFooter>
  <div>
    <ScreenHeader title="..." onBack={...} />
    <Field label="..."><TextField ... /></Field>
    <Field label="..."><Dropdown ... /></Field>
  </div>
  <ScreenFooter>
    <Button variant="filled" flex>Сохранить</Button>
    <Button variant="outlined" flex>Отменить</Button>
  </ScreenFooter>
</Screen>
```

### 9.2 List-screen (Workouts, Exercises, Archive)

```tsx
<Screen>
  <h1 className="t-h1">Заголовок</h1>
  <Toolbar /* search + filter + add */ />
  <Section title="...">
    <ul>{items.map(i => <ListItem ... />)}</ul>
  </Section>
</Screen>
```

### 9.3 Detail-preview-screen (WorkoutDetail, ExerciseDetail)

```tsx
<Screen withFooter>
  <div>
    <ScreenHeader title="..." onBack={...} />
    {/* content */}
  </div>
  <ScreenFooter>
    <Button variant="filled" flex>Запустить</Button>
  </ScreenFooter>
</Screen>
```

### 9.4 Wizard-screen (WorkoutSession 3 шага)

Каждый шаг — самостоятельный `<Screen withFooter>`. Шаги переключаются через `step` state. Это уже так — корректно.

---

## 10. TZ — что надо фронтендеру сделать

> Это не «исправь вот это», это **миграция на дизайн-систему**. Делать поэтапно, каждый этап — отдельный коммит с проходящим `tsc` + `npm run build`.

### Этап 1 — починить баги и удалить мусор (быстро, ничего не ломает)

1. **[Layout.css:5](../frontend/src/components/Layout.css#L5)**: `--accent-dark: var(--accent-dark);` → `--accent-dark: #abd600;`. **Это критический баг — переменная сейчас undefined.**
2. **[index.css](../frontend/src/index.css)**: удалить `background: var(--bg-dark); color: #f1f1f1; font-family: 'Inter'`. Оставить только reset (`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`) и `#root { height: 100dvh; }`. Body-стили — только в `Layout.css`. Заодно унаследованный `*` reset из Layout.css удалить — оставить только в одном месте.
3. **[App.css](../frontend/src/App.css)**: удалить файл, удалить импорт (если есть).
4. **[Dashboard.tsx](../frontend/src/pages/Dashboard.tsx)**: убрать все inline-`style` — создать `Dashboard.css` или использовать `<Screen>` + `.t-h1` + `.t-body`.
5. **[Layout.tsx:134-140](../frontend/src/components/Layout.tsx#L134)**: убрать inline-`style` из error-state, добавить класс `.layout__error`.
6. **[Home.tsx:24](../frontend/src/pages/Home.tsx#L24)**: `PlayIcon` — `fill="#d8ff3b"` → `fill="currentColor"` (родитель — `.home__start-btn`, в нём `color: var(--accent)`). После миграции на `<Button>` это уйдёт само.
7. Дубль логотипа: вынести `<LogoFull />` в [components/ui/icons.tsx](../frontend/src/components/ui/icons.tsx), использовать в `Login.tsx` и `Home.tsx`. Удалить локальные `GantelkaLogo`/`GantelbkaLogo` (опечатка).
8. SVG nav-icons в [Layout.tsx](../frontend/src/components/Layout.tsx): `'#ABD600'` → `currentColor`, `fill={active ? 'currentColor' : 'none'} stroke="currentColor"`. CSS `.nav-item.active { color: var(--accent-dark) }` уже на месте.

### Этап 2 — токены и шкалы

9. Создать `src/styles/tokens.css`, перенести `:root` из `Layout.css`. Добавить новые: `--accent-dark` (фикс), `--surface`, `--surface-active`, `--surface-hover`, `--divider`, `--text-inverse`, `--shadow-sm`, размер-токены `--text-*`, отступы `--s-*`.
10. `Layout.css` — оставить только `.layout`, `.content`, `.bottom-nav`, `.nav-item`, `.stub-page`. Без `:root` и без `body`.

### Этап 3 — глобальные утилиты

11. Создать `src/styles/typography.css` с классами `.t-display`, `.t-h1`, `.t-h2`, `.t-body`, `.t-body-strong`, `.t-input`, `.t-caption`. Импортировать в `main.tsx`.
12. Создать `src/styles/utilities.css` с `.surface`, `.surface--active`, `.surface--sm-shadow`, `.divided-row`, `.chips-row`. Импортировать в `main.tsx`.

### Этап 4 — новые примитивы UI

13. `Screen.tsx` + `Screen.css` — § 7.1.
14. `ScreenFooter.tsx` + `ScreenFooter.css` — § 7.3.
15. `Field.tsx` + `Field.css` — § 7.4.
16. `TextField.tsx` + `TextField.css` — § 7.5. **Один компонент с `multiline` для textarea**, не два.
17. `SearchField.tsx` + `SearchField.css` — § 7.7. Поддержать два режима (trigger / full).
18. `Chip.tsx` + `Chip.css` — § 7.8.
19. `EmptyState.tsx` — § 7.9.
20. `LogoFull` в `icons.tsx`.

### Этап 5 — мигрировать существующие примитивы на токены

21. `Button.css` — переписать через `.surface`, `.t-body-strong`. Добавить вариант `size="lg"` (height 64). Снести override `.login__cta-stack .btn`.
22. `ListItem.css` — name через `.t-body`, meta через `.t-caption`. Использовать `.divided-row`.
23. `CheckboxRow.css` — то же, + `.surface--sm-shadow` для `__box`.
24. `SortableItem.css` — то же.
25. `Dropdown.css` — `.surface` + `.t-body-strong`. hover → `var(--surface-hover)`. Item — `.divided-row`.
26. `ScreenHeader.css` — title → `.t-h1`.
27. `ExerciseInfo.css` — переписать через `<Screen>` + `<Field>` + утилиты.

### Этап 6 — мигрировать страничные CSS

28. `Home.tsx` + `Home.css`: использовать `<Screen>`, `<LogoFull>`, заменить `.home__start-btn` на `<Button variant="filled">` (или вариант `inverse` если нужен чёрный фон — добавить в Button), `.home__nav-btn` → `<Button>`. Снести 70% `Home.css`.
29. `Login.tsx` + `Login.css`: оставить только лендинг-специфику (тёмная секция features, hero-padding). CTA кнопки через `<Button size="lg" />`.
30. `WorkoutSession.tsx` + `.css`: `<Screen>` + `<ScreenHeader>` + `<ScreenFooter>`. `session__input` → `<TextField>`. `session__icon-btn` → `<Button iconOnly>`. `session__add-set` → `<Button>`. `session__done` — это специальный toggle-button с двумя цветными состояниями (accent / accent-dark): рассмотреть либо как новый вариант `<Button variant="filled" active />`, либо оставить локальной кнопкой с пометкой «специфика сессии». Решение: **добавить `active` prop в `<Button>`** (для filled-варианта подсвечивает `--accent-dark`). Это переиспользуется для будущих «done» в других местах.
31. `pages/workouts/Workouts.css`: каждый экран — на `<Screen>` + `<ScreenFooter>` + `<Field>` + `<TextField>` + `<Chip>`. После миграции файл должен быть < 50 строк.
32. `pages/exercises/Exercises.css`: то же. Поиск — `<SearchField>`. Фильтры — `<Field>` + `<CheckboxRow>` + `<Dropdown>`. Toolbar `add/filter` — `<Button iconOnly>`.
33. `pages/exercises/CreateExercise.css`: `<Screen>` + `<Field>` + `<TextField>` + `<TextField multiline>` + `<Chip>`. После — файл удалить (всё уйдёт в утилиты).

### Этап 7 — verify

34. `grep -rn "background: #fff;" src/ --include='*.css'` → 0 совпадений (всё через `.surface`).
35. `grep -rn "font-family: var(--font-mono)" src/ --include='*.css'` → 1 совпадение (в `typography.css`).
36. `grep -rn "text-transform: uppercase" src/ --include='*.css'` → ~3 (в typography-классах).
37. `grep -rn "font-size: 20px\|font-size: 40px\|font-size: 12px" src/ --include='*.css'` → 0 за пределами `tokens.css`/`typography.css`.
38. `grep -rn "#abd600\|#ABD600\|#d8ff3b\|#D8FF3B" src/` → только в SVG-фолбэке логотипа.
39. `grep -rn "style={{" src/` → 0 (никаких inline-стилей).
40. `grep -rn "box-shadow: var(--shadow)\|box-shadow: 2px 2px" src/` → 0 за пределами `utilities.css`/`tokens.css`.
41. `npx tsc --noEmit -p tsconfig.app.json` — чисто.
42. `npm run build` — успешно.
43. Прокликать вручную в Chrome DevTools mobile (375×667): Login → Home (empty) → Workouts (создать) → Sessions → Date → Success → Home (with-workout). Проверить Exercises (поиск/фильтр/создать/детал). Проверить Profile.
44. Запись в [CHANGELOG.md](./CHANGELOG.md): «Дизайн-система: вынесены токены, типографика, surface, screen-layout в примитивы. Удалено ~600 строк дублирующего CSS».
45. Обновить [FRONTEND.md §1](./FRONTEND.md#1-ui-компоненты--таблица-переиспользования) и [TDR.md](./TDR.md#структура-файлов) под новую структуру.

### Прогресс-метрика

| Метрика | Сейчас | Цель |
|---|---|---|
| Строк CSS | ~1500 | ~800 |
| CSS-файлов в `pages/` | 6 | 6 (но тонких) |
| Файлов в `components/ui/` | 8 | 14 |
| Дублей паттерна `background:#fff; border:1px solid var(--border); box-shadow:var(--shadow)` | 15+ | 1 (`.surface`) |
| Inline-стилей в TSX | 4 места | 0 |
| Хардкод цветов вне tokens.css | 30+ | 0 (кроме инлайн-SVG логотипа) |
| Конфликтующих body-правил | 2 (index.css vs Layout.css) | 1 |

---

## 11. Что НЕ делать на этой миграции

- Не вводить CSS-in-JS / styled-components / Tailwind — слой остаётся «чистый CSS + BEM».
- Не вводить CSS Modules — у нас не такая сложность, чтобы оправдать.
- Не делать радиусов, gradients, transitions длиннее 0.15s — это меняет визуальный язык, нужно обсуждение.
- Не делать «универсальный» полиморфный `<Box>` / `<Stack>` — это путь к Bootstrap-style API, лучше явные `Screen` / `Field` / `ScreenFooter`.
- Не делать dark mode — продукт спроектирован вокруг светлой палитры + жёлтый акцент, dark — отдельный продукт-проект.
- Не выносить SVG-логотип во внешний файл, если это не даёт улучшения — текущий inline ок, главное — один компонент `<LogoFull />` вместо двух копий.
