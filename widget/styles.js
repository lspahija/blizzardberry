import cssString from './styles.css';

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = cssString;
  document.head.appendChild(style);
}

function setupMobileViewport() {
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content =
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewport);
  } else {
    viewport.content =
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  }
}

export function initializeStyles() {
  injectStyles();
  setupMobileViewport();
}