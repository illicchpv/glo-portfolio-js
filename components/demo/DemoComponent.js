import {BaseComponent} from '../base/BaseComponent.js';

export class DemoComponent extends BaseComponent {
  constructor() {
    super();
    this._userName = null;
  }

  // Указываем, за какими атрибутами следить
  static get observedAttributes() {
    return ['user-name'];
  }

  // Реакция на изменение атрибутов
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'user-name' && oldValue !== newValue) {
      this._userName = newValue;
      this._updateUserName();
    }
  }

  _updateUserName() {
    // Проверяем, загружен ли уже HTML
    const nameSpan = this.querySelector('#username-display');
    if (nameSpan) {
      nameSpan.textContent = this._userName || 'Гость';
    }
  }

  get userName() {
    return this._userName;
  }

  set userName(value) {
    if (value) {
      this.setAttribute('user-name', value);
    } else {
      this.removeAttribute('user-name');
    }
  }

  connectedCallback() {
    this.loadTemplate(import.meta.url);
  }

  // Вызывается при загрузке шаблона (из BaseComponent)
  render() {
    super.render();
    this._updateUserName();
    this._setupEventListeners();
  }

  _setupEventListeners() {
    const btn = this.querySelector('#action-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('demo-action', {
          detail: {
            timestamp: new Date().toISOString(),
            message: `Кнопка нажата пользователем ${this._userName || 'Гость'}`
          },
          bubbles: true, // Событие всплывает
          composed: true // Проходит сквозь Shadow DOM (если бы он был)
        }));
      });
    }
  }
}

customElements.define('demo-component', DemoComponent);
