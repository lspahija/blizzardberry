function extractAgentId() {
  const script = document.currentScript;
  if (script && script.dataset && script.dataset.agentId) {
    return script.dataset.agentId;
  } else {
    console.error(
      'Could not find agent ID. Make sure the script tag has the data-agent-id attribute.'
    );
    throw new Error('Agent ID not found in script tag.');
  }
}

function initializeConfig() {
  const agentScript = document.currentScript;
  const srcAttr = agentScript.getAttribute('src');
  const fullUrl = new URL(srcAttr, window.location.href);
  const baseUrl = fullUrl.origin;

  const agentId = extractAgentId();

  console.log('BlizzardBerry Agent initialized:', { agentId, baseUrl });

  console.log('window.actions: ', JSON.stringify(window.actions));

  const userConfig = window.agentUserConfig;
  const actions = window.agentActions;
  delete window.agentUserConfig;
  delete window.agentActions;

  console.log('const actions: ', JSON.stringify(actions));

  return { baseUrl, agentId, userConfig, actions };
}

export const config = initializeConfig();
