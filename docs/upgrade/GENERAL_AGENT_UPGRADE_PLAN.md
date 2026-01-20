# Blizzardberry General Agent Upgrade Plan

## Executive Summary

Transform blizzardberry from a tool-based agent (predefined actions) into a **general-purpose browser agent** that can understand and interact with any page dynamically, while preserving its unique advantage: **embeddable on any website via a single script tag**.

### Approach: Vision-Primary with DOM-Assist

Based on benchmark evidence showing **vision-first approaches achieve 94% accuracy vs 73% for DOM-only** ([WebVoyager results](https://github.com/sagekit/webvoyager)), we adopt a vision-primary architecture:

1. **Screenshot** the page (visual understanding)
2. **Extract DOM** elements with coordinates (precise targeting)
3. **Overlay markers** [1] [2] [3] on interactive elements
4. **Send both** to Claude for action planning
5. **Execute** using DOM selectors (reliable clicking)

See [VISION_VS_DOM_ANALYSIS.md](VISION_VS_DOM_ANALYSIS.md) for detailed tradeoff analysis.

### Current State vs Target State

| Aspect | Current | Target |
|--------|---------|--------|
| Action determination | Predefined tools stored in DB | Dynamic inference from page state |
| Page understanding | None (relies on pre-built tools) | Vision + DOM analysis |
| Flexibility | Only works with configured actions | Works on any page automatically |
| Onboarding | Time-consuming (define each action) | Zero-config (works immediately) |
| Maintenance | Website changes break tools | Self-healing (adapts to changes) |

---

## Architecture Analysis: Lessons from Competitors

### Magnitude (Vision-First)
- **Approach**: Uses pixel coordinates from vision model, not DOM element targeting
- **Strength**: True generalization independent of DOM structure
- **Weakness**: Requires vision-capable LLM, higher latency/cost
- **Key technique**: Memory masking for token efficiency, prompt caching

### Browser-Use (Hybrid DOM+Vision)
- **Approach**: Indexed elements `[1]<button>Submit</button>`, accessibility tree extraction
- **Strength**: DOM provides structural semantics, vision provides validation
- **Weakness**: Index-based targeting can break on dynamic pages
- **Key technique**: DOM diffing to mark new elements with `*`

### Skyvern (Vision+DOM Hybrid)
- **Approach**: Screenshots with bounding boxes + trimmed DOM
- **Strength**: Visual grounding + precise element targeting
- **Weakness**: Server-side browser control required
- **Key technique**: Aggressive DOM trimming (reserved attributes only)

### Blizzardberry Unique Position
Unlike all competitors, blizzardberry runs **inside the user's browser** as a widget. This means:
- ✅ Direct DOM access (no CDP/Playwright overhead)
- ✅ Real user session (cookies, auth state preserved)
- ✅ Works on any website without server infrastructure
- ✅ No browser instance management (competitors need Playwright servers)
- ❌ Cannot capture true screenshots (browser security sandbox)
- ❌ Limited by browser JS execution context
- ❌ Cross-origin restrictions apply

**Latency Note**: The LLM inference call is the bottleneck regardless of architecture. Blizzardberry saves CDP/Playwright overhead (~50-200ms per action) but this is minor compared to LLM latency (~1-3s). The real advantage is **zero infrastructure** - no need to run browser servers.

---

## Proposed Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    HOST WEBSITE                          │   │
│  │                                                          │   │
│  │   ┌──────────────────────────────────────────────────┐  │   │
│  │   │           BLIZZARDBERRY WIDGET                   │  │   │
│  │   │                                                  │  │   │
│  │   │  1. Capture screenshot (modern-screenshot)       │  │   │
│  │   │  2. Extract DOM elements with coordinates        │  │   │
│  │   │  3. Overlay numbered markers [1] [2] [3]         │  │   │
│  │   │  4. Send screenshot + elements to backend        │  │   │
│  │   │  5. Receive action → Execute via DOM selector    │  │   │
│  │   │  6. Loop until task complete                     │  │   │
│  │   └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BLIZZARDBERRY BACKEND                      │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   Vision    │    │   Claude    │    │   Knowledge Base    │ │
│  │   Action    │───▶│   Sonnet    │◀──▶│   (Optional RAG)    │ │
│  │   Planner   │    │   (Vision)  │    │                     │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Per-Step Data Flow

```
Widget                                    Backend
  │                                          │
  ├─► captureScreenshot()                    │
  │      └─► PNG base64 (~100KB)             │
  │                                          │
  ├─► extractElements()                      │
  │      └─► [{index, selector, text, bbox}] │
  │                                          │
  ├─► overlayMarkers()                       │
  │      └─► Screenshot with [1][2][3]       │
  │                                          │
  ├──────────── POST /api/agent-step ───────►│
  │     {screenshot, elements, goal}         │
  │                                          ├─► Claude Vision
  │                                          │     "Click element [3]"
  │◄─────────── {action: click, index: 3} ───┤
  │                                          │
  ├─► executeAction(elements[3].selector)    │
  │      └─► element.click()                 │
  │                                          │
  └─► Loop until done                        │
```

---

## Implementation Plan

### Phase 1: Vision Capture Engine (Widget-Side)

**Goal**: Capture high-quality screenshots with element markers for vision-based understanding.

#### 1.1 Screenshot Capture (`widget/general-agent/screenshot.js`)

Using `modern-screenshot` for best performance (3x faster than html2canvas):

```javascript
import { domToPng } from 'modern-screenshot';

async function captureViewport() {
  try {
    const dataUrl = await domToPng(document.body, {
      width: window.innerWidth,
      height: window.innerHeight,
      scale: 1,
      quality: 0.8,
      // Exclude the widget itself from screenshot
      filter: (node) => !node.id?.includes('blizzardberry'),
    });

    // Resize to Claude-optimal dimensions (1024x768)
    return await resizeImage(dataUrl, 1024, 768);
  } catch (error) {
    // Fallback to DOM-only mode
    console.warn('Screenshot capture failed:', error);
    return null;
  }
}
```

#### 1.2 Element Marker Overlay (`widget/general-agent/marker-overlay.js`)

Inspired by [Set-of-Mark prompting](https://arxiv.org/abs/2310.11441):

```javascript
function overlayMarkers(elements) {
  // Create temporary overlay layer
  const overlay = document.createElement('div');
  overlay.id = 'blizzardberry-markers';
  overlay.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:999999';

  elements.forEach((el, index) => {
    const marker = document.createElement('div');
    marker.textContent = `[${index + 1}]`;
    marker.style.cssText = `
      position: absolute;
      left: ${el.bbox.x}px;
      top: ${el.bbox.y}px;
      background: #FF6B6B;
      color: white;
      font-size: 12px;
      font-weight: bold;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
    `;
    overlay.appendChild(marker);
  });

  document.body.appendChild(overlay);
  return overlay; // Return for removal after screenshot
}

async function captureWithMarkers(elements) {
  const overlay = overlayMarkers(elements);
  const screenshot = await captureViewport();
  overlay.remove();
  return screenshot;
}
```

#### 1.3 Screenshot Failure Handling

```javascript
async function getPageState() {
  const elements = extractInteractableElements();
  const screenshot = await captureWithMarkers(elements);

  return {
    mode: screenshot ? 'vision' : 'dom-only',
    screenshot,  // null if capture failed
    elements,
    url: window.location.href,
    title: document.title,
  };
}
```

---

### Phase 2: DOM Element Extraction (Widget-Side)

**Goal**: Extract interactive elements with coordinates for precise targeting.

#### 2.1 Element Extractor (`widget/general-agent/element-extractor.js`)

```javascript
function extractInteractableElements() {
  const selectors = [
    'a', 'button', 'input', 'select', 'textarea',
    '[role="button"]', '[role="link"]', '[role="checkbox"]',
    '[role="menuitem"]', '[role="tab"]', '[onclick]', '[tabindex="0"]'
  ];

  const elements = [];
  document.querySelectorAll(selectors.join(',')).forEach((el, index) => {
    // Skip invisible elements
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    if (!isElementVisible(el)) return;

    elements.push({
      index: index + 1,
      tag: el.tagName.toLowerCase(),
      text: getElementText(el),
      selector: generateSelector(el),
      bbox: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      attributes: extractRelevantAttributes(el),
    });
  });

  return elements;
}

function getElementText(el) {
  // Priority: aria-label > innerText > placeholder > title
  return el.getAttribute('aria-label')
    || el.innerText?.slice(0, 100)
    || el.getAttribute('placeholder')
    || el.getAttribute('title')
    || '';
}

function generateSelector(el) {
  // Generate stable CSS selector
  if (el.id) return `#${el.id}`;
  if (el.getAttribute('data-testid')) return `[data-testid="${el.getAttribute('data-testid')}"]`;

  // Fallback to path-based selector
  return generatePathSelector(el);
}
```

#### 2.2 Element List Format (for LLM context)

```javascript
function formatElementList(elements) {
  return elements.map(el =>
    `[${el.index}] <${el.tag}> "${el.text}" at (${el.bbox.x}, ${el.bbox.y})`
  ).join('\n');
}

// Example output:
// [1] <button> "Submit Order" at (450, 320)
// [2] <input> "Enter your email" at (200, 180)
// [3] <a> "View Pricing" at (600, 50)
```

---

### Phase 3: Action Execution Engine (Widget-Side)

**Goal**: Execute arbitrary actions on the page based on LLM instructions.

#### 3.1 Action Types

```typescript
type GeneralAction =
  | { type: 'click', target: ElementSelector }
  | { type: 'type', target: ElementSelector, text: string }
  | { type: 'select', target: ElementSelector, value: string }
  | { type: 'scroll', direction: 'up' | 'down', amount?: number }
  | { type: 'hover', target: ElementSelector }
  | { type: 'wait', condition: WaitCondition }
  | { type: 'extract', target: ElementSelector, schema: ZodSchema }
  | { type: 'navigate', url: string }
  | { type: 'done', result: any }
  | { type: 'fail', reason: string };

type ElementSelector =
  | { index: number }           // From serialized DOM
  | { css: string }             // CSS selector
  | { text: string }            // Text content match
  | { ariaLabel: string };      // Accessibility label
```

#### 3.2 Action Executor (`widget/general-agent/action-executor.js`)

```javascript
async function executeAction(action) {
  // 1. Resolve element from selector
  const element = resolveElement(action.target);

  // 2. Scroll into view if needed
  await scrollIntoView(element);

  // 3. Execute action type
  switch (action.type) {
    case 'click':
      element.click();
      break;
    case 'type':
      await simulateTyping(element, action.text);
      break;
    // ... etc
  }

  // 4. Wait for DOM to stabilize
  await waitForDOMStable();

  // 5. Return result
  return { success: true, newState: extractInteractableElements() };
}
```

#### 3.3 Error Recovery

```javascript
async function executeWithRetry(action, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await executeAction(action);
    } catch (error) {
      if (error instanceof ElementNotFoundError) {
        // Re-extract DOM and ask LLM for alternative
        const newDOM = extractInteractableElements();
        return { retry: true, newState: newDOM, error: error.message };
      }
      throw error;
    }
  }
}
```

---

### Phase 4: Backend Inference Engine (Vision-First)

**Goal**: Process screenshot + elements and determine optimal actions using Claude's vision capabilities.

#### 4.1 New API Endpoint: `/api/agent-step`

```typescript
// Request
interface AgentStepRequest {
  conversationId: string;
  agentId: string;
  userGoal: string;
  pageState: {
    mode: 'vision' | 'dom-only';  // Indicates if screenshot available
    url: string;
    title: string;
    screenshot?: string;           // Base64 PNG with markers (primary)
    elements: ElementInfo[];       // For precise targeting
  };
  previousActions: ActionResult[];
  userConfig?: any;
}

