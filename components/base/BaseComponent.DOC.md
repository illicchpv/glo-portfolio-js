# BaseComponent — базовый класс для Web Components

Этот класс расширяет `HTMLElement` и добавляет:
- декларативные свойства;
- загрузку HTML-шаблонов по имени компонента;
- объединение стилей из шаблона;
- обработку слотов (именованных и default);
- условные блоки в HTML-комментариях;
- внутренние шаблоны (`innerTemplate`) для списков;
- вспомогательные методы `evaluateString` и `renderInnerTemplateList`;
- автоматическое исправление относительных путей к ресурсам (`src`).

Док ниже ориентирован на использование из наследников (`class MyComp extends BaseComponent`).

---

## 1. Декларативные свойства (`static get properties`)

BaseComponent позволяет описывать свойства компонента в статическом геттере:

```js
static get properties() {
  return {
    userName: {
      type: String,
      attribute: 'user-name',
      default: 'Guest'
    },
    userAge: {
      type: Number,
      attribute: 'user-age',
      default: 18
    },
    isActive: {
      type: Boolean,
      attribute: 'is-active',
      default: false
    }
  };
}
```

Что даёт:
- создаются геттеры/сеттеры `this.userName`, `this.userAge`, `this.isActive`;
- значения синхронизируются с атрибутами (`user-name`, `user-age`, `is-active`);
- при изменении свойства вызывается `propertyChangedCallback(name, oldValue, newValue)`;
- при изменении атрибута вызывается `attributeChangedCallback`, который обновляет свойство.

Типы:
- `Boolean` → наличие/отсутствие атрибута;
- `Number` → парсинг через `Number(...)`;
- `String` → как есть.

---

## 2. Загрузка HTML-шаблона (`loadTemplate`)

Шаблон ищется в той же папке, что и JS-файл компонента, по имени класса:
- компонент: `MyComponent.js`;
- шаблон: `MyComponent.html`.

В `connectedCallback` наследник обычно делает:

```js
connectedCallback() {
  this.loadTemplate(import.meta.url);
}
```

Метод:
- сохраняет `this.initialContent` (то, что было внутри тега при вставке на страницу);
- загружает `*.html`;
- прогоняет через `_processTemplate` (см. ниже);
- сохраняет исходный HTML в `this._rawHtml`;
- вызывает `forceUpdate()` для первой отрисовки.

---

## 3. Обработка стилей (`_processTemplate`)

В шаблоне можно писать теги `<style>`:
- BaseComponent собирает все стили в один блок;
- выносит их в `<head>` с id `style-ИмяКласса`;
- в HTML компонента теги `<style>` удаляются.

Эффект:
- стили компонента подключаются один раз;
- шаблон остаётся без лишних `<style>` внутри.

---

## 4. Слоты (default и именованные)

BaseComponent поддерживает:
- стандартный слот без имени: `<slot></slot>`;
- именованные слоты: `<slot name="header"></slot>`.

Механика:
- исходный контент, переданный в компонент, сохраняется в `this.initialContent`;
- при `render()`:
  - создаётся временный DOM с шаблоном (`this.html`);
  - туда «вклеиваются» узлы из `initialContent`:
    - элементы с `slot="name"` → в `<slot name="name">`;
    - остальные элементы/текст → в default `<slot>`.

Использование:
- в шаблоне компонента объявляете слоты;
- при использовании компонента передаёте содержимое внутрь тега.

---

## 5. Условные блоки в HTML (`_processConditionals`)

Поддерживается синтаксис:

```html
<!-- if(this.isActive) -->
  <div>Пользователь активен</div>
<!-- endif -->
```

Особенности:
- условие пишется как JS-выражение в контексте компонента (`this` доступен);
- если условие `true` → блок остаётся;
- если `false` → блок вырезается.

Назначение:
- простая логика отображения прямо в HTML-шаблоне;
- удобно для включения/выключения отдельных секций.

---

## 6. Внутренние шаблоны (`innerTemplate`)

Служат для декларативного описания разметки элементов списка внутри шаблона.

Синтаксис в HTML:

```html
<!-- innerTemplate:list-item -->
<div class="user-item">
  <strong class="item-name">${this.item.name}</strong>
  (<span class="item-role">${this.item.role}</span>)
</div>
<!-- /innerTemplate -->
```

Поведение:
- BaseComponent вырезает такие куски из HTML;
- сохраняет их в `this._innerTemplates[name] = content`;
- после рендеринга основного HTML вызывает:
  - `_processInnerTemplates(name, content)` для каждого шаблона.

