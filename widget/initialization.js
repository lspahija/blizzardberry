import cssString from './styles.css';

function initializeStyles() {
  const style = document.createElement('style');
  style.textContent = cssString;
  document.head.appendChild(style);
}

function initializeAgentId(script) {
  if (script && script.dataset && script.dataset.agentId) {
    return script.dataset.agentId;
  } else {
    console.error(
      'Could not find agent ID. Make sure the script tag has the data-agent-id attribute.'
    );
    throw new Error('Agent ID not found in script tag.');
  }
}

function ensureMobileViewport() {
  // Check if viewport meta tag exists, if not create one
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content =
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewport);
  } else {
    // Update existing viewport to prevent zooming
    viewport.content =
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  }
}

export function initialize() {
  const agentScript = document.currentScript;

  initializeStyles();
  ensureMobileViewport();

  const baseUrl = new URL(agentScript.src).origin;
  const agentId = initializeAgentId(agentScript);

  console.log('BlizzardBerry Agent initialized:', { agentId, baseUrl });

  const userConfig = window.agentUserConfig;
  const actions = window.agentActions;
  delete window.agentUserConfig;
  delete window.agentActions;

  return { baseUrl, agentId, userConfig, actions };
}
