import { strToEl } from '../utils.js';
import Prism from '../prism.js';

const prism = new Prism();

// Prism's markup highlighter only emits <span class="..."> nodes around
// escaped text - drop anything else to avoid an innerHTML XSS sink.
function appendSanitized(target, source) {
  for (const child of source.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      target.append(child.nodeValue);
    } else if (child.tagName === 'SPAN') {
      const span = document.createElement('span');
      const className = child.getAttribute('class');
      if (className) span.className = className;
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
