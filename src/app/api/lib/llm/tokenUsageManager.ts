import { captureCredit, holdCredit } from '@/app/api/lib/store/creditStore';
import { LanguageModelUsage } from 'ai';
import { ChatbotModel } from '@/app/api/lib/model/chatbot/chatbot';

export async function createCreditHold(
  userId: string,
  creditsToHold: number,
  ref: string, // “chat-completion #abc”
  idempotencyKey: string
) {
  return await holdCredit(userId, creditsToHold, ref, idempotencyKey);
}

export async function recordUsedTokens(
  userId: string,
  holdIds: number[],
  tokenUsage: LanguageModelUsage,
  model: ChatbotModel,
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
  model: ChatbotModel
): number {
  const costs = CREDIT_COSTS_PER_TOKEN[model];
  if (!costs) {
    throw new Error(`No credit cost defined for model: ${model}`);
  }

  const inputCredits = (tokenUsage.promptTokens || 0) * costs.input;
  const outputCredits = (tokenUsage.completionTokens || 0) * costs.output;

  // Round to 4 decimal places to avoid floating-point precision issues
  return Math.round((inputCredits + outputCredits) * 10000) / 10000;
}

// Credit costs per token (1 credit = $0.01)
// Costs are per token, derived from approximate pricing per million tokens
// TODO: Update these costs based on actual pricing from providers
const CREDIT_COSTS_PER_TOKEN: Record<
  ChatbotModel,
  { input: number; output: number }
> = {
  [ChatbotModel.GEMINI_2_0_FLASH]: {
    input: 0.000035, // $0.35 per million tokens
    output: 0.000035,
  },
  [ChatbotModel.GEMINI_2_5_PRO]: {
    input: 0.00025, // $2.50 per million tokens
    output: 0.00025,
  },
  [ChatbotModel.CHATGPT_4_1]: {
    input: 0.001, // $10 per million tokens
    output: 0.003, // $30 per million tokens
  },
  [ChatbotModel.CHATGPT_4O]: {
    input: 0.0005, // $5 per million tokens
    output: 0.0015, // $15 per million tokens
  },
  [ChatbotModel.CLAUDE_SONNET_4]: {
    input: 0.0015, // $15 per million tokens
    output: 0.0075, // $75 per million tokens
  },
  [ChatbotModel.GROK_3_BETA]: {
    input: 0.0005, // $5 per million tokens
    output: 0.0005,
  },
  [ChatbotModel.DEEPSEEK_R1]: {
    input: 0.00002, // $0.20 per million tokens
    output: 0.00002,
  },
  [ChatbotModel.QWEN_3_30B]: {
    input: 0.0001, // $1 per million tokens
    output: 0.0001,
  },
};