interface ElementInfo {
  index: number;
  tag: string;
  text: string;
  selector: string;
  bbox: { x: number; y: number; width: number; height: number };
}

// Response
interface AgentStepResponse {
  thinking: string;           // Chain-of-thought (for debugging)
  action: GeneralAction;      // Next action to execute
  confidence: number;         // 0-1 confidence score
  done: boolean;              // Task complete?
  message?: string;           // Message to show user
}
```

#### 4.2 System Prompt Design (Vision-First)

```typescript
const VISION_AGENT_SYSTEM_PROMPT = `
You are an AI agent that can see and interact with web pages. You receive:
1. A screenshot of the current page with numbered markers [1], [2], [3] on interactive elements
2. A list of elements with their indices and text content
3. The user's goal

Your job is to determine the SINGLE next action to achieve the goal.

## How to Interpret the Screenshot
- Red numbered markers like [1], [2], [3] indicate clickable/interactive elements
- The marker number corresponds to the element index in the element list
- Use the visual layout to understand relationships between elements
- Use element text to understand what each element does

## Available Actions
- click: Click an element by its marker number
- type: Type text into an input field (click it first if not focused)
- select: Choose an option from a dropdown
- scroll: Scroll the page up or down
- wait: Wait for content to load
- done: Task is complete, return result
- fail: Task cannot be completed, explain why

## Guidelines
1. LOOK at the screenshot first - it shows the actual page state
2. Match visual elements with their marker numbers
3. Take ONE action at a time
4. If you can't find an element, scroll or describe what you're looking for
5. Report success when the goal is clearly achieved

## Response Format
{
  "thinking": "I can see [describe what you see]. To achieve the goal, I should...",
  "action": { "type": "click", "target": { "index": 3 } },
  "confidence": 0.9,
  "done": false
}
`;

