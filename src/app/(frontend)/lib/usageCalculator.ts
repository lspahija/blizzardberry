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
}

/**
 * Calculates the estimated number of messages that can be sent with the given credits
 * @param credits - Number of credits available
 * @param modelPrice - Price information for the selected model
 * @param avgInputTokens - Average input tokens per message (default: 30)
 * @param avgOutputTokens - Average output tokens per message (default: 120)
 * @returns Estimated number of messages
 */
export function calculateEstimatedMessages({
  credits,
  modelPrice,
  avgInputTokens = 30,
  avgOutputTokens = 120,
}: MessageEstimateParams): number {
  const costPerMessage =
    (avgInputTokens * modelPrice.rawInput * MARKUP_PERCENTAGE +
     avgOutputTokens * modelPrice.rawOutput * MARKUP_PERCENTAGE) * DOLLARS_TO_CREDITS;

  return Math.floor(credits / costPerMessage);
}
