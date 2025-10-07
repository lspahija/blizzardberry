import { DOLLARS_TO_CREDITS, MARKUP_PERCENTAGE } from '@/app/api/lib/llm/constants';

interface ModelPrice {
  rawInput: number;
  rawOutput: number;
}

export interface MessageEstimateParams {
  credits: number;
  modelPrice: ModelPrice;
  avgInputTokens?: number;
  avgOutputTokens?: number;
  avgMessagesPerConversation?: number;
}

/**
 * Calculates the estimated number of conversations that can be sent with the given credits.
 * Takes into account that each message in a conversation sends all previous messages to the LLM.
 * For a conversation with N messages, total input tokens = avgInputTokens * (1 + 2 + 3 + ... + N)
 * and total output tokens = avgOutputTokens * N
 *
 * @param credits - Number of credits available
 * @param modelPrice - Price information for the selected model
 * @param avgInputTokens - Average input tokens per message (default: 30)
 * @param avgOutputTokens - Average output tokens per message (default: 120)
 * @param avgMessagesPerConversation - Average messages per conversation (default: 10)
 * @returns Estimated number of conversations
 */
export function calculateEstimatedMessages({
  credits,
  modelPrice,
  avgInputTokens = 30,
  avgOutputTokens = 120,
  avgMessagesPerConversation = 10,
}: MessageEstimateParams): number {
  // Sum of 1 + 2 + 3 + ... + N = N * (N + 1) / 2
  const cumulativeMultiplier = (avgMessagesPerConversation * (avgMessagesPerConversation + 1)) / 2;

  const totalInputTokens = avgInputTokens * cumulativeMultiplier;
  const totalOutputTokens = avgOutputTokens * avgMessagesPerConversation;

  const costPerConversation =
    (totalInputTokens * modelPrice.rawInput * MARKUP_PERCENTAGE +
     totalOutputTokens * modelPrice.rawOutput * MARKUP_PERCENTAGE) * DOLLARS_TO_CREDITS;

  return Math.floor(credits / costPerConversation);
}
