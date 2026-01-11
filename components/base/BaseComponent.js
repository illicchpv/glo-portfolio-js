export class BaseComponent extends HTMLElement {
  constructor() {
    super();
    this.html = null;
  }

  /**
   * Загружает HTML шаблон с именем, совпадающим с именем класса компонента.
   * Шаблон ищется в той же директории, где находится файл компонента.
   * 
   * @param {string} baseUrl - URL текущего модуля (передайте import.meta.url из наследника)
   */
  async loadTemplate(baseUrl) {
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
      this.innerHTML = this.html;
    }
  }
}
