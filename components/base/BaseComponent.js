export class BaseComponent extends HTMLElement {
  constructor() {
    super();
    this.html = null;
    this.initialContent = null;
    this._initProperties();
  }

  /**
   * Определяет наблюдаемые атрибуты на основе конфигурации properties.
   */
  static get observedAttributes() {
    const props = this.properties || {};
    return Object.values(props)
      .filter(prop => prop.attribute)
      .map(prop => prop.attribute);
  }

  /**
   * Конфигурация свойств компонента.
   * Переопределите этот геттер в дочернем классе.
   * @returns {Object}
   */
  static get properties() {
    return {};
  }

  /**
   * Инициализация свойств на основе статической конфигурации properties.
   */
  _initProperties() {
    const props = this.constructor.properties || {};

    Object.keys(props).forEach(name => {
      const config = props[name];
      const attributeName = config.attribute;

      // Инициализируем внутреннее значение
      const internalName = `_${name}`;

      // Определение начального значения
      // Приоритет: значение на экземпляре (поле класса) -> дефолтное из конфига -> null
      let initialValue = config.default;
      if (Object.prototype.hasOwnProperty.call(this, name)) {
        initialValue = this[name];
        // Удаляем свойство, чтобы оно не перекрывало будущие геттеры/сеттеры
        delete this[name];
      }

      this[internalName] = initialValue !== undefined ? initialValue : null;

      // Если в прототипе (классе) уже есть геттер/сеттер, мы его не переопределяем,
      // но предполагаем, что пользователь сам обработает логику.
      // Однако, для полной автоматизации, мы определяем свои аксессоры на экземпляре.
      // Чтобы позволить пользователю переопределять, проверим наличие в прототипе:
      // const hasPrototypeGetter = ... 
      // В данном простом варианте мы всегда создаем аксессоры на экземпляре, 
      // если пользователь запросил это через properties.

      Object.defineProperty(this, name, {
        get() {
          return this[internalName];
        },
        set(value) {
          const oldValue = this[internalName];
          this[internalName] = value;

          // Отражение свойства в атрибут
          if (attributeName) {
            if (value === null || value === undefined || value === false) {
              this.removeAttribute(attributeName);
            } else {
              const attrValue = config.type === Boolean ? '' : String(value);
              if (this.getAttribute(attributeName) !== attrValue) {
                this.setAttribute(attributeName, attrValue);
              }
            }
          }

          if (oldValue !== value) {
            this.propertyChangedCallback(name, oldValue, value);
          }
        },
        configurable: true,
        enumerable: true
      });

      // Применяем начальное значение через сеттер, чтобы синхронизировать атрибуты
      if (this[internalName] !== null && this[internalName] !== undefined) {
        // Вызываем сеттер, но аккуратно, чтобы не триггерить лишние колбэки если не надо
        // Но нам надо синхронизировать атрибут
        const val = this[internalName];
        // Сброс для триггера сеттера (немного хак, но надежно)
        // this[name] = val; 
        // Проще вручную выставить атрибут если его нет
        if (attributeName && !this.hasAttribute(attributeName)) {
          if (val !== null && val !== undefined && val !== false) {
            const attrValue = config.type === Boolean ? '' : String(val);
            this.setAttribute(attributeName, attrValue);
          }
        }
      }
    });
  }

  /**
   * Обработчик изменений атрибутов.
   * Автоматически синхронизирует атрибуты со свойствами.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    const props = this.constructor.properties || {};

    for (const propName in props) {
      const config = props[propName];
      if (config.attribute === name) {
        let value = newValue;

        // Приведение типов
        if (config.type === Boolean) {
          value = newValue !== null;
        } else if (config.type === Number) {
          value = Number(newValue);
        }

        // Устанавливаем свойство (вызовет сеттер)
        // Проверяем, отличается ли значение, чтобы избежать рекурсии, 
        // хотя сеттер сам проверит getAttribute
        if (this[propName] !== value) {
          this[propName] = value;
        }
        break;
      }
    }
  }

  /**
   * Хук, вызываемый при изменении свойства через сеттер.
   * @param {string} name 
   * @param {any} oldValue 
   * @param {any} newValue 
   */
  propertyChangedCallback(name, oldValue, newValue) { }

  /**
   * Загружает HTML шаблон с именем, совпадающим с именем класса компонента.
   * Шаблон ищется в той же директории, где находится файл компонента.
   * 
   * @param {string} baseUrl - URL текущего модуля (передайте import.meta.url из наследника)
   */
  async loadTemplate(baseUrl) {
    // Сохраняем baseUrl для последующего разрешения путей
    this._baseUrl = baseUrl;

    // Сохраняем исходный контент перед загрузкой шаблона
    if (this.innerHTML.trim()) {
      this.initialContent = this.innerHTML;
    }

    const templateName = `${this.constructor.name}.html`;
    const url = new URL(templateName, baseUrl).href;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const rawHtml = await response.text();
        // Сохраняем сырой шаблон
        this._rawHtml = this._processTemplate(rawHtml);
        // Обрабатываем условия и рендерим
        this.forceUpdate();
      } else {
        console.error(`Ошибка загрузки шаблона ${templateName}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Ошибка при запросе шаблона ${templateName}:`, error);
    }
  }

  /**
   * Принудительно обновляет отображение, заново обрабатывая условия в шаблоне.
   */
  forceUpdate() {
    if (this._rawHtml) {
      // 1. Сначала обрабатываем условные конструкции
      let processedHtml = this._processConditionals(this._rawHtml);

      // 2. Затем извлекаем внутренние шаблоны (вырезаем их из HTML)
      const {html, templates} = this._extractInnerTemplates(processedHtml);
      this._innerTemplates = templates;

      // 3. Устанавливаем основной HTML и рендерим
      this.html = html;
      this.render();

      // 4. После рендера (когда DOM готов) вызываем обработчики внутренних шаблонов
      if (Object.keys(this._innerTemplates).length > 0) {
        Object.entries(this._innerTemplates).forEach(([name, content]) => {
          this._processInnerTemplates(name, content);
        });
      }
    }
  }

  /**
   * Извлекает внутренние шаблоны <!-- innerTemplate:name -->...<!-- /innerTemplate -->
   * @param {string} html 
   * @returns {{html: string, templates: Object}}
   */
  _extractInnerTemplates(html) {
    const templates = {};
    // Ищем <!-- innerTemplate:name -->content<!-- /innerTemplate -->
    // ([\w-]+) - захватывает имя шаблона (буквы, цифры, дефис)
    // ([\s\S]*?) - лениво захватывает контент
    const regex = /<!--\s*innerTemplate:([\w-]+)\s*-->([\s\S]*?)<!--\s*\/innerTemplate\s*-->/g;

    const cleanHtml = html.replace(regex, (match, name, content) => {
      templates[name] = content;
      return ''; // Удаляем шаблон из основного HTML
    });

    return {html: cleanHtml, templates};
  }

  /**
   * Обработчик внутренних шаблонов.
   * Переопределите этот метод в компоненте для рендеринга списков/коллекций.
   * @param {string} name - Имя шаблона
   * @param {string} content - HTML содержимое шаблона
   */
  _processInnerTemplates(name, content) {
    // По умолчанию ничего не делает.
    // В наследнике:
    // if (name === 'my-item') { ... }
  }

  /**
   * Обрабатывает условные конструкции <!-- if(...) --> ... <!-- endif -->
   * @param {string} html 
   * @returns {string} HTML с обработанными условиями
   */
  _processConditionals(html) {
    // Регулярное выражение для поиска блоков if
    // Ищем <!-- if(condition) --> content <!-- endif -->
    // [\s\S]*? - ленивый поиск любого символа, включая переносы строк
    const regex = /<!--\s*if\((.*?)\)\s*-->([\s\S]*?)<!--\s*endif\s*-->/g;

    return html.replace(regex, (match, condition, content) => {
      try {
        // Создаем функцию для проверки условия в контексте компонента
        // Используем new Function вместо eval для чуть большей изоляции (хотя всё равно доступ к this)
        const checkCondition = new Function('return ' + condition);

        // Вызываем функцию с привязкой к текущему экземпляру (this)
        if (checkCondition.call(this)) {
          return content;
        } else {
          return '';
        }
      } catch (e) {
        console.error(`Ошибка при вычислении условия "${condition}":`, e);
        return match; // В случае ошибки возвращаем как было
      }
    });
  }

  /**
   * Вычисляет строку как шаблонную литералу в контексте компонента.
   * Позволяет использовать выражения типа "Привет, ${this.userName}"
   * @param {string} templateString 
   * @returns {string}
   */
  evaluateString(templateString) {
    try {
      return new Function('return `' + templateString + '`').call(this);
    } catch (e) {
      console.error('Ошибка при вычислении шаблонной строки:', e);
      return templateString;
    }
  }

  renderInnerTemplateList(items, templateContent, containerOrSelector) {
    const container = typeof containerOrSelector === 'string'
      ? this.querySelector(containerOrSelector)
      : containerOrSelector;

    if (!container || !Array.isArray(items)) return;

    container.innerHTML = '';

    items.forEach(item => {
      this.item = item;
      const itemHtml = this.evaluateString(templateContent);
      container.insertAdjacentHTML('beforeend', itemHtml);
    });

    delete this.item;
  }

  /**
   * Обрабатывает шаблон: объединяет все стили в один блок и выносит в head.
   * @param {string} htmlContent 
   * @returns {string} HTML без стилей
   */
  _processTemplate(htmlContent) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Ищем все теги style
    const styles = tempDiv.querySelectorAll('style');

    if (styles.length > 0) {
      const styleId = `style-${this.constructor.name}`;

      // Если такого стиля еще нет в head, собираем все и добавляем
      if (!document.getElementById(styleId)) {
        let mergedCss = '';
        styles.forEach(style => {
          mergedCss += style.textContent + '\n';
          style.remove();
        });

        if (mergedCss.trim()) {
          const newStyle = document.createElement('style');
          newStyle.id = styleId;
          newStyle.textContent = mergedCss;
          document.head.appendChild(newStyle);
        }
      } else {
        // Если стиль уже есть, просто удаляем теги из шаблона
        styles.forEach(style => style.remove());
      }
    }

    return tempDiv.innerHTML;
  }

  render() {
    if (this.html) {
      const templateDiv = document.createElement('div');
      templateDiv.innerHTML = this.html;

      if (this.initialContent) {
        const userContentDiv = document.createElement('div');
        userContentDiv.innerHTML = this.initialContent;

        // 1. Обработка именованных слотов
        const namedSlots = templateDiv.querySelectorAll('slot[name]');
        namedSlots.forEach(slot => {
          const slotName = slot.getAttribute('name');
          const userElements = userContentDiv.querySelectorAll(`[slot="${slotName}"]`);

          if (userElements.length > 0) {
            slot.innerHTML = '';
            userElements.forEach(el => slot.appendChild(el));
          }
        });

        // 2. Обработка дефолтного слота
        const defaultSlot = templateDiv.querySelector('slot:not([name])');
        if (defaultSlot) {
          const defaultNodes = Array.from(userContentDiv.childNodes).filter(node => {
            // Исключаем элементы, у которых есть атрибут slot (даже если они не нашли пару)
            return node.nodeType !== Node.ELEMENT_NODE || !node.hasAttribute('slot');
          });

          // Если есть полезный контент (не только пробелы)
          const hasContent = defaultNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE || (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '')
          );

          if (hasContent) {
            defaultSlot.innerHTML = '';
            defaultNodes.forEach(node => defaultSlot.appendChild(node));
          }
        }
      }

      this.innerHTML = templateDiv.innerHTML;
      this._resolveImagePaths();
    }
  }

  /**
   * Разрешает относительные пути к изображениям и ресурсам
   */
  _resolveImagePaths() {
    if (!this._baseUrl) return;

    // Находим все элементы с атрибутом src
    const elements = this.querySelectorAll('[src]');

    elements.forEach(el => {
      const src = el.getAttribute('src');
      if (src && (src.startsWith('./') || src.startsWith('../'))) {
        try {
          // Вычисляем абсолютный путь относительно JS файла компонента
          const absoluteSrc = new URL(src, this._baseUrl).href;

          // Для img обновляем свойство src (и атрибут)
          if (el.tagName === 'IMG') {
            el.src = absoluteSrc;
          }
          // Для остальных (custom elements) обновляем атрибут
          else {
            el.setAttribute('src', absoluteSrc);
          }
        } catch (e) {
          console.warn('Failed to resolve path:', src, e);
        }
      }
    });
  }
}
