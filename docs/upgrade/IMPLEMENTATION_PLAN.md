# Blizzardberry General Agent - Implementation Plan

This document outlines the step-by-step implementation plan to add general agent capabilities to blizzardberry. The approach prioritizes getting a working end-to-end pipeline first, then iterating.

## Guiding Principle: Vertical Slice First

```
┌─────────────────────────────────────────────────────────────────┐
│  MILESTONE 1: Minimal Working Pipeline                          │
│                                                                 │
│  Widget ──► Screenshot + Elements ──► Backend ──► Claude        │
│    ▲                                                   │        │
│    └───── Execute Action ◄─── Parse Response ◄─────────┘        │
│                                                                 │
│  Goal: "Click the submit button" works end-to-end               │
└─────────────────────────────────────────────────────────────────┘
```

**Why this approach:**
- Validates architecture before investing in details
- Catches integration issues early
- Provides working demo quickly
- Allows parallel work once pipeline is proven

---

## Milestone 1: Minimal Working Pipeline

**Goal**: User says "Click the submit button" → agent clicks it.

### Step 1.1: Basic Screenshot Capture

**File**: `widget/general-agent/screenshot.js`

**What to build**:
```javascript
import { domToPng } from 'modern-screenshot';

export async function captureScreenshot() {
  try {
    const dataUrl = await domToPng(document.body, {
      width: Math.min(window.innerWidth, 1280),
      height: Math.min(window.innerHeight, 800),
      scale: 1,
    });
    return dataUrl.split(',')[1]; // Return base64 without prefix
  } catch (error) {
    console.error('Screenshot failed:', error);
    return null;
  }
}
```

**Verification**:
- [ ] Can capture screenshot on a test page
- [ ] Returns base64 string
- [ ] Gracefully returns null on failure

**Dependencies**: `npm install modern-screenshot`

---

### Step 1.2: Basic Element Extraction

**File**: `widget/general-agent/element-extractor.js`