// Fallback for DOM-only mode (when screenshot capture fails)
const DOM_ONLY_SYSTEM_PROMPT = `
You are an AI agent that can interact with web pages. You receive:
1. A list of interactive elements with their text and positions
2. The user's goal

Note: Screenshot capture failed, so you're working with element descriptions only.
...
`;
```

#### 4.3 LLM Provider Configuration

**Recommendation**: Use Claude Sonnet 4 via Anthropic API directly.

Reasons:
- Best performance on web understanding tasks
- Native tool use support
- Excellent instruction following
- Prompt caching for cost efficiency

**Claude Agent SDK Assessment**:

The Agent SDK *could* run on the backend, but provides minimal value for this use case:

| Agent SDK Built-in Tool | Useful for Browser Agent? |
|-------------------------|---------------------------|
| Read, Write, Edit | ❌ File operations |
| Bash, Glob, Grep | ❌ Terminal/filesystem |
| WebSearch, WebFetch | ⚠️ Maybe for context |
| AskUserQuestion | ✅ Yes |

The SDK's value proposition is **built-in tool execution**. Since none of the built-in tools help with DOM interaction, you'd implement all browser tools yourself anyway. At that point, the SDK adds complexity without benefit - just use the API directly.

The SDK also requires Claude Code runtime on the backend, adding deployment complexity.

**Verdict**: Use Anthropic API directly. Only reconsider if Agent SDK adds browser/DOM tools in the future.

```typescript
// src/app/api/lib/llm/generalAgentProvider.ts
import Anthropic from '@anthropic-ai/sdk';

