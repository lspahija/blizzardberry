/**
 * Action Inference Endpoint
 * Analyzes DOM state and user intent to suggest the next action to take
 *
 * USES SELF-HOSTED SKYVERN for specialized browser automation AI
 * Falls back to Claude if Skyvern is not available
 */

import { NextRequest, NextResponse } from 'next/server';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { generateObject } from 'ai';
import { z } from 'zod';

// Schema for action responses
const ActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('click'),
    selector: z.string(),
    reasoning: z.string(),
  }),
  z.object({
    type: z.literal('input'),
    selector: z.string(),
    value: z.string(),
    reasoning: z.string(),
  }),
  z.object({
    type: z.literal('select'),
    selector: z.string(),
    value: z.string(),
    reasoning: z.string(),
  }),
  z.object({
    type: z.literal('scroll'),
    direction: z.enum(['up', 'down', 'left', 'right']),
    amount: z.number().optional(),
    reasoning: z.string(),
  }),
  z.object({
    type: z.literal('wait'),
    duration: z.number(),
    reasoning: z.string(),
  }),
  z.object({
    type: z.literal('navigate'),
    url: z.string(),
    reasoning: z.string(),
  }),
  z.object({
    type: z.literal('complete'),
    reasoning: z.string(),
    message: z.string(),
  }),
  z.object({
    type: z.literal('error'),
    reasoning: z.string(),
    message: z.string(),
  }),
]);

type Action = z.infer<typeof ActionSchema>;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Action inference request received`);

  try {
    const { domState, prompt, conversationId } = await req.json();

    if (!domState) {
      return NextResponse.json(
        { error: 'domState is required' },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    // Try Skyvern first if configured
    const skyvernUrl = process.env.SKYVERN_URL || 'http://localhost:8000';
    const skyvernApiKey = process.env.SKYVERN_API_KEY;
    let action: Action;

    if (skyvernApiKey) {
      console.log(`[${new Date().toISOString()}] Calling Skyvern for action inference`);
      try {
        action = await callSkyvernInference(
          skyvernUrl,
          skyvernApiKey,
          domState,
          prompt
        );
        console.log('[Skyvern] Successfully got action from Skyvern');
      } catch (skyvernError) {
        console.error('[Skyvern] Failed, falling back to Claude:', skyvernError);
        action = await callClaudeInference(domState, prompt);
      }
    } else {
      console.log(`[${new Date().toISOString()}] Skyvern not configured, using Claude`);
      action = await callClaudeInference(domState, prompt);
    }

    const totalTime = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] Action inference completed in ${totalTime}ms`,
      { action }
    );

    return NextResponse.json({
      action,
      conversationId,
      timestamp: new Date().toISOString(),
      processingTime: totalTime,
    });
  } catch (error) {
    console.error('Error in action inference API:', error);
    return NextResponse.json(
      {
        error: 'Failed to process action inference request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Call self-hosted Skyvern for action inference
 */
async function callSkyvernInference(
  skyvernUrl: string,
  apiKey: string,
  domState: any,
  prompt: string
): Promise<Action> {
  const response = await fetch(`${skyvernUrl}/v1/widget/inference`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      dom_state: domState,
      user_prompt: prompt,
      url: domState.url,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Skyvern API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();

  if (!result.actions || result.actions.length === 0) {
    throw new Error('No actions returned from Skyvern');
  }

  // Return the first action (Skyvern returns a list)
  const skyvernAction = result.actions[0];

  // Convert Skyvern's action format to our format
  return {
    type: skyvernAction.type,
    selector: skyvernAction.selector,
    value: skyvernAction.value,
    reasoning: skyvernAction.reasoning || '',
    direction: skyvernAction.direction,
    amount: skyvernAction.amount,
    url: skyvernAction.url,
  } as Action;
}

/**
 * Fallback to Claude for action inference
 */
async function callClaudeInference(domState: any, prompt: string): Promise<Action> {
  const domSummary = buildDOMSummary(domState);

  const result = await generateObject({
      model: openrouter('anthropic/claude-3.5-sonnet'),
      schema: ActionSchema,
      system: `You are a browser automation assistant. Given a DOM state and user intent, determine the SINGLE NEXT ACTION to take.

IMPORTANT RULES:
1. Suggest ONLY ONE action at a time
2. Choose the most specific selector possible
3. If the goal is already achieved, return type: "complete"
4. If the requested element doesn't exist, return type: "error"
5. Be conservative - prefer simple actions over complex ones
6. Always provide clear reasoning for your choice

Available action types:
- click: Click an element (button, link, etc)
- input: Type text into an input field
- select: Select an option from a dropdown
- scroll: Scroll the page in a direction
- wait: Wait for a specified duration (ms)
- navigate: Navigate to a new URL
- complete: Task is complete
- error: Cannot complete the requested action

When selecting elements:
- Prefer IDs over classes
- Use data attributes if available
- Be specific to avoid ambiguity
- Verify the element is visible and interactable`,
      prompt: `Current page URL: ${domState.url}
Page title: ${domState.title}

Available interactive elements:
${domSummary}

User request: "${prompt}"

What single action should be taken next? Provide the action type, required parameters, and reasoning.`,
    });

  return result.object;
}

/**
 * Build a concise DOM summary for the LLM
 * We want to provide enough info for the LLM to make decisions without overwhelming it
 */
function buildDOMSummary(domState: any): string {
  const elements = domState.elements || [];

  if (elements.length === 0) {
    return 'No interactive elements found on the page.';
  }

  // Limit to top 50 most relevant elements
  const topElements = elements.slice(0, 50);

  const summary = topElements
    .map((el: any, idx: number) => {
      const parts: string[] = [];

      // Element identifier
      parts.push(`[${idx}] <${el.tagName}>`);

      // ID if present
      if (el.id) parts.push(`id="${el.id}"`);

      // Type if present
      if (el.type) parts.push(`type="${el.type}"`);

      // Name if present
      if (el.name) parts.push(`name="${el.name}"`);

      // Text content (truncated)
      if (el.text) {
        const text = el.text.substring(0, 50);
        parts.push(`text="${text}"`);
      }

      // Placeholder
      if (el.placeholder) parts.push(`placeholder="${el.placeholder}"`);

      // Aria label
      if (el.ariaLabel) parts.push(`aria-label="${el.ariaLabel}"`);

      // Href for links
      if (el.href && el.tagName === 'a') {
        const url = new URL(el.href, domState.url);
        parts.push(`href="${url.pathname}"`);
      }

      // Selector for targeting
      parts.push(`selector="${el.selector}"`);

      return parts.join(' ');
    })
    .join('\n');

  const hiddenCount = elements.length - topElements.length;
  const footer =
    hiddenCount > 0
      ? `\n... and ${hiddenCount} more elements (showing top 50)`
      : '';

  return summary + footer;
}
