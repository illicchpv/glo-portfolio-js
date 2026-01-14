import {BaseComponent} from '../../components/base/BaseComponent.js';

export class NextTest extends BaseComponent {
  static get template() {
    return null;
  }

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
      {name: 'Pavel', role: 'Developer'},
      {name: 'Alice', role: 'Developer'},
      {name: 'Bob', role: 'Designer'},
      {name: 'Charlie', role: 'Manager'}
    ];
  }

  connectedCallback() {
    this.loadTemplate(import.meta.url);
    if (getComputedStyle(this).display !== 'block') this.style.display = 'block';

    // 1. Инициализируем адаптивные стили
    this._updateResponsiveStyles();

    // 2. Подписываемся на изменение размера окна
    this._resizeHandler = this._updateResponsiveStyles.bind(this);
    window.addEventListener('resize', this._resizeHandler);
  }

  disconnectedCallback() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
    // Если бы у BaseComponent был disconnectedCallback, мы бы вызвали super.disconnectedCallback()
  }

  /**
   * Управление адаптивными стилями через JS и CSS-переменные.
   * Вычисляет значения в зависимости от ширины окна.
   */
  _updateResponsiveStyles() {
    const w = window.innerWidth;
    const s = this.style;

    if (w <= 600) {
      // Диапазон: Мобильные
      s.setProperty('--h3-min', '18px');
      s.setProperty('--h3-max', '22px');
      // Fluid внутри диапазона 320-600
      const fluid = this.calculateFluidValue(320, 600, 18, 22);
      s.setProperty('--h3-fluid', `${fluid}px`);
    } else if (w > 600 && w < 1200) {
      // Диапазон: Планшеты
      s.setProperty('--h3-min', '22px');
      s.setProperty('--h3-max', '30px');
      // Fluid внутри диапазона 600-1200
      const fluid = this.calculateFluidValue(600, 1200, 22, 30);
      s.setProperty('--h3-fluid', `${fluid}px`);
    } else {
      // Диапазон: Десктопы
      s.setProperty('--h3-min', '30px');
      s.setProperty('--h3-max', '40px');
      // Fluid внутри диапазона 1200-1920
      const fluid = this.calculateFluidValue(1200, 1920, 30, 40);
      s.setProperty('--h3-fluid', `${fluid}px`);
    }
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
    const {btn} = this._refs;
    if (btn) {
      btn.addEventListener('click', () => {
        // Демонстрация evaluateString
        const greeting = this.evaluateString("Привет, ${this.userName}! Тебе ${this.userAge} лет.");
        console.log('Test evaluateString:', greeting);

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
    const {nameEl, ageEl, genderEl} = this._refs;
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
      this.renderInnerTemplateList(this.items, content, '.list-container');
    }
  }
}

customElements.define('next-test', NextTest);

/* применение компонента NextTest
  <next-test class="container"></next-test>
  <script type="module" src="components/NextTest/NextTest.js"></script>
*/