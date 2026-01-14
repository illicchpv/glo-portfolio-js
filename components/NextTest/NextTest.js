import { BaseComponent } from '../../components/base/BaseComponent.js';

export class NextTest extends BaseComponent {
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
      isMale: {
        type: Boolean,
        attribute: 'is-male',
        default: false
      }
    };
  }

  constructor() {
    super();
    this._refs = {};
    // Данные для демонстрации списка через innerTemplate
    this.items = [
      { name: 'Alice', role: 'Developer' },
      { name: 'Bob', role: 'Designer' },
      { name: 'Charlie', role: 'Manager' }
    ];
  }

  connectedCallback() {
    this.loadTemplate(import.meta.url);
    if (getComputedStyle(this).display !== 'block') this.style.display = 'block'; 
  }

  render() {
    super.render();
    this._cacheElements();
    this.updateView();
    this._setupEventListeners();
  }

  _cacheElements() {
    this._refs = {
      nameEl: this.querySelector('.next-test__name'),
      ageEl: this.querySelector('.next-test__age'),
      genderEl: this.querySelector('.next-test__gender'),
      btn: this.querySelector('.next-test__btn'),
      listContainer: this.querySelector('.list-container')
    };
  }

  _setupEventListeners() {
    const { btn } = this._refs;
    if (btn) {
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('next-test-action', {
          detail: {
            userName: this.userName,
            userAge: this.userAge,
            isMale: this.isMale,
            component: this
          },
          bubbles: true,
          composed: true
        }));
      });
    }
  }

  propertyChangedCallback(name, oldValue, newValue) {
    if (this.html) {
      this.updateView();
    }
  }

  updateView() {
    const { nameEl, ageEl, genderEl } = this._refs;
    if (nameEl) nameEl.textContent = this.userName;
    if (ageEl) ageEl.textContent = this.userAge;
    if (genderEl) genderEl.textContent = this.isMale ? 'Yes' : 'No';
  }

  /**
   * Обработка внутренних шаблонов.
   * Вызывается автоматически из BaseComponent.forceUpdate()
   */
  _processInnerTemplates(name, content) {
    if (name === 'list-item') {
      const container = this.querySelector('.list-container');
      if (container && this.items && Array.isArray(this.items)) {
        container.innerHTML = ''; // Очищаем контейнер

        this.items.forEach(item => {
          // Создаем временный элемент для парсинга HTML шаблона
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content;

          // Заполняем данными
          const nameEl = tempDiv.querySelector('.item-name');
          if (nameEl) nameEl.textContent = item.name;

          const roleEl = tempDiv.querySelector('.item-role');
          if (roleEl) roleEl.textContent = item.role;

          // Переносим элементы в контейнер
          // Используем Array.from, так как childNodes - живая коллекция
          Array.from(tempDiv.childNodes).forEach(node => {
            container.appendChild(node);
          });
        });
      }
    }
  }
}

customElements.define('next-test', NextTest);