export async function planNextAction(request: AgentStepRequest) {
  const client = new Anthropic();

  // Build message with vision if available
  const content = [];

  if (request.pageState.screenshot) {
    // Vision mode: include screenshot
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/png',
        data: request.pageState.screenshot,
      },
    });
  }

  // Always include element list
  content.push({
    type: 'text',
    text: `
Page: ${request.pageState.url}
Title: ${request.pageState.title}

Interactive Elements:
${formatElementList(request.pageState.elements)}

Goal: ${request.userGoal}

Previous actions: ${JSON.stringify(request.previousActions.slice(-3))}
`,
  });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: request.pageState.mode === 'vision'
      ? VISION_AGENT_SYSTEM_PROMPT
      : DOM_ONLY_SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  });

  return parseActionResponse(response);
}
```

---

### Phase 5: Agent Loop & State Management

**Goal**: Orchestrate multi-step task execution with vision-first approach.

#### 5.1 Agent Loop (Widget-Side)

```javascript
// widget/general-agent/agent-loop.js
async function runAgentLoop(userGoal, maxSteps = 10) {
  const history = [];

  for (let step = 0; step < maxSteps; step++) {
    // 1. Capture page state (vision-first)
    const pageState = await getPageState();
    // Returns: { mode, screenshot, elements, url, title }

    // 2. Call backend for next action
    const response = await fetch('/api/agent-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        agentId,
        userGoal,
        pageState,
        previousActions: history.map(h => h.action)
      })
    });

    const { action, thinking, done, message } = await response.json();

    // 3. Show thinking to user (optional)
    if (showThinking) displayThinking(thinking);

    // 4. Check for completion
    if (done || action.type === 'done') {
      displayMessage(message || 'Task completed!');
      return { success: true, result: action.result };
    }

    if (action.type === 'fail') {
      displayMessage(action.reason);
      return { success: false, reason: action.reason };
    }

    // 5. Execute action using DOM selector
    const element = pageState.elements.find(e => e.index === action.target.index);
    const result = await executeAction(action, element);
    history.push({ action, result, pageState: { mode: pageState.mode, url: pageState.url } });

    // 6. Wait for page to update
    await waitForDOMStable();
    await sleep(300);
  }

  return { success: false, reason: 'Max steps exceeded' };
}
```

#### 5.2 Conversation Integration

Maintain backward compatibility with existing chat interface:

```javascript
// Modified processMessage in widget/conversation.js
async function processMessage(text, role) {
  // ... existing code ...

  // Detect if this is a general agent task
  if (shouldUseGeneralAgent(text)) {
    // Switch to agent loop mode
    state.isAgentMode = true;
    displayMessage("I'll help you with that. Let me analyze the page...", 'assistant');

    const result = await runAgentLoop(text);

    if (result.success) {
      displayMessage(`Done! ${result.result || ''}`, 'assistant');
    } else {
      displayMessage(`I couldn't complete that: ${result.reason}`, 'assistant');
    }

    state.isAgentMode = false;
    return;
  }

  // ... existing tool-based flow ...
}
```

---

### Phase 6: Hybrid Mode (Predefined + General)

**Goal**: Keep existing predefined actions while adding general capabilities.

#### 6.1 Action Priority System

```typescript
// Backend: /api/agent-step or /api/inference
async function decideAction(request) {
  // 1. Check if predefined action matches
  const predefinedMatch = await matchPredefinedAction(request);
  if (predefinedMatch && predefinedMatch.confidence > 0.9) {
    return { usePredefied: true, action: predefinedMatch };
  }

  // 2. Fall back to general agent
  return { usePredefined: false, action: await planGeneralAction(request) };
}
```

#### 6.2 Configuration Options

```typescript
interface AgentConfig {
  // Existing
  model: string;
  systemMessage: string;

