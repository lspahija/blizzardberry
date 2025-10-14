import { state } from './state';
import { persistMessage } from './api';
import { Parser } from 'expr-eval';

export async function addVisualizationToMessage(visualizationResult) {
  if (!visualizationResult || visualizationResult.type !== 'visualization') {
    return;
  }

  // Check if this is an SVG from LLM
  if (visualizationResult.svg) {
    const containerId = `svg-viz-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const encodedSvg = encodeURIComponent(visualizationResult.svg);

    const html = `
      <div class="viz-card viz-card--compact" data-svg-container="${containerId}" style="width: 100%; margin: 6px 0;">
        <div class="viz-chip viz-chip--left">
          <svg class="viz-chip-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
          </svg>
          <span class="viz-chip-text">View Chart</span>
        </div>
        <div data-svg-content="${encodedSvg}" style="display: none;"></div>
      </div>
    `;

    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.parts.push({ type: 'html', content: html });
      await persistMessage(lastMessage);
      setTimeout(() => {
        attachSvgClickHandler(containerId);
      }, 100);
    }
    return;
  }

  // Check if this is a base64 image from LLM code execution
  if (visualizationResult.image) {
    const containerId = `img-viz-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const encodedImage = encodeURIComponent(visualizationResult.image);

    const html = `
      <div class="viz-card viz-card--compact" data-img-container="${containerId}" style="width: 100%; margin: 6px 0;">
        <div class="viz-chip viz-chip--left">
          <svg class="viz-chip-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
          </svg>
          <span class="viz-chip-text">View Chart</span>
        </div>
        <div data-img-content="${encodedImage}" style="display: none;"></div>
      </div>
    `;

    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.parts.push({ type: 'html', content: html });
      await persistMessage(lastMessage);
      setTimeout(() => {
        attachImageClickHandler(containerId);
      }, 100);
    }
    return;
  }
}

// SVG modal helpers
function attachSvgClickHandler(containerId) {
  const card = document.querySelector(`[data-svg-container="${containerId}"]`);
  if (!card || card.dataset.bound === '1') return;
  card.dataset.bound = '1';

  card.addEventListener('click', (e) => {
    e.stopPropagation();
    const svgData = card.querySelector('[data-svg-content]');
    if (svgData) {
      const svg = decodeURIComponent(svgData.dataset.svgContent);
      openSvgModal(svg);
    }
  });
}

function openSvgModal(svgContent) {
  let backdrop = document.getElementById('vizModalBackdrop');
  if (!backdrop) {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="vizModalBackdrop" class="viz-modal-backdrop">
        <div class="viz-modal viz-modal--svg" role="dialog" aria-modal="true">
          <button class="viz-modal-close-icon" id="vizModalCloseBtn" aria-label="Close">×</button>
          <div class="viz-modal-content viz-modal-content--svg">
            <div id="vizModalSvgContainer"></div>
          </div>
        </div>
      </div>
    `;
    const node = container.firstElementChild;
    if (node) document.body.appendChild(node);
    backdrop = document.getElementById('vizModalBackdrop');
  }

  const closeBtn = document.getElementById('vizModalCloseBtn');
  const svgContainer = document.getElementById('vizModalSvgContainer');

  backdrop.classList.add('visible');
  const prevOverflow = document.body.style.overflow;
  document.body.dataset.prevOverflow = prevOverflow;
  document.body.style.overflow = 'hidden';

  // Insert SVG (sanitize arithmetic expressions first)
  const sanitizedSvg = sanitizeSvgExpressions(svgContent);
  svgContainer.innerHTML = sanitizedSvg;

  const onKey = (ev) => {
    if (ev.key === 'Escape') {
      closeModal();
    }
  };

  const onBackdropClick = (ev) => {
    if (ev.target === backdrop) {
      closeModal();
    }
  };

  const onClose = () => closeModal();

  document.addEventListener('keydown', onKey);
  backdrop.addEventListener('click', onBackdropClick, { once: true });
  if (closeBtn) closeBtn.addEventListener('click', onClose, { once: true });

  backdrop.__cleanup = () => {
    document.removeEventListener('keydown', onKey);
  };
}

// Image modal helpers
function attachImageClickHandler(containerId) {
  const card = document.querySelector(`[data-img-container="${containerId}"]`);
  if (!card || card.dataset.bound === '1') return;
  card.dataset.bound = '1';

  card.addEventListener('click', (e) => {
    e.stopPropagation();
    const imgData = card.querySelector('[data-img-content]');
    if (imgData) {
      const imageBase64 = decodeURIComponent(imgData.dataset.imgContent);
      openImageModal(imageBase64);
    }
  });
}

function openImageModal(imageBase64) {
  let backdrop = document.getElementById('vizModalBackdrop');
  if (!backdrop) {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="vizModalBackdrop" class="viz-modal-backdrop">
        <div class="viz-modal viz-modal--svg" role="dialog" aria-modal="true">
          <button class="viz-modal-close-icon" id="vizModalCloseBtn" aria-label="Close">×</button>
          <div class="viz-modal-content viz-modal-content--svg">
            <div id="vizModalImageContainer"></div>
          </div>
        </div>
      </div>
    `;
    const node = container.firstElementChild;
    if (node) document.body.appendChild(node);
    backdrop = document.getElementById('vizModalBackdrop');
  }

  const closeBtn = document.getElementById('vizModalCloseBtn');
  const imageContainer = document.getElementById('vizModalImageContainer');

  backdrop.classList.add('visible');
  const prevOverflow = document.body.style.overflow;
  document.body.dataset.prevOverflow = prevOverflow;
  document.body.style.overflow = 'hidden';

  // Insert image
  imageContainer.innerHTML = `<img src="data:image/png;base64,${imageBase64}" alt="Data Visualization" style="max-width: 100%; max-height: 100%; width: auto; height: auto;" />`;

  const onKey = (ev) => {
    if (ev.key === 'Escape') {
      closeModal();
    }
  };

  const onBackdropClick = (ev) => {
    if (ev.target === backdrop) {
      closeModal();
    }
  };

  const onClose = () => closeModal();

  document.addEventListener('keydown', onKey);
  backdrop.addEventListener('click', onBackdropClick, { once: true });
  if (closeBtn) closeBtn.addEventListener('click', onClose, { once: true });

  backdrop.__cleanup = () => {
    document.removeEventListener('keydown', onKey);
  };
}

function closeModal() {
  const backdrop = document.getElementById('vizModalBackdrop');
  if (!backdrop) return;
  backdrop.classList.remove('visible');
  if (backdrop.__cleanup) {
    try { backdrop.__cleanup(); } catch (_) {}
    backdrop.__cleanup = null;
  }
  const prevOverflow = document.body.dataset.prevOverflow || '';
  document.body.style.overflow = prevOverflow;
}

// Sanitize SVG by evaluating arithmetic expressions in attributes
function sanitizeSvgExpressions(svgContent) {
  const parser = new Parser();

  // Match attribute values that contain arithmetic expressions like "60+10" or "100-20"
  return svgContent.replace(/(\w+)="([^"]*[\+\-\*\/][^"]*)"/g, (match, attr, expr) => {
    try {
      // Only evaluate if it looks like a simple arithmetic expression
      if (/^[\d\s\+\-\*\/\(\)\.]+$/.test(expr)) {
        const result = parser.evaluate(expr);
        return `${attr}="${result}"`;
      }
    } catch (e) {
      // If evaluation fails, return original
    }
    return match;
  });
}