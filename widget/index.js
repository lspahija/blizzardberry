import './config';
import './logger';
import { initializeStyles } from './styles';
import { createWidgetDOM } from './dom';

(function () {
  try {
    initializeStyles();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', withWidgetErrorLogging(createWidgetDOM, 'widget', 'initialization'));
    } else {
      withWidgetErrorLogging(createWidgetDOM, 'widget', 'initialization')();
    }
  } catch (error) {
    if (window.widgetLogger) {
      window.widgetLogger.error('Failed to initialize widget', { error });
    } else {
      console.error('Widget initialization failed:', error);
    }
  }
})();
