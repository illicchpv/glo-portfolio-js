import {BaseComponent} from '../../components/base/BaseComponent.js';

export class NextTest extends BaseComponent {
  static get template() {
    return `
<style>
  .next-test {
    display: inline-block;
    border: 1px solid #ccc;
    padding: 10px;
    margin: 10px;
  }

  .user-list {
    margin-top: 10px;
    border-top: 1px dashed #999;
    padding-top: 10px;
  }

  .user-item {
    padding: 5px;
    border-bottom: 1px solid #eee;
  }
</style>

<div class="next-test">
  <h3>Next Test Component</h3>
  <div>Name: <span class="next-test__name"></span></div>
  <div>Age: <span class="next-test__age"></span></div>
  <div>Gender: <span class="next-test__gender"></span></div>
  <button class="next-test__btn">Action</button>

  <div class="user-list">
    <h4>Friends List (Inner Template Demo):</h4>
    <div class="list-container"></div>
  </div>
</div>

<!-- innerTemplate:list-item -->
<div class="user-item">
  <strong class="item-name">\${this.item.name}</strong>
  (<span class="item-role">\${this.item.role}</span>)
</div>
<!-- /innerTemplate -->
    `;
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