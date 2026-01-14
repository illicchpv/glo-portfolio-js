import {BaseComponent} from '../../components/base/BaseComponent.js';

export class SectionFeedback extends BaseComponent {
//   static get template() {
//     return `
//     `;
//   }

  constructor() {
    super();
  }

  connectedCallback() {
    this.loadTemplate(import.meta.url);
    if (getComputedStyle(this).display !== 'block') this.style.display = 'block'; //??? 
  }

  render() {
    super.render();
  }
}

customElements.define('section-feedback', SectionFeedback);

/* Пример использования:
<section-feedback></section-feedback>
<script type="module" src="components/SectionFeedback/SectionFeedback.js"></script>
*/
