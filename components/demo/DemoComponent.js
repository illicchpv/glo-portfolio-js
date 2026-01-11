import { BaseComponent } from '../base/BaseComponent.js';

export class DemoComponent extends BaseComponent {
    
    // Указываем, за какими атрибутами следить
    static get observedAttributes() {
        return ['user-name'];
    }

    constructor() {
        super();
        this._counter = 0; // Внутреннее состояние, не отображаемое на атрибут
    }

    get counter() {
        return this._counter;
    }

    set counter(value) {
        this._counter = value;
        console.log(`Counter updated: ${this._counter}`);
        // Тут можно добавить логику обновления интерфейса, если нужно
    }

    get userName() {
        return this.getAttribute('user-name');
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

    // Реакция на изменение атрибутов
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'user-name' && oldValue !== newValue) {
            this._updateUserName();
        }
    }

    _updateUserName() {
        // Проверяем, загружен ли уже HTML
        const nameSpan = this.querySelector('#username-display');
        if (nameSpan) {
            nameSpan.textContent = this.getAttribute('user-name') || 'Гость';
        }
    }

    _setupEventListeners() {
        const btn = this.querySelector('#action-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('demo-action', {
                    detail: {
                        timestamp: new Date().toISOString(),
                        message: `Кнопка нажата пользователем ${this.getAttribute('user-name') || 'Гость'}`
                    },
                    bubbles: true, // Событие всплывает
                    composed: true // Проходит сквозь Shadow DOM (если бы он был)
                }));
            });
        }
    }
}

customElements.define('demo-component', DemoComponent);
