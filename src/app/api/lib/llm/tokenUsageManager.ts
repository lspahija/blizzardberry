import { captureCredit, holdCredit } from '@/app/api/lib/store/creditStore';
import { LanguageModelUsage } from 'ai';
import { AgentModel, AGENT_MODELS } from '@/app/api/lib/model/agent/agent';

// 1 credit = $0.01, so 1 dollar = 100 credits
const DOLLARS_TO_CREDITS = 100;

// Interface for OpenRouter API model response
interface OpenRouterModel {
  id: string;
  pricing: {
    prompt: string; // USD per token
    completion: string; // USD per token
  };
}

// Fetch model prices from OpenRouter API
export async function fetchModelPrices(): Promise<
  Record<AgentModel, { input: number; output: number }>
> {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch model prices: ${response.statusText}`);
  }

  const data = await response.json();
  const models: OpenRouterModel[] = data.data;

  const costs: Record<AgentModel, { input: number; output: number }> =
    {} as any;

  for (const agentModel of Object.keys(AGENT_MODELS) as AgentModel[]) {
    const model = models.find((m) => m.id === agentModel);

    if (!model) {
      throw new Error(`No pricing data found for model: ${agentModel}`);
    }

    const inputCost = parseFloat(model.pricing.prompt);
    const outputCost = parseFloat(model.pricing.completion);

    if (isNaN(inputCost) || isNaN(outputCost)) {
      throw new Error(`Invalid pricing data for model: ${agentModel}`);
    }

    costs[agentModel] = {
      input: inputCost,
      output: outputCost,
    };
  }

  return costs;
}

// Initialize costs dynamically
let DOLLAR_COSTS_PER_TOKEN: Record<
  AgentModel,
  { input: number; output: number }
> | null = null;

let costsPromise: Promise<void> | null = null;

async function ensureCostsInitialized() {
  if (DOLLAR_COSTS_PER_TOKEN) {
    return;
  }

  if (!costsPromise) {
    costsPromise = (async () => {
      DOLLAR_COSTS_PER_TOKEN = await fetchModelPrices();
    })();
  }

  await costsPromise;
}

export async function createCreditHold(
  userId: string,
  creditsToHold: number,
  ref: string,
  idempotencyKey: string
) {
  return await holdCredit(userId, creditsToHold, ref, idempotencyKey);
}

export async function recordUsedTokens(
  userId: string,
  holdIds: number[],
  tokenUsage: LanguageModelUsage,
  model: AgentModel,
  ref: string,
  idempotencyKey: string
) {
  if (tokenUsage.totalTokens === 0) {
    console.warn('No tokens used, skipping credit capture');
    return;
  }

  console.log('Token Usage:', JSON.stringify(tokenUsage, null, 2));

  await ensureCostsInitialized();

  await captureCredit(
    userId,
    holdIds,
    mapTokenUsageToCreditUsage(tokenUsage, model),
    ref,
    idempotencyKey
  );
}

export function mapTokenUsageToCreditUsage(
  tokenUsage: LanguageModelUsage,
  model: AgentModel
): number {
  if (!DOLLAR_COSTS_PER_TOKEN) {
    throw new Error('Model costs not initialized. Call ensureCostsInitialized() first.');
  }

  const costs = DOLLAR_COSTS_PER_TOKEN[model];
  if (!costs) {
    throw new Error(`No dollar cost defined for model: ${model}`);
  }

  const MARKUP_PERCENTAGE = 2.5; // 150% markup
  const inputDollars =
    (tokenUsage.inputTokens || 0) * costs.input * MARKUP_PERCENTAGE;
  const outputDollars =
    (tokenUsage.outputTokens || 0) * costs.output * MARKUP_PERCENTAGE;

  // Convert dollars to credits and round to 4 decimal places
  return (
    Math.round((inputDollars + outputDollars) * DOLLARS_TO_CREDITS * 10000) /
    10000
  );
}
