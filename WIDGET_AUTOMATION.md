# Widget Automation with Claude AI

Transform your embeddable widget into an AI-powered automation assistant that can interact with any website it's installed on.

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│           Customer's Website (widget installed)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User: "Fill the email field with john@example.com"         │
│         │                                                    │
│         ▼                                                    │
│  Widget captures DOM of customer's page                     │
│  • All buttons: 23 elements                                 │
│  • All inputs: 5 elements (email, password, name...)        │
│  • All links: 47 elements                                   │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          │ POST /api/action-inference
          │ { domState, prompt }
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Your Blizzardberry Backend                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Calls Claude AI with DOM + prompt                          │
│  Claude analyzes and decides:                               │
│  "The user wants to fill email, I see an input with         │
│   name='email', I should use action type 'input'"           │
│                                                              │
│  Returns: {                                                  │
│    type: "input",                                            │
│    selector: "input[name='email']",                          │
│    value: "john@example.com",                                │
│    reasoning: "Found email input field"                      │
│  }                                                            │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          │ Action response
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│           Customer's Website (widget installed)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Widget executes action on customer's page:                 │
│  document.querySelector("input[name='email']").value =      │
│    "john@example.com"                                        │
│                                                              │
│  ✅ Email field filled!                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Why This Architecture?

Your widget will be **installed on customers' websites** (like Intercom, Drift, etc.). This means:

✅ **Widget runs in customer's browser** - Has direct DOM access
✅ **AI analyzes from backend** - Claude figures out what to do
✅ **Actions execute locally** - Fast, no external browser needed
✅ **Works on any page** - Adapts to any website structure

## Setup

### 1. No Additional API Keys Needed!

This uses the **OpenRouter API** you already have configured. It calls Claude through OpenRouter.

```bash
# .env.local - you already have this configured
OPENROUTER_API_KEY=your_key_here  # Already set ✅
```

### 2. Test the Integration

Start your dev server:

```bash
pnpm dev
```

## Usage

### Single Action

```javascript
import { runAutomationStep } from './widget/automation.js';

// User says: "Click the login button"
const result = await runAutomationStep('Click the login button');

// Result:
// {
//   success: true,
//   action: { type: "click", selector: "#login-btn", reasoning: "..." },
//   executionResult: { success: true, ... }
// }
```

### Multi-Step Workflow

```javascript
import { runMultiStepAutomation } from './widget/automation.js';

// User says: "Fill out the contact form"
const result = await runMultiStepAutomation(
  'Fill contact form: name is John Doe, email is john@example.com, message is Hello',
  10 // max steps
);

// Claude will:
// Step 1: Click name field
// Step 2: Type "John Doe"
// Step 3: Click email field
// Step 4: Type "john@example.com"
// Step 5: Click message field
// Step 6: Type "Hello"
// Step 7: Click submit button
// Step 8: Return { type: "complete" }
```

## Real-World Integration Example

### Add to Your Chat Widget

```javascript
// In your widget's message handler
import { runAutomationStep, runMultiStepAutomation } from './automation.js';

export async function handleUserMessage(message) {
  // Check if this is an automation request
  if (message.toLowerCase().includes('fill') ||
      message.toLowerCase().includes('click') ||
      message.toLowerCase().includes('submit')) {

    // Run automation
    const result = await runAutomationStep(message);

    if (result.success) {
      return `✅ Done! I ${result.action.type}ed the element. ${result.action.reasoning}`;
    } else {
      return `❌ Sorry, I couldn't do that: ${result.error}`;
    }
  }

  // Otherwise use normal chat flow
  return await callLLM();
}
```

## API Reference

### `runAutomationStep(prompt, iframe?)`

Execute a single automation action.

**Parameters:**
- `prompt` (string) - What the user wants to do
- `iframe` (HTMLIFrameElement, optional) - Target iframe (defaults to main page)

**Returns:**
```javascript
{
  success: boolean,
  complete: boolean,  // true if task is done
  action: {
    type: "click" | "input" | "select" | "scroll" | "wait" | "navigate" | "complete" | "error",
    selector: string,  // for click/input/select
    value: string,     // for input/select
    reasoning: string  // Claude's explanation
  },
  executionResult: {
    success: boolean,
    ...
  }
}
```

### `runMultiStepAutomation(taskPrompt, maxSteps?, iframe?)`

Execute a multi-step workflow.

**Parameters:**
- `taskPrompt` (string) - Overall task description
- `maxSteps` (number) - Max steps to attempt (default: 10)
- `iframe` (HTMLIFrameElement, optional) - Target iframe

**Returns:**
```javascript
{
  success: boolean,
  isComplete: boolean,
  totalSteps: number,
  steps: [
    {
      step: number,
      action: { ... },
      result: { ... },
      reasoning: string
    }
  ]
}
```

## Action Types

Claude can suggest these action types:

| Type | Description | Example |
|------|-------------|---------|
| `click` | Click an element | Click login button |
| `input` | Type text | Fill email field |
| `select` | Select dropdown option | Choose country |
| `scroll` | Scroll page | Scroll down to footer |
| `wait` | Wait for duration | Wait 2 seconds |
| `navigate` | Go to URL | Navigate to /pricing |
| `complete` | Task done | Indicates success |
| `error` | Can't complete | Element not found |

## Examples

### Example 1: Form Filling

```javascript
// Customer has your widget on their contact page
// User types: "Fill my contact info"

import { runMultiStepAutomation } from './automation.js';

const result = await runMultiStepAutomation(
  'Fill contact form with: name John Doe, email john@example.com, company Acme Inc',
  10
);

