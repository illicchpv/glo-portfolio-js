# BaseComponent — шпаргалка

Минимальный объём, чтобы быстро вспомнить, что есть в BaseComponent.

---

## 1. Базовый паттерн компонента

- Наследуемся:
  - `class MyComp extends BaseComponent {}`
- Свойства:
  - `static get properties() { return { title: { type: String, attribute: 'title', default: '' } }; }`
- Жизненный цикл:
  - `constructor()` — инициализация своего состояния;
  - `connectedCallback() { this.loadTemplate(import.meta.url); }`
  - `render()`:
    - `super.render();`
    - кэшируем элементы (`querySelector`);
    - вешаем события;
    - вызываем `updateView()`.

---

## 2. Шаблон и стили

- HTML-шаблон:
  - рядом с JS;
  - имя = имени класса (`MyComp.html`).
- **Статический шаблон (New!)**:
  - `static get template() { return \`...\`; }`
  - Если есть, файл не грузится (нет моргания). Экранируйте внутренние переменные как \${this...}.
- `loadTemplate(import.meta.url)`:
  - грузит HTML (или берёт статический);
  - собирает `<style>` в `<head>` c id `style-ИмяКласса`;
  - сохраняет сырой HTML в `_rawHtml`;
  - вызывает `forceUpdate()`.

---

## 3. Свойства и атрибуты

- Описываем в `static get properties()`.
- Типы:
  - `String`, `Number`, `Boolean`.
- Синхронизация:
  - свойство ↔ атрибут (имя берётся из `attribute`);
  - при изменении свойства → `propertyChangedCallback(name, oldValue, newValue)`;
  - при изменении атрибута → обновление свойства.

---

## 4. Слоты

- В шаблоне:
  - default: `<slot></slot>`;
  - именованный: `<slot name="header"></slot>`.
- В разметке:
  - `<my-comp><div>default</div><div slot="header">header</div></my-comp>`
- `render()`:
  - берёт `initialContent`;
  - раскладывает его по слотам (именованные и default) внутри шаблона.

---

## 5. Условные блоки

- Синтаксис в HTML:

  - `<!-- if(this.isActive) --> ... <!-- endif -->`

- Логика:
  - выражение выполняется в контексте компонента (`this`);
  - `true` → блок оставляем;
  - `false` → вырезаем.
- Место применения:
  - простые включения/выключения фрагментов разметки.

---

## 6. innerTemplate

- В шаблоне:

  ```html
  <!-- innerTemplate:list-item -->
  <div class="user-item">
    <strong>${this.item.name}</strong>
    (<span>${this.item.role}</span>)
  </div>
  <!-- /innerTemplate -->
  ```

- BaseComponent:
  - вырезает фрагмент;
  - кладёт в `this._innerTemplates['list-item']`;
  - после рендера вызывает `_processInnerTemplates(name, content)`.

---

## 7. evaluateString

- Метод:
  - `evaluateString(templateString)`
- Что делает:
  - интерпретирует строку как template literal JS;
  - `${...}` выполняется в контексте компонента (`this`).
- Пример:
  - `this.evaluateString('Привет, ${this.userName}!')`
- Использование:
  - внутри innerTemplate (доступно `this.item`, `this.userName` и т.д.);
  - для генерации динамических текстов без внешних шаблонизаторов.

---

## 8. renderInnerTemplateList

- Сигнатура:

  - `renderInnerTemplateList(items, templateContent, containerOrSelector)`

- Параметры:
  - `items` — массив данных;
  - `templateContent` — строка innerTemplate;
  - `containerOrSelector` — селектор контейнера или сам элемент.

- Как работает:
  - ищет контейнер;
  - очищает его;
  - для каждого `item`:
    - `this.item = item;`
    - `const html = this.evaluateString(templateContent);`
    - `container.insertAdjacentHTML('beforeend', html);`
  - после цикла `delete this.item`.

- Типичный вызов в `_processInnerTemplates`:

  ```js
  _processInnerTemplates(name, content) {
    if (name === 'list-item') {
      this.renderInnerTemplateList(this.items, content, '.list-container');
    }
  }
  ```

---

## 9. Автоисправление путей к ресурсам

- В шаблоне можно писать:
  - `<img src="../img/pic.png">`
- `loadTemplate(import.meta.url)`:
  - сохраняет `this._baseUrl` (URL JS-файла компонента).
- После `render()`:
  - `_resolveImagePaths()`:
    - ищет все `[src]`;
    - для `./` и `../` строит абсолютный URL на основе `this._baseUrl`;
    - обновляет `src` у `<img>` и атрибут `src` у прочих элементов.

---

## 10. Быстрый чек-лист при создании компонента

1. Наследуемся от `BaseComponent`.
2. Описываем `static get properties()`.
3. В `connectedCallback` вызываем `this.loadTemplate(import.meta.url)`.
4. В `render()`:
   - `super.render();`
   - кэшируем элементы, вешаем события;
   - вызываем `updateView()`.
5. Используем при необходимости:
   - слоты;
   - `<!-- if(...) -->`;
   - `innerTemplate` + `_processInnerTemplates` + `renderInnerTemplateList`;
   - `evaluateString` для текстов;
   - относительные пути `src` в шаблоне (автофикc BaseComponent).

