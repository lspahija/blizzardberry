import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

enum ModelProvider {
  OpenRouter = 'openrouter',
  LMStudio = 'lmstudio',
}

export function getLanguageModel(model: string = 'google/gemini-2.0-flash-001') {
  const modelProvider =
    (process.env.MODEL_PROVIDER as ModelProvider) || ModelProvider.OpenRouter;

  switch (modelProvider) {
    case ModelProvider.OpenRouter:
      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY!,
      });
      return openrouter.chat(model);

    case ModelProvider.LMStudio:
      const lmstudio = createOpenAICompatible({
        name: 'lmstudio',
        baseURL: process.env.LMSTUDIO_BASE_URL!,
      });
      return lmstudio('qwen3-8b');

    default:
      throw new Error(
        `Unsupported model provider: ${modelProvider}. Supported providers: ${Object.values(ModelProvider).join(', ')}`
      );
  }
}
