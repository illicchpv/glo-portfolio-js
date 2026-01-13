import { BaseComponent } from '../../components/base/BaseComponent.js';

export class BtnLink extends BaseComponent {
  static get properties() {
    return {
      src: {
        type: String,
        attribute: 'src',
        default: '?src?'
      },
      href: {
        type: String,
        attribute: 'href',
        default: '?href?'
      },
      attr: {
        type: String,
        attribute: 'attr',
        default: ''
      },
      alt: {
        type: String,
        attribute: 'alt',
        default: '?alt?'
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
    if (getComputedStyle(this).display !== 'block') this.style.display = 'inline-block'; //??? 
  }

  render() {
    super.render();
    this._cacheElements();
    this.updateView();
    // this._setupEventListeners();
  }

  _cacheElements() {
    this._refs = {
      srcEl: this.querySelector('.btn-link-icon'),
      altEl: this.querySelector('.btn-link-icon'),
      hrefEl: this.querySelector('.btn-link'),
      attrEl: this.querySelector('.btn-link'),
    };
  }

  propertyChangedCallback(name, oldValue, newValue) {
    if (this.html) {
      this.updateView();
    }
  }

  // _setupEventListeners() {
  // }

  updateView() {
    const { srcEl, hrefEl, attrEl, altEl } = this._refs;
    if (srcEl) srcEl.setAttribute('src', this.src);
    if (altEl) srcEl.setAttribute('alt', this.alt);

    if (hrefEl) hrefEl.setAttribute('href', this.href);
    if (attrEl) {
      if(this.attr)
        attrEl.setAttribute(this.attr, '');
      else
        attrEl.removeAttribute(this.attr);
    }
  }
}

customElements.define('btn-link', BtnLink);

/* Пример использования:
<btn-link>
  <div style="color: red;">Slot content here</div>
</btn-link>
<script>
  document.querySelector('btn-link').addEventListener('btn-link-action', (event) => {
    console.log('Action:', event.detail);
  });
</script>
<script type="module" src="components/BtnLink/BtnLink.js"></script>
*/
