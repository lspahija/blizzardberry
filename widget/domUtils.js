/**
 * Skyvern integration module for DOM capture and action execution
 */

/**
 * Captures the current DOM state and cleans it for Skyvern inference
 * @param {HTMLIFrameElement|null} iframe - Optional iframe to capture DOM from
 * @returns {Object} Cleaned DOM representation
 */
export function captureDOMState(iframe = null) {
  const doc = iframe?.contentDocument || document;
  const win = iframe?.contentWindow || window;

  // Get all interactive elements
  const interactiveElements = doc.querySelectorAll(
    'a, button, input, textarea, select, [role="button"], [onclick], [tabindex]'
  );

  // Build element tree with relevant attributes
  const elements = Array.from(interactiveElements).map((el, index) => {
    const rect = el.getBoundingClientRect();
    const styles = win.getComputedStyle(el);

    // Check if element is visible
    const isVisible =
      rect.width > 0 &&
      rect.height > 0 &&
      styles.display !== 'none' &&
      styles.visibility !== 'hidden' &&
      styles.opacity !== '0';

    return {
      index,
      tagName: el.tagName.toLowerCase(),
      id: el.id || null,
      className: el.className || null,
      text: el.textContent?.trim().substring(0, 100) || null,
      value: el.value || null,
      type: el.type || null,
      name: el.name || null,
      href: el.href || null,
      placeholder: el.placeholder || null,
      ariaLabel: el.getAttribute('aria-label') || null,
      role: el.getAttribute('role') || null,
      visible: isVisible,
      position: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      },
      selector: generateSelector(el),
    };
  });

  // Filter to only visible elements
  const visibleElements = elements.filter((el) => el.visible);

  return {
    url: win.location.href,
    title: doc.title,
    elements: visibleElements,
    viewport: {
      width: win.innerWidth,
      height: win.innerHeight,
      scrollX: win.scrollX,
      scrollY: win.scrollY,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generates a unique selector for an element
 * @param {Element} element
 * @returns {string}
 */
function generateSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }

  const path = [];
  let current = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.className) {
      const classes = current.className
        .trim()
        .split(/\s+/)
        .filter((c) => c)
        .join('.');
      if (classes) {
        selector += `.${classes}`;
      }
    }

    // Add nth-child if needed for uniqueness
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (sibling) => sibling.tagName === current.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
    }

    path.unshift(selector);
    current = parent;

    // Limit depth to avoid overly long selectors
    if (path.length >= 5) break;
  }

  return path.join(' > ');
}

/**
 * Executes a Skyvern action on the page
 * @param {Object} action - Action object from Skyvern
 * @param {HTMLIFrameElement|null} iframe - Optional iframe to execute action in
 * @returns {Promise<Object>} Result of action execution
 */
export async function executeAction(action, iframe = null) {
  const doc = iframe?.contentDocument || document;
  const win = iframe?.contentWindow || window;

  console.log('Executing Skyvern action:', action);

  try {
    switch (action.type) {
      case 'click':
        return await executeClick(action, doc);

      case 'input':
      case 'type':
        return await executeInput(action, doc);

      case 'select':
        return await executeSelect(action, doc);

      case 'scroll':
        return await executeScroll(action, win);

      case 'wait':
        return await executeWait(action);

      case 'navigate':
        return await executeNavigate(action, win);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  } catch (error) {
    console.error('Error executing action:', error);
    return {
      success: false,
      error: error.message,
      action,
    };
  }
}

/**
 * Execute click action
 */
async function executeClick(action, doc) {
  const element = findElement(action.selector, doc);
  if (!element) {
    throw new Error(`Element not found: ${action.selector}`);
  }

  // Scroll element into view
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await wait(300); // Wait for scroll

  // Click the element
  element.click();

  return {
    success: true,
    action: 'click',
    selector: action.selector,
  };
}

/**
 * Execute input action
 */
async function executeInput(action, doc) {
  const element = findElement(action.selector, doc);
  if (!element) {
    throw new Error(`Element not found: ${action.selector}`);
  }

  // Scroll element into view
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await wait(300);

  // Focus the element
  element.focus();

  // Set the value
  element.value = action.value || '';

  // Dispatch input events
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));

  return {
    success: true,
    action: 'input',
    selector: action.selector,
    value: action.value,
  };
}

/**
 * Execute select action
 */
async function executeSelect(action, doc) {
  const element = findElement(action.selector, doc);
  if (!element) {
    throw new Error(`Element not found: ${action.selector}`);
  }

  if (element.tagName.toLowerCase() !== 'select') {
    throw new Error(`Element is not a select: ${action.selector}`);
  }

  element.value = action.value;
  element.dispatchEvent(new Event('change', { bubbles: true }));

  return {
    success: true,
    action: 'select',
    selector: action.selector,
    value: action.value,
  };
}

/**
 * Execute scroll action
 */
async function executeScroll(action, win) {
  if (action.x !== undefined && action.y !== undefined) {
    win.scrollTo(action.x, action.y);
  } else if (action.direction) {
    const scrollAmount = action.amount || 500;
    switch (action.direction) {
      case 'down':
        win.scrollBy(0, scrollAmount);
        break;
      case 'up':
        win.scrollBy(0, -scrollAmount);
        break;
      case 'left':
        win.scrollBy(-scrollAmount, 0);
        break;
      case 'right':
        win.scrollBy(scrollAmount, 0);
        break;
    }
  }

  return {
    success: true,
    action: 'scroll',
    scrollX: win.scrollX,
    scrollY: win.scrollY,
  };
}

/**
 * Execute wait action
 */
async function executeWait(action) {
  const duration = action.duration || 1000;
  await wait(duration);

  return {
    success: true,
    action: 'wait',
    duration,
  };
}

/**
 * Execute navigate action
 */
async function executeNavigate(action, win) {
  if (!action.url) {
    throw new Error('Navigate action requires a URL');
  }

  win.location.href = action.url;

  return {
    success: true,
    action: 'navigate',
    url: action.url,
  };
}

/**
 * Find element using various strategies
 */
function findElement(selector, doc) {
  if (!selector) return null;

  try {
    // Try as CSS selector
    return doc.querySelector(selector);
  } catch (e) {
    // If CSS selector fails, try by text content
    const allElements = doc.querySelectorAll('*');
    return Array.from(allElements).find(
      (el) => el.textContent?.trim() === selector
    );
  }
}

/**
 * Wait helper
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if element is visible
 */
export function isElementVisible(element, win = window) {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const styles = win.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    styles.display !== 'none' &&
    styles.visibility !== 'hidden' &&
    parseFloat(styles.opacity) > 0
  );
}

/**
 * Get screenshot data URL (if needed for visual feedback)
 */
export async function captureScreenshot() {
  // Note: This requires canvas and may have CORS limitations
  // For now, return a placeholder
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    timestamp: new Date().toISOString(),
    // In a real implementation, you might use html2canvas or similar
  };
}
