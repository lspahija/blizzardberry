import { captureCredit, holdCredit } from '@/app/api/lib/store/creditStore';
import { LanguageModelUsage } from 'ai';

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
    mapTokenUsageToCreditUsage(tokenUsage),
    ref,
    idempotencyKey
  );
}

function mapTokenUsageToCreditUsage(tokenUsage: LanguageModelUsage): number {
  // TODO: Implement logic to convert token usage to credit usage (this should depend on the model)
  return tokenUsage.totalTokens; // this is a just a placeholder
}
