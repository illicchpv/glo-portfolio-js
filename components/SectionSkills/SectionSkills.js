import { BaseComponent } from '../../components/base/BaseComponent.js';

export class SectionSkills extends BaseComponent {
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
      nameEl: this.querySelector('.section-skills__name'),
      ageEl: this.querySelector('.section-skills__age'),
      genderEl: this.querySelector('.section-skills__gender'),
      btn: this.querySelector('.section-skills__btn')
    };
  }

  _setupEventListeners() {
    const { btn } = this._refs;
    if (btn) {
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('section-skills-action', {
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

customElements.define('section-skills', SectionSkills);

/* Пример использования:
<section-skills user-name="User" user-age="25" is-male="true">
  <span style="color: red;">Slot content here</span>
  <span slot="slot2" style="color: green;">Slot2 content here</span>
</section-skills>
<script>
  document.querySelector('section-skills').addEventListener('section-skills-action', (event) => {
    console.log('Action:', event.detail);
  });
</script>
<script type="module" src="components/SectionSkills/SectionSkills.js"></script>
*/
