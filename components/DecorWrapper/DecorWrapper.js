import { BaseComponent } from '../../components/base/BaseComponent.js';

export class DecorWrapper extends BaseComponent {
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
    if (getComputedStyle(this).display !== 'block') this.style.display = 'block'; //??? 
  }

  render() {
    super.render();
    this._cacheElements();
    this.updateView();
    this._setupEventListeners();
  }

  _cacheElements() {
    this._refs = {
      nameEl: this.querySelector('.decor-wrapper__name'),
      ageEl: this.querySelector('.decor-wrapper__age'),
      genderEl: this.querySelector('.decor-wrapper__gender'),
      btn: this.querySelector('.decor-wrapper__btn')
    };
  }

  _setupEventListeners() {
    const { btn } = this._refs;
    if (btn) {
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('decor-wrapper-action', {
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
}

customElements.define('decor-wrapper', DecorWrapper);

/* Пример использования:
<decor-wrapper user-name="User" user-age="25" is-male="true">
  <span style="color: red;">Slot content here</span>
  <span slot="slot2" style="color: green;">Slot2 content here</span>
</decor-wrapper>
<script>
  document.querySelector('decor-wrapper').addEventListener('decor-wrapper-action', (event) => {
    console.log('Action:', event.detail);
  });
</script>
<script type="module" src="components/DecorWrapper/DecorWrapper.js"></script>
*/
