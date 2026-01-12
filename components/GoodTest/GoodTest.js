import {BaseComponent} from '../../components/base/BaseComponent.js';

export class GoodTest extends BaseComponent {
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
    const nameSpan = this.querySelector('.good-test__title span');
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
    const btn = this.querySelector('.good-test__btn');
    if (btn) {
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('good-test-action', {
          detail: {
            timestamp: new Date().toISOString(),
            message: `Кнопка нажата пользователем ${this._userName || 'Гость'}`
          },
          bubbles: true, // Событие всплывает
          composed: true // Проходит сквозь Shadow DOM (если бы он был)
        }));
      });
    }
    if(!btn) console.error('Кнопка не найдена в DOM!');
  }
}
customElements.define('good-test', GoodTest);

/* создание с обработкой сообщений компонента 👇
<script type="module" src="./components/GoodTest/GoodTest.js"></script>
<good-test>⭐Это контент, попадет в &lt;slot&gt;🙃&lt;/slot&gt;.</good-test>
<script>
  document.querySelector('good-test').addEventListener('good-test-action', (event) => {
    console.log('Событие от good-test!', event.detail);
  });
</script>
*/


