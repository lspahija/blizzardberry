import { initialize } from './initialization';
import { createWidgetDOM } from './dom';
import { initializeChat } from './chat';

(function () {
  const { baseUrl, agentId, userConfig, actions } = initialize();

  initializeChat({ baseUrl, userConfig, agentId, actions });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createWidgetDOM(baseUrl, agentId));
  } else {
    createWidgetDOM(baseUrl, agentId);
  }
})();