  // New
  generalAgentEnabled: boolean;        // Enable general agent mode
  generalAgentFallback: boolean;       // Use general agent when no tool matches
  visionEnabled: boolean;              // Enable screenshot capture
  maxAgentSteps: number;               // Max steps per task (default: 10)
  domTokenBudget: number;              // Max tokens for DOM (default: 4000)
  showAgentThinking: boolean;          // Show reasoning to user
}
```

---

## File Structure Changes

```
blizzardberry/
├── widget/
│   ├── index.js              # Entry (modified)
│   ├── dom.js                # Widget DOM (existing)
│   ├── conversation.js       # Message flow (modified)
│   ├── actions.js            # Action routing (modified)
│   ├── api.js                # Backend calls (modified)
│   │
│   ├── general-agent/        # NEW DIRECTORY
│   │   ├── index.js          # Module exports
│   │   ├── screenshot.js     # Vision capture (modern-screenshot)
│   │   ├── marker-overlay.js # [1][2][3] element markers
│   │   ├── element-extractor.js  # DOM element extraction
│   │   ├── action-executor.js    # Action execution
│   │   ├── agent-loop.js         # Multi-step orchestration
│   │   └── page-state.js         # getPageState() coordinator
│   │
│   └── ...
│
├── src/app/api/
│   ├── (main)/
│   │   ├── inference/        # Existing (for predefined tools)
│   │   └── agent-step/       # NEW: Vision-first agent endpoint
│   │       └── route.ts
│   │
│   └── lib/
│       ├── llm/
│       │   ├── ...
│       │   └── visionAgentProvider.ts  # NEW: Vision-first inference
│       │
│       └── general-agent/    # NEW DIRECTORY
│           ├── prompts.ts    # Vision + DOM-only system prompts
│           ├── parser.ts     # Response parsing
│           └── types.ts      # Type definitions
```

---

## Implementation Phases & Priorities

### Phase 1: Vision Capture + Element Extraction (Week 1-2)
- [ ] Implement `screenshot.js` with modern-screenshot
- [ ] Implement `element-extractor.js` for interactive elements
- [ ] Implement `marker-overlay.js` for [1][2][3] markers
- [ ] Add screenshot failure detection and fallback flag
- [ ] Unit tests for capture and extraction

### Phase 2: Action Execution (Week 2-3)
- [ ] Implement `action-executor.js` with all action types
- [ ] Add element resolution from index → DOM selector
- [ ] Add error recovery and retry logic
- [ ] Integration tests with sample pages

### Phase 3: Backend Inference - Vision-First (Week 3-4)
- [ ] Create `/api/agent-step` endpoint
- [ ] Implement vision-first prompt with screenshot + element list
- [ ] Implement DOM-only fallback prompt
- [ ] Add Claude Sonnet 4 integration with vision
- [ ] Test prompt effectiveness

### Phase 4: Agent Loop (Week 4-5)
- [ ] Implement `agent-loop.js` orchestration
- [ ] Integrate with existing chat UI
- [ ] Add progress indicators and thinking display
- [ ] Handle edge cases (navigation, page changes)

### Phase 5: Hybrid Mode - Predefined + General (Week 5-6)
- [ ] Implement action priority system
- [ ] Add configuration options in dashboard
- [ ] Backward compatibility testing
- [ ] Site owner documentation

### Phase 6: Polish & Optimization (Week 6+)
- [ ] Benchmark vision vs DOM-only accuracy
- [ ] Optimize screenshot capture performance
- [ ] Add prompt caching for cost reduction
- [ ] Production monitoring and logging

---

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Primary approach** | Vision-first with DOM-assist | 94% vs 73% accuracy on benchmarks |
| Screenshot library | modern-screenshot | 3x faster than html2canvas |
| Element marking | Set-of-Mark style [1][2][3] | Visual grounding for LLM |
| Element targeting | DOM selector from index | Precise clicking, no coordinate guessing |
| LLM provider | Claude Sonnet 4 via API | Best vision understanding, prompt caching |
| Fallback mode | DOM-only when screenshot fails | Graceful degradation |
| Agent SDK | Not used | Built-in tools not useful for browser interaction |
| Hybrid mode | Predefined first, general fallback | Preserve speed where configured |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Screenshot capture fails (CORS) | Medium | Medium | Auto-fallback to DOM-only mode |
| Cross-origin iframes blank | High | Medium | DOM-only fallback, document limitation |
| LLM misidentifies elements | Medium | Medium | Confidence thresholds, user confirmation |
| Screenshot too slow | Medium | Low | modern-screenshot (3x faster), viewport only |
| Image tokens increase cost | Certain | Low | ~1600 tokens/image, acceptable for accuracy gain |
| Action execution fails | Medium | Medium | Retry with re-capture, CSS selector fallback |
| Sites block widget (CSP) | Medium | High | Document limitation, no workaround |
| Reconstructed screenshot quality | Unknown | Medium | Benchmark against real screenshots |

---

## Success Metrics

1. **Zero-config activation**: Agent works on new page without action definition
2. **Action success rate**: >85% of tasks completed (target: match 90%+ benchmark scores)
3. **Vision capture success**: >90% of pages successfully screenshot
4. **Latency**: <4s for single action (screenshot + inference + execution)
5. **Token efficiency**: <7000 tokens per step (including ~1600 for image)
6. **Fallback rate**: <10% of steps require DOM-only fallback
7. **Backward compatibility**: Existing predefined actions still work

---

## Known Limitations

These are fundamental constraints that cannot be fully solved. The goal is to support **most websites**, not all.

### Browser Security Restrictions

| Limitation | What Won't Work | Why |
|------------|-----------------|-----|
| **Same-Origin Policy** | Interacting with cross-origin iframes | Browser security - no workaround |
| **Content Security Policy** | Sites blocking inline scripts | Widget may not load |
| **Shadow DOM (closed)** | Elements inside closed shadow roots | Not accessible via JS |
| **CORS** | Reading cross-origin resources | Browser security |

### DOM Extraction Limits

| Limitation | What Won't Work | Mitigation |
|------------|-----------------|------------|
| **Dynamic content** | Elements rendered after extraction | Re-extract after wait |
| **Virtual scroll** | Items not in DOM | Scroll to load, then extract |
| **Canvas/WebGL apps** | No DOM elements to extract | Vision mode or not supported |
| **Heavy frameworks** | Very deep component trees | Token budget trimming |

### Vision Mode Limits

| Limitation | What Won't Work | Mitigation |
|------------|-----------------|------------|
| **Cross-origin iframes** | Login widgets, embeds, ads | Render as blank area |
| **Cross-origin images** | CDN images without CORS | May fail or degrade |
| **Video elements** | Video players | Render as black box |
| **CSS animations** | Animated elements | Capture mid-animation |
| **Performance** | Very large pages | Cap at viewport |

### Action Execution Limits

| Limitation | What Won't Work | Mitigation |
|------------|-----------------|------------|
| **File uploads** | Native file picker | Not accessible via JS |
| **Drag and drop (complex)** | Desktop-to-browser DnD | Internal DnD may work |
| **Keyboard shortcuts** | App-specific hotkeys | May not trigger handlers |
| **Native alerts/confirms** | Browser dialogs | Cannot dismiss programmatically |
| **Print dialogs** | Print functionality | Cannot interact |
| **Permission prompts** | Camera/mic/location | User must handle manually |

### Page Types That May Not Work Well

| Page Type | Issue | Recommendation |
|-----------|-------|----------------|
| **SPAs with client-side routing** | URL doesn't change | Track DOM state instead |
| **Infinite scroll feeds** | Content constantly changing | Limit scope of task |
| **Real-time apps (chat, trading)** | State changes rapidly | May need human oversight |
| **Heavy animation/games** | Canvas-based, no DOM | Not supported |
| **CAPTCHA pages** | Designed to block automation | Fail gracefully |
| **Sites with bot detection** | May block widget script | Document as limitation |

### Performance Expectations

| Scenario | Expected Performance |
|----------|---------------------|
| Simple form fill (3-5 fields) | 5-10 seconds |
| Multi-step workflow (5-10 steps) | 15-30 seconds |
| Complex navigation task | 30-60 seconds |
| Data extraction from table | 5-15 seconds |

*Performance dominated by LLM inference time (~1-3s per step)*

---

## Open Questions for Discussion

1. **Should we support multi-tab/popup workflows?**
   - Increases complexity significantly
   - Could be Phase 7+

2. **How to handle authentication flows?**
   - User is already logged in (widget runs in their session)
   - But password managers, 2FA might need special handling

3. **Should we build a "recording" mode?**
   - User performs action, widget learns and converts to predefined
   - Bridge between general and predefined modes

4. **Rate limiting and abuse prevention?**
   - General agent is more expensive than predefined
   - May need per-agent or per-user limits

5. **Should we expose element indices in UI?**
   - Like browser-use's numbered boxes
   - Helps user understand what agent "sees"

---

## Prompting Techniques & Inference Optimizations

Analysis of techniques used by magnitude, browser-use, and skyvern to improve accuracy, speed, and cost efficiency.

### 1. Structured Output Format

**Browser-Use approach** (most comprehensive):

```json
{
  "thinking": "Step-by-step reasoning applying the reasoning rules...",
  "evaluation_previous_goal": "Clicked submit button, form was submitted. Verdict: Success",
  "memory": "Visited 2 of 5 pages. Found price $39.99 on Amazon.",
  "next_goal": "Click the 'Add to Cart' button to proceed.",
  "action": [{"click": {"index": 15}}]
}
```

**Why it works**:
- `thinking` forces explicit reasoning (like chain-of-thought)
- `evaluation_previous_goal` creates feedback loop for error recovery
- `memory` provides short-term context for multi-step tasks
- Separation of concerns improves accuracy

**Recommendation for Blizzardberry**: Adopt this structure.

### 2. DOM Change Markers

**Browser-Use**: Marks new elements with `*`:

```
[33]<button>Submit</button>
*[34]<div class="success-message">Order confirmed!</div>
```

**Why it works**: LLM immediately sees what changed after an action, reducing confusion about state.

**Recommendation**: Track DOM changes between steps, mark new elements.

### 3. Reasoning Rules (Browser-Use)

Browser-Use includes explicit reasoning instructions:

```
<reasoning_rules>
- Analyze the most recent "Next Goal" and "Action Result" in <agent_history>
- Explicitly judge success/failure/uncertainty of the last action
- Never assume an action succeeded just because it appears executed
- Always verify using screenshot as the primary ground truth
- If any todo.md items are finished, mark them as complete
- Analyze whether you are stuck (repeating same actions without progress)
</reasoning_rules>
```

**Why it works**: Prevents common failure modes like assuming success, not checking results, getting stuck in loops.

**Recommendation**: Include similar rules in system prompt.

### 4. Memory Masking (Magnitude)

Magnitude's observation masking system for token efficiency:

```typescript
// Configuration per observation type
Observation.fromConnector(id, screenshot, {
  type: 'screenshot',
  limit: 2,      // Keep only last 2 screenshots
  dedupe: true   // Skip if identical to previous
})
```

**How it works**:
1. Group observations by type (screenshot, action, result)
2. Apply deduplication (remove consecutive identical observations)
3. Apply limits (keep only last N of each type)
4. Freeze mask for prompt caching (preserve cached observations)

**Why it works**: Reduces tokens without losing critical context. Old screenshots rarely matter if you have recent ones.

**Recommendation**: Implement similar masking for conversation history.

### 5. Prompt Caching (Magnitude/Claude)

Magnitude uses Claude's prompt caching:

```typescript
{{ _.role("system", cache_control={"type": "ephemeral"}) }}
<instructions>
{{ instructions }}
</instructions>
```

**How it works**:
- Mark stable content (system prompt, instructions) as cacheable
- Claude reuses cached tokens across requests
- 90% cost reduction on cached tokens

**Implementation for Blizzardberry**:

```typescript
const response = await client.messages.create({
  model: 'claude-sonnet-4-20250514',
  system: [
    {
      type: 'text',
      text: SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' }  // Cache this
    }
  ],
  messages: [...],
});
```

### 6. Multi-Model Routing (Magnitude)

Different models for different tasks:

| Task | Model | Why |
|------|-------|-----|
| Action planning | Claude Sonnet | Best reasoning |
| Data extraction | Gemini Pro | Good at structured output, cheaper |
| Memory queries | Gemini Pro | Fast, cheaper |

**Recommendation**: Consider Haiku for simple tasks, Sonnet for complex reasoning.

### 7. Confidence Scores (Skyvern)

Each action includes confidence:

```json
{
  "action_type": "CLICK",
  "id": "element_15",
  "confidence_float": 0.85,
  "reasoning": "Button labeled 'Submit' matches user intent"
}
```

**Why it works**:
- Low confidence → ask user for confirmation
- Track confidence over time → detect when agent is struggling
- Multiple low-confidence actions → suggest alternative approach

**Recommendation**: Include confidence in response, use threshold for confirmation.

### 8. Action Chaining (Browser-Use)

Allow multiple actions per step when logical:

```
<efficiency_guidelines>
Recommended Action Combinations:
- input + click → Fill form field and submit in one step
- input + input → Fill multiple form fields
- click + click → Navigate through multi-step flows