Наследник может переопределить `_processInnerTemplates`, либо использовать вспомогательные методы (см. следующий раздел).

Ограничения:
- пока внутренние шаблоны нельзя вкладывать друг в друга;
- имя шаблона — `([\w-]+)`, то есть буквы/цифры/дефис.

---

## 7. `evaluateString` — шаблонные строки из обычного string

Метод:

```js
evaluateString(templateString)
```

Позволяет интерпретировать обычную строку как template literal JS:
- строка может содержать `${...}`;
- выражения внутри выполняются в контексте компонента (`this`).

Пример:

```js
const text = this.evaluateString('Привет, ${this.userName}! Тебе ${this.userAge} лет.');
```

Назначение:
- использовать шаблонные выражения внутри HTML-шаблонов (`innerTemplate`);
- генерировать текст на основе текущих свойств компонента.

Важно:
- метод использует `new Function`, поэтому строки должны быть из доверенного источника (ваш шаблон, а не пользовательский ввод).

---

## 8. `renderInnerTemplateList` — рендер списков из innerTemplate

Утилитарный метод для типичного сценария «массив данных + innerTemplate → список DOM-элементов».

Сигнатура:

```js
renderInnerTemplateList(items, templateContent, containerOrSelector)
```

Параметры:
- `items` — массив объектов (например, пользователей);
- `templateContent` — строка из `innerTemplate`;
- `containerOrSelector`:
  - либо CSS-селектор контейнера внутри компонента (`'.list-container'`);
  - либо сам DOM-элемент.

Механика:
- по селектору/элементу ищется контейнер;
- контейнер очищается (`innerHTML = ''`);
- для каждого `item`:
  - временно устанавливается `this.item = item`;
  - вызывается `evaluateString(templateContent)`;
  - полученный HTML вставляется через `insertAdjacentHTML('beforeend', ...)`;
- после цикла `this.item` удаляется.

Это позволяет писать innerTemplate так:

```html
<!-- innerTemplate:list-item -->
<div class="user-item">
  <strong>${this.item.name}</strong>
  (<span>${this.item.role}</span>)
</div>
<!-- /innerTemplate -->
```

А в компоненте просто вызывать:

```js
_processInnerTemplates(name, content) {
  if (name === 'list-item') {
    this.renderInnerTemplateList(this.items, content, '.list-container');
  }
}
```

---

## 9. Обработка внутренних шаблонов: `_processInnerTemplates`

Хук, который вызывается после основного рендера, для каждого innerTemplate:

```js
_processInnerTemplates(name, content) {
  // по умолчанию — ничего
}
```

Типичный сценарий:
- перебрать `this._innerTemplates` (BaseComponent делает это автоматически в `forceUpdate`);
- для нужных `name` вызвать `renderInnerTemplateList` или свою логику.

---

## 10. Автоматическое исправление путей (`_resolveImagePaths`)

Проблема:
- в шаблонах компонента удобно писать относительные пути вроде `../img/...`;
- после сборки/публикации структура файлов может измениться, и такие пути ломаются.

Решение:
- при `loadTemplate(baseUrl)` сохраняется `this._baseUrl = baseUrl` (обычно `import.meta.url`);
- после `render()` BaseComponent проходит по всем элементам с `src`;
- если `src` начинается с `./` или `../`, он переводится в абсолютный URL относительно `this._baseUrl`;
- для `<img>` обновляется свойство `src`, для остальных элементов — атрибут `src`.

Эффект:
- относительные пути внутри шаблона компонента остаются рабочими и в dev, и после публикации.

---

## 11. Общий жизненный цикл наследника

Типичный компонент на базе BaseComponent:

1. Описывает свойства через `static get properties`.
2. В `constructor` инициализирует своё состояние.
3. В `connectedCallback` вызывает `this.loadTemplate(import.meta.url)`.
4. Переопределяет `render()`, если нужно:
   - вызывает `super.render()`;
   - кэширует ссылки на элементы (`querySelector`);
   - навешивает обработчики событий;
   - вызывает `updateView()` для заполнения данных.
5. Переопределяет `propertyChangedCallback`, чтобы реагировать на изменения свойств.
6. При необходимости:
   - использует условные блоки `<!-- if(...) -->`;
   - определяет `innerTemplate` для списков и реализует `_processInnerTemplates`;
   - использует `renderInnerTemplateList` и `evaluateString`.

Так BaseComponent берёт на себя инфраструктуру (шаблоны, стили, свойства, слоты, условные блоки, списки), а наследник концентрируется на бизнес-логике и данных.

