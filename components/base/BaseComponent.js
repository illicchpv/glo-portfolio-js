export class BaseComponent extends HTMLElement {
  constructor() {
    super();
    this.html = null;
    this.initialContent = null;
  }

  /**
   * Загружает HTML шаблон с именем, совпадающим с именем класса компонента.
   * Шаблон ищется в той же директории, где находится файл компонента.
   * 
   * @param {string} baseUrl - URL текущего модуля (передайте import.meta.url из наследника)
   */
  async loadTemplate(baseUrl) {
    // Сохраняем исходный контент перед загрузкой шаблона
    if (this.innerHTML.trim()) {
      this.initialContent = this.innerHTML;
    }

    const templateName = `${this.constructor.name}.html`;
    const url = new URL(templateName, baseUrl).href;

    try {
      const response = await fetch(url);
      if (response.ok) {
        this.html = await response.text();
        this.render();
      } else {
        console.error(`Ошибка загрузки шаблона ${templateName}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Ошибка при запросе шаблона ${templateName}:`, error);
    }
  }

  render() {
    if (this.html) {
      // Если есть сохраненный контент, пытаемся вставить его в слот
      if (this.initialContent) {
        // Создаем временный контейнер для парсинга HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.html;

        // Ищем слот
        const slot = tempDiv.querySelector('slot');
        if (slot) {
          slot.innerHTML = this.initialContent;
          this.innerHTML = tempDiv.innerHTML;
          return;
        }
      }

      // Стандартное поведение
      this.innerHTML = this.html;
    }
  }
}
