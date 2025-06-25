import { captureCredit, holdCredit } from '@/app/api/lib/store/creditStore';
import { LanguageModelUsage } from 'ai';
import { AgentModel } from '@/app/api/lib/model/agent/agent';

// 1 credit = $0.01, so 1 dollar = 100 credits
const DOLLARS_TO_CREDITS = 100;

export async function createCreditHold(
  userId: string,
  creditsToHold: number,
  ref: string, // "chat-completion #abc"
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
  const costs = DOLLAR_COSTS_PER_MILLION_TOKENS[model];
  if (!costs) {
    throw new Error(`No dollar cost defined for model: ${model}`);
  }

  const MARKUP_PERCENTAGE = 2.5; // 150% markup
  const inputDollars =
    ((tokenUsage.promptTokens || 0) / 1_000_000) *
    costs.input *
    MARKUP_PERCENTAGE;
  const outputDollars =
    ((tokenUsage.completionTokens || 0) / 1_000_000) *
    costs.output *
    MARKUP_PERCENTAGE;

  // Convert dollars to credits and round to 4 decimal places
  return (
    Math.round((inputDollars + outputDollars) * DOLLARS_TO_CREDITS * 10000) /
    10000
  );
}

// Costs in dollars per million tokens
const DOLLAR_COSTS_PER_MILLION_TOKENS: Record<
  AgentModel,
  { input: number; output: number }
> = {
  [AgentModel.GEMINI_2_0_FLASH]: {
    input: 0.1,
    output: 0.4,
  },
  [AgentModel.GEMINI_2_5_PRO]: {
    input: 1.25,
    output: 10,
  },
  [AgentModel.GPT_4O_MINI]: {
    input: 0.15,
    output: 0.6,
  },
  [AgentModel.CHATGPT_4_1]: {
    input: 2,
    output: 8,
  },
  [AgentModel.CHATGPT_4O]: {
    input: 2.5,
    output: 10,
  },
  [AgentModel.O4_MINI]: {
    input: 1.5,
    output: 6.0,
  },
  [AgentModel.O4_MINI_HIGH]: {
    input: 3.0,
    output: 12.0,
  },
  [AgentModel.CLAUDE_3_7_SONNET]: {
    input: 30.0,
    output: 150.0,
  },
  [AgentModel.CLAUDE_SONNET_4]: {
    input: 15.0,
    output: 75.0,
  },
  [AgentModel.CLAUDE_OPUS_4]: {
    input: 150.0,
    output: 750.0,
  },
  [AgentModel.GROK_3_MINI]: {
    input: 1.0,
    output: 1.0,
  },
  [AgentModel.GROK_3]: {
    input: 2.0,
    output: 2.0,
  },
  [AgentModel.GROK_3_BETA]: {
    input: 5.0,
    output: 5.0,
  },
  [AgentModel.GPT_4_1_NANO]: {
    input: 0.5,
    output: 2.0,
  },
  [AgentModel.GPT_4_1_MINI]: {
    input: 1.0,
    output: 4.0,
  },
  [AgentModel.LLAMA_4_MAVERICK]: {
    input: 2.0,
    output: 2.0,
  },
  [AgentModel.LLAMA_4_SCOUT]: {
    input: 3.0,
    output: 3.0,
  },
  [AgentModel.DEEPSEEK_V3]: {
    input: 1.0,
    output: 1.0,
  },
  [AgentModel.DEEPSEEK_R1]: {
    input: 1.0,
    output: 1.0,
  },
  [AgentModel.QWEN_3_30B]: {
    input: 0.5,
    output: 2.0,
  },
};
