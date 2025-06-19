(function () {
  const actions = {};
  let userConfig = null;
  let agentId = null;
  let counter = 0;

  function initializeAgentId() {
    const script = document.currentScript;
    agentId = script?.dataset?.agentId;
    console.log('Initialized agent ID:', agentId);
  }

  // Initialize user config
  if (window.agentUserConfig && typeof window.agentUserConfig === 'object') {
    userConfig = window.agentUserConfig;
    console.log('Initialized user config:', userConfig);
    delete window.agentUserConfig;
  }

  if (window.AgentActions && typeof window.AgentActions === 'object') {
    console.log('Registering actions:', Object.keys(window.AgentActions));
    Object.assign(actions, window.AgentActions);
    console.log('Available actions:', Object.keys(actions));
    delete window.AgentActions;
  }

  // Create widget DOM
  function createWidgetDOM() {
    const toggle = document.createElement('div');
    toggle.id = 'chatWidgetToggle';
    toggle.innerHTML = '💬';
    toggle.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 24px;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toggle);

    const widget = document.createElement('div');
    widget.id = 'chatWidget';
    widget.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 20px rgba(0,0,0,0.2);
      z-index: 1000;
      display: flex;
      flex-direction: column;
    `;

    const header = document.createElement('div');
    header.id = 'chatWidgetHeader';
    header.style.cssText = `
      padding: 15px;
      background: #007bff;
      color: white;
      border-radius: 10px 10px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = '<div>BlizzardBerry Agent</div><button id="chatWidgetCloseButton">×</button>';
    widget.appendChild(header);

    const body = document.createElement('div');
    body.id = 'chatWidgetBody';
    body.style.cssText = `
      flex: 1;
      padding: 15px;
      overflow-y: auto;
    `;
    body.innerHTML = '<div style="text-align: center; color: #666; margin-top: 20px;">Agent loaded successfully!</div>';
    widget.appendChild(body);

    const footer = document.createElement('div');
    footer.id = 'chatWidgetFooter';
    footer.style.cssText = `
      padding: 10px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #eee;
    `;
    footer.innerHTML = 'Powered By BlizzardBerry';
    widget.appendChild(footer);

    document.body.appendChild(widget);
    
    console.log('Chat widget created successfully');
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeAgentId();
      createWidgetDOM();
    });
  } else {
    initializeAgentId();
    createWidgetDOM();
  }
})(); 