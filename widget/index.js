import './config';
import { initializeStyles } from './styles';
import { createWidgetDOM } from './dom';

(function () {
  initializeStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidgetDOM);
  } else {
    createWidgetDOM();
  }
})();