// Widget will:
// 1. Find name field, fill "John Doe"
// 2. Find email field, fill "john@example.com"
// 3. Find company field, fill "Acme Inc"
// 4. Look for submit button
// 5. Click it
// 6. Return complete
```

### Example 2: Navigation

```javascript
// User types: "Go to the pricing page"

const result = await runAutomationStep('Go to the pricing page');

// Claude will:
// 1. Look at all links on the page
// 2. Find one with text "Pricing" or href="/pricing"
// 3. Return { type: "click", selector: "a[href='/pricing']" }
// 4. Widget clicks it
```

### Example 3: Account Management

```javascript
// User types: "Update my email to newemail@example.com"

const result = await runMultiStepAutomation(
  'Navigate to account settings and update email to newemail@example.com',
  15
);

// Claude will:
// 1. Find "Account" or "Settings" link
// 2. Click it
// 3. Find email input field
// 4. Clear existing value
// 5. Type new email
// 6. Find save/update button
// 7. Click it
// 8. Return complete
```

## Advanced: Custom Action Handlers

Want to handle specific actions differently?

```javascript
import { captureDOMState, executeAction } from './domUtils.js';
import { getActionInference } from './api.js';

export async function customAutomation(prompt) {
  // 1. Capture DOM
  const dom = captureDOMState();

  // 2. Get Claude's suggestion
  const { action } = await getActionInference(dom, prompt);

  // 3. Custom handling
  if (action.type === 'input' && action.selector.includes('password')) {
    // Special handling for password fields
    console.log('Using secure input for password field');
    // Your custom logic here
  }

  // 4. Execute
  return await executeAction(action);
}
```

## Backend: How Action Inference Works

The `/api/action-inference` endpoint:

```typescript
// POST /api/action-inference
{
  domState: {
    url: "https://example.com/contact",
    title: "Contact Us",
    elements: [
      { tagName: "input", name: "email", selector: "input[name='email']", ... },
      { tagName: "button", text: "Submit", selector: "#submit-btn", ... },
      ...
    ]
  },
  prompt: "Fill email with test@example.com"
}

// Response:
{
  action: {
    type: "input",
    selector: "input[name='email']",
    value: "test@example.com",
    reasoning: "Found email input field matching the request"
  }
}
```

Claude receives:
- Concise list of interactive elements (top 50)
- Element properties: tag, id, name, text, selector, etc.
- User's intent

Claude returns:
- Single action to execute
- Specific selector
- All parameters needed
- Reasoning for transparency

## Cost Estimates

**Per action inference**: ~$0.01 (one Claude API call)

Example costs:
- Single button click: $0.01
- Fill 3-field form: $0.03 (3 inferences)
- Multi-step checkout: $0.10 (10 inferences)

Much cheaper than spinning up Playwright or Puppeteer!

## Comparison: Widget vs Full Browser Automation

| Aspect | Widget Automation (This) | Skyvern/Playwright |
|--------|--------------------------|---------------------|
| **Where it runs** | Customer's browser | Your server's browser |
| **DOM access** | Direct & instant | Remote via CDP |
| **Use case** | Embedded widgets | Backend scraping |
| **Cost per action** | ~$0.01 | ~$0.05-0.50 |
| **Setup complexity** | Simple (API call) | Complex (Docker, Playwright) |
| **Latency** | Low (~500ms) | High (~2-5s) |
| **Customer install** | ✅ Yes | ❌ No |

## When to Use What

### Use Widget Automation When:
✅ Widget is installed on customer's website
✅ Need to interact with customer's actual page
✅ Want instant execution in user's browser
✅ Building interactive features (form filling, navigation)

### Use Skyvern When:
❌ Need to scrape external websites
❌ Batch processing hundreds of pages
❌ Need screenshot/video recordings
❌ Complex multi-page workflows on sites you don't control

For your **embeddable widget use case**, widget automation is the right choice!

## Troubleshooting

### "Element not found"

**Cause**: Claude returned a selector that doesn't exist.

**Solutions**:
- Make sure page is fully loaded before capturing DOM
- Provide more specific prompts: "Click the blue submit button" vs "Click submit"
- Check console logs to see what elements were captured

### "Action failed to execute"

**Cause**: Element exists but can't be interacted with.

**Solutions**:
- Element might be hidden or covered
- Try scrolling element into view first
- Check if there's an overlay (modal, popup) blocking it

### "Too many steps"

**Cause**: Task is too complex or Claude is confused.

**Solutions**:
- Break task into smaller pieces
- Increase `maxSteps` parameter
- Provide more specific instructions

## What You've Built

✅ **DOM Capture** (`widget/domUtils.js`) - Grabs page state
✅ **Claude Inference** (`/api/action-inference`) - Decides actions
✅ **Action Execution** (`widget/domUtils.js`) - Executes on page
✅ **Workflow Orchestration** (`widget/automation.js`) - Multi-step flows

Your widget can now automate interactions on ANY website it's installed on! 🎉

## Next Steps

1. **Add to your chat UI** - Let users trigger automation via chat
2. **Visual feedback** - Highlight elements before clicking
3. **Action history** - Log all automation actions
4. **Error recovery** - Retry failed actions
5. **Custom actions** - Add domain-specific automations

## Files Created

```
blizzardberry/
├── widget/
│   ├── domUtils.js          # DOM capture & action execution
│   ├── automation.js        # Workflow orchestration
│   └── api.js              # API calls (updated)
│
├── src/app/api/(main)/
│   ├── action-inference/    # Claude-based action inference
│   │   └── route.ts
│   └── skyvern/            # Optional: Full Skyvern tasks
│       └── task/route.ts
│
└── WIDGET_AUTOMATION.md    # This file
```

You're ready to build AI-powered automation into your widget! 🚀
