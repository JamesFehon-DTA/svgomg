import { strToEl } from '../utils.js';
import Prism from '../prism.js';

const prism = new Prism();

// Allowlist-based renderer for Prism's highlighted output. Prism's `markup`
// language only emits <span class="..."> wrappers around escaped text, so any
// other node is discarded as defense-in-depth against an XSS sink (CWE-79).
function appendSanitized(target, sourceNode) {
  for (const child of sourceNode.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      target.append(document.createTextNode(child.nodeValue));
    } else if (
      child.nodeType === Node.ELEMENT_NODE &&
      child.tagName === 'SPAN'
    ) {
      const span = document.createElement('span');
      const className = child.getAttribute('class');
      if (className) span.setAttribute('class', className);
      appendSanitized(span, child);
      target.append(span);
    }
  }
}

export default class CodeOutput {
  constructor() {
    // prettier-ignore
    this.container = strToEl(
      '<div class="code-output">' +
        '<pre><code></code></pre>' +
      '</div>'
    );
    this._codeEl = this.container.querySelector('code');
  }

  async setSvg({ text }) {
    const highlighted = await prism.highlight(text);
    const parsed = new DOMParser().parseFromString(
      `<body>${highlighted}</body>`,
      'text/html',
    );
    this._codeEl.replaceChildren();
    appendSanitized(this._codeEl, parsed.body);
  }

  reset() {
    this._codeEl.replaceChildren();
  }
}