Do NOT chain actions that change browser state multiple times:
- click + navigate (won't see if click succeeded)
- input + scroll (won't verify input)
</efficiency_guidelines>
```

**Why it works**: Reduces round-trips while maintaining observability.

**Recommendation**: Allow 1-3 actions per step with constraints.

### 9. Example-Based Prompting (Browser-Use)

Include good/bad examples in prompt:

```
<evaluation_examples>
Positive:
"Successfully navigated to product page and found target. Verdict: Success"

Negative:
"Failed to input text into search bar as I cannot see it. Verdict: Failure"
</evaluation_examples>
```

**Why it works**: LLMs learn from examples better than abstract instructions.

**Recommendation**: Include 2-3 examples of each output field.

### 10. Click Context Analysis (Skyvern)

Distinguish between deterministic and user-dependent clicks:

```json
{
  "click_context": {
    "thought": "This is a gender selection radio button, choice depends on user",
    "single_option_click": false
  }
}
```

**Why it works**: Prevents agent from making arbitrary choices on user-dependent fields.

**Recommendation**: Include for sensitive selections (gender, preferences, etc.).

---

## Recommended Prompt Structure for Blizzardberry

Based on competitor analysis:

```typescript
const VISION_AGENT_SYSTEM_PROMPT = `
You are an AI agent that can see and interact with web pages.

<input_format>
You receive:
1. A screenshot with numbered markers [1], [2], [3] on interactive elements
2. An element list: [index] <tag> "text" at (x, y)
3. Previous actions and their outcomes
4. The user's goal
</input_format>

<reasoning_rules>
1. LOOK at the screenshot first - it shows the actual page state
2. Verify the outcome of your previous action before planning the next
3. If an action failed, try a different approach
4. If stuck (same action 3+ times), report to user
5. Never assume an action succeeded - verify visually
</reasoning_rules>

<action_rules>
- You may execute 1-3 actions per step
- Safe combinations: input + click, click + click (same context)
- Never combine: actions that navigate away, scroll + other actions
- If confidence < 0.7, ask for user confirmation
</action_rules>

<output_format>
{
  "thinking": "Describe what you see, evaluate previous action, plan next step",
  "evaluation": "Previous action result: Success/Failure/Uncertain",
  "memory": "Key facts to remember for next steps",
  "actions": [
    {
      "type": "click",
      "target": {"index": 3},
      "confidence": 0.9,
      "reasoning": "Button labeled 'Submit' matches goal"
    }
  ],
  "done": false
}
</output_format>

<examples>
Good thinking: "I can see a login form. The previous click on 'Sign In' opened this modal. I should enter the email in field [2]."
Bad thinking: "Clicking submit." (no context, no verification)

Good evaluation: "Entered email successfully - I can see it displayed in the input field. Verdict: Success"
Bad evaluation: "Action completed." (no verification)
</examples>
`;
```

---

## Cost/Performance Tradeoffs

| Optimization | Accuracy Impact | Cost Impact | Latency Impact |
|--------------|-----------------|-------------|----------------|
| Prompt caching | None | -90% on cached | -20% (cache hits) |
| Memory masking | Slight decrease | -30-50% | Faster |
| Multi-model routing | Task-dependent | -40% (use Haiku) | Varies |
| Action chaining | Slight decrease | -50% (fewer steps) | Faster |
| Confidence filtering | Increase (human help) | +10% (retries) | Slower |

**Recommended priority**:
1. Prompt caching (free accuracy, huge cost savings)
2. Structured output with reasoning (improved accuracy)
3. Memory masking (cost reduction with minimal accuracy loss)
4. Confidence thresholds (safety net)

---

## Appendix: References & Code Examples

### Set-of-Mark Prompting (Our Approach)
Source: [Set-of-Mark Prompting (Microsoft Research)](https://arxiv.org/abs/2310.11441)

Visual markers overlaid on screenshots help LLMs achieve "extraordinary visual grounding":
```
Screenshot shows: [1] on blue button, [2] on email input, [3] on link
LLM can reference: "Click element [1]" → maps to DOM selector
```

### Magnitude Vision-First (94% WebVoyager)
Source: [Magnitude WebVoyager Results](https://github.com/sagekit/webvoyager)

Uses coordinate-based clicking without DOM:
```typescript
// Magnitude approach (pure coordinates)
action: { type: 'click', x: 450, y: 320 }
```

Our approach combines vision understanding with DOM selectors for more reliable execution.

### Browser-Use DOM Serialization
```
[33]<button class="btn-primary">Submit</button>
	[34]<span>Order Total: $50.00</span>
[35]*<div class="success-message">Payment confirmed!</div>
```
(* indicates new element since last step)

### Screenshot Library Performance
Source: [monday.com Engineering](https://engineering.monday.com/capturing-dom-as-image-is-harder-than-you-think-how-we-solved-it-at-monday-com/)

| Library | 10 Widgets | Recommendation |
|---------|------------|----------------|
| html2canvas | 21 seconds | ❌ Too slow |
| modern-screenshot | 7 seconds | ✅ Use this |
