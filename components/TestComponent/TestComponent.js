import { BaseComponent } from '../base/BaseComponent.js';

export class TestComponent extends BaseComponent {
  // Конфигурация свойств
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
  }

  connectedCallback() {
    this.loadTemplate(import.meta.url);
  }

  // Переопределяем render, чтобы обновлять данные
  render() {
    super.render();
    this._cacheElements();
    this.updateView();
    this._setupEventListeners();
  }

  _cacheElements() {
    this._refs = {
      nameEl: this.querySelector('.test-component__name'),
      ageEl: this.querySelector('.test-component__age'),
      genderEl: this.querySelector('.test-component__gender'),
      btn: this.querySelector('.test-component__btn')
    };
  }

  _setupEventListeners() {
    const { btn } = this._refs;
    if (btn) {
      // Удаляем старый слушатель, если он был (хотя при полном рендере это новый элемент)
      // Но для чистоты можно использовать { once: true } или сохранять ссылку на функцию
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('test-component-action', {
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

  // Хук изменения свойств из BaseComponent
  propertyChangedCallback(name, oldValue, newValue) {
    // console.log(`Property ${name} changed from ${oldValue} to ${newValue}`);
    // Если компонент уже отрисован, обновляем вид
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
}

customElements.define('test-component', TestComponent);
