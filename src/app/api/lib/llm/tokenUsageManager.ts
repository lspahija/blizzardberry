import { captureCredit, holdCredit } from '@/app/api/lib/store/creditStore';
import { LanguageModelUsage } from 'ai';
import { AgentModel } from '@/app/api/lib/model/agent/agent';

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
  const costs = CREDIT_COSTS_PER_TOKEN[model];
  if (!costs) {
    throw new Error(`No credit cost defined for model: ${model}`);
  }

  const MARKUP_PERCENTAGE = 2.5; // 150% markup
  const inputCredits =
    (tokenUsage.promptTokens || 0) * costs.input * MARKUP_PERCENTAGE;
  const outputCredits =
    (tokenUsage.completionTokens || 0) * costs.output * MARKUP_PERCENTAGE;

  // Round to 4 decimal places to avoid floating-point precision issues
  return Math.round((inputCredits + outputCredits) * 10000) / 10000;
}

// Credit costs per token (1 credit = $0.01)
// Costs are per token, derived from approximate pricing per million tokens
// TODO: Update these costs based on actual pricing from providers
const CREDIT_COSTS_PER_TOKEN: Record<
  AgentModel,
  { input: number; output: number }
> = {
  [AgentModel.GEMINI_2_0_FLASH]: {
    input: 0.000035, // $0.35 per million tokens
    output: 0.000035,
  },  
  [AgentModel.GEMINI_2_5_PRO]: {
    input: 0.00025, // $2.50 per million tokens
    output: 0.00025,
  },
  [AgentModel.GPT_4O_MINI]: {
    input: 0.00015, // $1.50 per million tokens
    output: 0.0006, // $6 per million tokens
  },
  [AgentModel.CHATGPT_4_1]: {
    input: 0.001, // $10 per million tokens
    output: 0.003, // $30 per million tokens
  },
  [AgentModel.CHATGPT_4O]: {
    input: 0.0005, // $5 per million tokens
    output: 0.0015, // $15 per million tokens
  },
  [AgentModel.O4_MINI]: {
    input: 0.00015, // $1.50 per million tokens
    output: 0.0006, // $6 per million tokens
  },
  [AgentModel.O4_MINI_HIGH]: {
    input: 0.0003, // $3 per million tokens
    output: 0.0012, // $12 per million tokens
  },
  [AgentModel.CLAUDE_3_7_SONNET]: {
    input: 0.003, // $30 per million tokens
    output: 0.015, // $150 per million tokens
  },
  [AgentModel.CLAUDE_SONNET_4]: {
    input: 0.0015, // $15 per million tokens
    output: 0.0075, // $75 per million tokens
  },
  [AgentModel.CLAUDE_OPUS_4]: {
    input: 0.015, // $150 per million tokens
    output: 0.075, // $750 per million tokens
  },
  [AgentModel.GROK_3_MINI]: {
    input: 0.0001, // $1 per million tokens
    output: 0.0001,
  },
  [AgentModel.GROK_3]: {
    input: 0.0002, // $2 per million tokens
    output: 0.0002,
  },
  [AgentModel.GROK_3_BETA]: {
    input: 0.0005, // $5 per million tokens
    output: 0.0005,
  },
  [AgentModel.GPT_4_1_NANO]: {
    input: 0.00005, // $0.50 per million tokens
    output: 0.0002, // $2 per million tokens
  },
  [AgentModel.GPT_4_1_MINI]: {
    input: 0.0001, // $1 per million tokens
    output: 0.0004, // $4 per million tokens
  },
  [AgentModel.LLAMA_4_MAVERICK]: {
    input: 0.0002, // $2 per million tokens
    output: 0.0002,
  },
  [AgentModel.LLAMA_4_SCOUT]: {
    input: 0.0003, // $3 per million tokens
    output: 0.0003,
  },
  [AgentModel.DEEPSEEK_V3]: {
    input: 0.0001, // $1 per million tokens
    output: 0.0001,
  },
  [AgentModel.DEEPSEEK_R1]: {
    input: 0.0001, // $1 per million tokens
    output: 0.0001,
  },
  [AgentModel.QWEN_3_30B]: {
    input: 0.00005, // $0.50 per million tokens
    output: 0.0002, // $2 per million tokens
  },
};
