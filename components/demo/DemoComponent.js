import { BaseComponent } from '../base/BaseComponent.js';

export class DemoComponent extends BaseComponent {
  
    connectedCallback() {
        this.loadTemplate(import.meta.url);
    }
}

customElements.define('demo-component', DemoComponent);