**What to build**:
```javascript
export function extractElements() {
  const selectors = 'a, button, input, select, textarea, [role="button"], [onclick]';
  const elements = [];

  document.querySelectorAll(selectors).forEach((el, index) => {
    const rect = el.getBoundingClientRect();

    // Skip invisible elements
    if (rect.width === 0 || rect.height === 0) return;
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    elements.push({
      index: index + 1,
      tag: el.tagName.toLowerCase(),
      text: getElementText(el).slice(0, 100),
      selector: generateSelector(el),
      bbox: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
    });
  });

  return elements;
}

function getElementText(el) {
  return el.getAttribute('aria-label')
    || el.innerText?.trim()
    || el.getAttribute('placeholder')
    || el.getAttribute('title')
    || '';
}

function generateSelector(el) {
  if (el.id) return `#${el.id}`;
  if (el.getAttribute('data-testid')) {
    return `[data-testid="${el.getAttribute('data-testid')}"]`;
  }
  // Fallback: use index as data attribute (set during extraction)
  const idx = el.getAttribute('data-bb-index');
  if (idx) return `[data-bb-index="${idx}"]`;
  return null;
}
```

**Verification**:
- [ ] Extracts buttons, links, inputs from test page
- [ ] Returns array with index, tag, text, selector, bbox
- [ ] Filters out invisible elements

---

### Step 1.3: Element Marker Overlay

**File**: `widget/general-agent/marker-overlay.js`

**What to build**:
```javascript
export function addMarkers(elements) {
  // Tag elements with index for reliable selection later
  elements.forEach(el => {
    const domEl = document.querySelector(el.selector);
    if (domEl) {
      domEl.setAttribute('data-bb-index', el.index);
    }
  });

  // Create visual overlay
  const overlay = document.createElement('div');
  overlay.id = 'bb-marker-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2147483646;
  `;

  elements.forEach(el => {
    const marker = document.createElement('div');
    marker.className = 'bb-marker';
    marker.textContent = el.index;
    marker.style.cssText = `
      position: absolute;
      left: ${el.bbox.x}px;
      top: ${el.bbox.y}px;
      background: #e74c3c;
      color: white;
      font-size: 11px;
      font-weight: bold;
      padding: 1px 4px;
      border-radius: 3px;
      font-family: monospace;
      z-index: 2147483647;
    `;
    overlay.appendChild(marker);
  });

  document.body.appendChild(overlay);
  return overlay;
}

export function removeMarkers() {
  const overlay = document.getElementById('bb-marker-overlay');
  if (overlay) overlay.remove();

  // Remove data attributes
  document.querySelectorAll('[data-bb-index]').forEach(el => {
    el.removeAttribute('data-bb-index');
  });
}
```

**Verification**:
- [ ] Markers appear at correct positions
- [ ] Markers visible in screenshot
- [ ] Can remove markers cleanly

---

### Step 1.4: Page State Capture (Coordinator)

**File**: `widget/general-agent/page-state.js`

**What to build**:
```javascript
import { captureScreenshot } from './screenshot.js';
import { extractElements } from './element-extractor.js';
import { addMarkers, removeMarkers } from './marker-overlay.js';

export async function capturePageState() {
  // 1. Extract elements
  const elements = extractElements();

  // 2. Add visual markers
  const overlay = addMarkers(elements);

  // 3. Wait a frame for markers to render
  await new Promise(r => requestAnimationFrame(r));

  // 4. Capture screenshot with markers
  const screenshot = await captureScreenshot();

  // 5. Remove markers
  removeMarkers();

  // 6. Return page state
  return {
    mode: screenshot ? 'vision' : 'dom-only',
    screenshot,
    elements,
    url: window.location.href,
    title: document.title,
  };
}
```

**Verification**:
- [ ] Returns complete page state object
- [ ] Screenshot includes markers
- [ ] Markers removed after capture

---

### Step 1.5: Backend Endpoint

**File**: `src/app/api/(main)/agent-step/route.ts`

**What to build**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an AI agent that can see and interact with web pages.

You receive:
1. A screenshot with numbered markers [1], [2], [3] on interactive elements
2. A list of elements with their indices and text

Respond with a single action in JSON format:
{
  "thinking": "Brief reasoning about what you see and what to do",
  "action": {
    "type": "click" | "type" | "done" | "fail",
    "index": number,
    "text": "string (for type action only)"
  },
  "done": false
}

Guidelines:
- Look at the screenshot to understand the page
- Match the user's goal to visible elements
- Use the element index to specify which element to interact with
- If the goal is achieved, set done: true`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageState, userGoal, conversationId, agentId } = body;

    // Format element list
    const elementList = pageState.elements
      .map((el: any) => `[${el.index}] <${el.tag}> "${el.text}"`)
      .join('\n');

    // Build message content
    const content: any[] = [];

    if (pageState.screenshot) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: pageState.screenshot,
        },
      });
    }

    content.push({
      type: 'text',
      text: `Page: ${pageState.url}

Elements:
${elementList}

User goal: ${userGoal}`,
    });

    // Call Claude
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    });

    // Parse response
    const text = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      ...parsed,
    });

  } catch (error) {
    console.error('Agent step error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
```

**Verification**:
- [ ] Endpoint accepts POST with pageState and userGoal
- [ ] Calls Claude with screenshot and elements
- [ ] Returns parsed action

**Dependencies**: `npm install @anthropic-ai/sdk`

---

### Step 1.6: Action Executor

**File**: `widget/general-agent/action-executor.js`

**What to build**:
```javascript
export async function executeAction(action, elements) {
  const element = elements.find(e => e.index === action.index);

  if (!element) {
    return { success: false, error: `Element ${action.index} not found` };
  }

  // Find DOM element
  const domEl = document.querySelector(element.selector)
    || document.querySelector(`[data-bb-index="${action.index}"]`);

  if (!domEl) {
    return { success: false, error: `Could not locate element in DOM` };
  }

  try {
    switch (action.type) {
      case 'click':
        domEl.scrollIntoView({ behavior: 'instant', block: 'center' });
        await sleep(100);
        domEl.click();
        break;

      case 'type':
        domEl.scrollIntoView({ behavior: 'instant', block: 'center' });
        await sleep(100);
        domEl.focus();

        // Clear existing value
        if (domEl.value !== undefined) {
          domEl.value = '';
        }

        // Type character by character (more realistic)
        for (const char of action.text) {
          domEl.value += char;
          domEl.dispatchEvent(new Event('input', { bubbles: true }));
          await sleep(20);
        }
        domEl.dispatchEvent(new Event('change', { bubbles: true }));
        break;

      case 'done':
      case 'fail':
        // No action needed
        break;

      default:
        return { success: false, error: `Unknown action type: ${action.type}` };
    }

    return { success: true };

  } catch (error) {
    return { success: false, error: String(error) };
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Verification**:
- [ ] Can click element by index
- [ ] Can type into input by index
- [ ] Scrolls element into view first
- [ ] Returns success/error status

---

### Step 1.7: Agent Loop (Minimal)

**File**: `widget/general-agent/agent-loop.js`

**What to build**:
```javascript
import { capturePageState } from './page-state.js';
import { executeAction } from './action-executor.js';

export async function runAgent(userGoal, config) {
  const { baseUrl, agentId, conversationId, onStatus, onComplete, onError } = config;

  const maxSteps = 5; // Low for initial testing

  for (let step = 0; step < maxSteps; step++) {
    try {
      // 1. Capture current state
      onStatus?.(`Step ${step + 1}: Analyzing page...`);
      const pageState = await capturePageState();

      // 2. Call backend
      onStatus?.(`Step ${step + 1}: Planning action...`);
      const response = await fetch(`${baseUrl}/api/agent-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageState,
          userGoal,
          agentId,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }

      // 3. Check if done
      if (result.done || result.action?.type === 'done') {
        onComplete?.({ success: true, message: result.thinking });
        return { success: true };
      }

      if (result.action?.type === 'fail') {
        onComplete?.({ success: false, message: result.thinking });
        return { success: false, reason: result.thinking };
      }

      // 4. Execute action
      onStatus?.(`Step ${step + 1}: ${result.action.type} element [${result.action.index}]...`);
      const execResult = await executeAction(result.action, pageState.elements);

      if (!execResult.success) {
        console.warn('Action failed:', execResult.error);
        // Continue anyway - let Claude see the result
      }

      // 5. Wait for page to settle
      await new Promise(r => setTimeout(r, 500));

    } catch (error) {
      onError?.(error);
      return { success: false, error: String(error) };
    }
  }

  onComplete?.({ success: false, message: 'Max steps reached' });
  return { success: false, reason: 'Max steps reached' };
}
```

**Verification**:
- [ ] Loops through capture → plan → execute cycle
- [ ] Stops on done/fail
- [ ] Reports status via callbacks
- [ ] Handles errors gracefully

---

### Step 1.8: Integration with Widget

**File**: `widget/conversation.js` (modify existing)

**What to add**:
```javascript
import { runAgent } from './general-agent/agent-loop.js';

// In processMessage or similar function:
async function handleGeneralAgentTask(userMessage) {
  // Show "thinking" indicator
  addMessage('assistant', 'Analyzing page...');

  const result = await runAgent(userMessage, {
    baseUrl: config.baseUrl,
    agentId: config.agentId,
    conversationId: state.conversationId,
    onStatus: (status) => {
      updateLastMessage(status);
    },
    onComplete: ({ success, message }) => {
      if (success) {
        updateLastMessage(`✓ Done: ${message}`);
      } else {
        updateLastMessage(`✗ Failed: ${message}`);
      }
    },
    onError: (error) => {
      updateLastMessage(`Error: ${error.message}`);
    },
  });
}

// Detect if message should use general agent
function shouldUseGeneralAgent(message) {
  // For now, simple keyword detection
  // Later: let LLM decide
  const actionKeywords = ['click', 'type', 'fill', 'enter', 'select', 'navigate', 'go to'];
  return actionKeywords.some(kw => message.toLowerCase().includes(kw));
}
```

**Verification**:
- [ ] Widget detects "click X" as agent task
- [ ] Runs agent loop
- [ ] Shows status updates in chat
- [ ] Shows completion message

---

### Step 1.9: End-to-End Test

**Test scenario**:
1. Open any page with a button (e.g., the blizzardberry dashboard)
2. Open widget
3. Type: "Click the submit button" (or similar)
4. Verify:
   - [ ] Screenshot is captured with markers
   - [ ] Backend receives request
   - [ ] Claude returns action
   - [ ] Button is clicked
   - [ ] Status shown in widget

**Debug checklist if it fails**:
- Check browser console for JS errors
- Check Network tab for /api/agent-step request/response
- Check server logs for Claude API errors
- Verify screenshot is valid base64
- Verify element list is populated

---

## Milestone 1 Checklist

- [ ] Step 1.1: Screenshot capture works
- [ ] Step 1.2: Element extraction works
- [ ] Step 1.3: Markers visible in screenshot
- [ ] Step 1.4: Page state capture coordinator works
- [ ] Step 1.5: Backend endpoint accepts request and returns action
- [ ] Step 1.6: Action executor clicks/types correctly
- [ ] Step 1.7: Agent loop runs single step
- [ ] Step 1.8: Widget integration triggers agent
- [ ] Step 1.9: End-to-end "click the button" works

**Milestone 1 complete when**: User can say "click the submit button" and it clicks.

---

## Milestone 2: Multi-Step Tasks

**Goal**: User says "Fill out the contact form with name John and email john@example.com" → agent fills it.

### Step 2.1: Improve Element Extraction

- [ ] Include input values in element info
- [ ] Better text extraction (labels, nearby text)
- [ ] Handle select/option elements

### Step 2.2: Add Previous Action Context

- [ ] Send previous actions to Claude
- [ ] Add "evaluation" field to prompt
- [ ] Track action history in agent loop

### Step 2.3: DOM Change Detection

- [ ] Compare elements between steps
- [ ] Mark new elements with `*`
- [ ] Include diff summary

### Step 2.4: Better Error Recovery

- [ ] Retry failed actions
- [ ] Re-capture page state on failure
- [ ] Report specific failures to Claude

### Step 2.5: Multi-Step Test

- [ ] "Fill form and submit" works
- [ ] "Navigate to page and click X" works

---

## Milestone 3: Production Hardening

### Step 3.1: Prompt Optimization

- [ ] Add structured output format (thinking, evaluation, memory)
- [ ] Add reasoning rules
- [ ] Add examples
- [ ] Implement prompt caching

### Step 3.2: DOM-Only Fallback

- [ ] Detect screenshot failure
- [ ] Switch to DOM-only prompt
- [ ] Test on sites where screenshot fails

### Step 3.3: Confidence & Confirmation

- [ ] Add confidence score to output
- [ ] Ask user confirmation for low confidence
- [ ] Add "are you sure?" for destructive actions

### Step 3.4: Memory Masking

- [ ] Implement observation limiting
- [ ] Dedupe identical screenshots
- [ ] Keep only last N actions

### Step 3.5: Cost Optimization

- [ ] Add prompt caching
- [ ] Measure tokens per step
- [ ] Add usage tracking

---

## Milestone 4: Hybrid Mode

### Step 4.1: Predefined Action Priority

- [ ] Check if predefined tool matches
- [ ] Use predefined if confidence > threshold
- [ ] Fall back to general agent

### Step 4.2: Configuration UI

- [ ] Add "Enable general agent" toggle
- [ ] Add "Vision mode" toggle
- [ ] Add "Max steps" setting

### Step 4.3: Backward Compatibility

- [ ] Existing predefined actions still work
- [ ] No breaking changes to widget API

---

## File Structure After Implementation

```
widget/
├── general-agent/
│   ├── index.js              # Exports
│   ├── screenshot.js         # Milestone 1
│   ├── element-extractor.js  # Milestone 1
│   ├── marker-overlay.js     # Milestone 1
│   ├── page-state.js         # Milestone 1
│   ├── action-executor.js    # Milestone 1
│   ├── agent-loop.js         # Milestone 1
│   └── dom-diff.js           # Milestone 2
│
├── conversation.js           # Modified for agent integration
└── ...existing files...

src/app/api/
├── (main)/
│   └── agent-step/
│       └── route.ts          # Milestone 1
│
└── lib/
    └── general-agent/
        ├── prompts.ts        # Milestone 3
        └── types.ts          # Milestone 1
```

---

## Dependencies to Add

```json
{
  "dependencies": {
    "modern-screenshot": "^4.x",
    "@anthropic-ai/sdk": "^0.x"
  }
}
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Screenshot capture fails | Fallback to DOM-only mode |
| Claude returns invalid JSON | Regex extraction, retry once |
| Action execution fails | Report to Claude, let it adapt |
| Rate limiting | Add exponential backoff |
| Cost overrun | Add max steps, token tracking |

---

## Success Criteria

**Milestone 1 (MVP)**:
- "Click the X button" works on 3 different test pages
- End-to-end latency < 5 seconds
- No JS errors in console

**Milestone 2**:
- Multi-step forms can be filled
- Agent recovers from failed actions

**Milestone 3**:
- Cost per task < $0.05 average
- Works on 90% of standard web pages

**Milestone 4**:
- Existing blizzardberry features unchanged
- Site owners can configure behavior

---

## Getting Started

```bash
# 1. Install dependencies
cd blizzardberry
npm install modern-screenshot @anthropic-ai/sdk

# 2. Create the files (Step 1.1 - 1.6)

# 3. Set ANTHROPIC_API_KEY in environment

# 4. Start the dev server
npm run dev

# 5. Open any page with the widget

# 6. Test: "Click the first button"
```
