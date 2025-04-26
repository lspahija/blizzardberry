import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export function getModelProvider() {
    const modelProvider = process.env.MODEL_PROVIDER || 'openrouter'; // Default to openrouter

    if (modelProvider === 'openrouter') {
        const openrouter = createOpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY!,
        });
        return openrouter.chat('google/gemini-2.0-flash-exp:free');
    } else if (modelProvider === 'lmstudio') {
        const lmstudio = createOpenAICompatible({
            name: 'lmstudio',
            baseURL: process.env.LMSTUDIO_BASE_URL!,
        });
        return lmstudio('gemma-3-12b-it-qat');
    } else {
        throw new Error(`Unsupported model provider: ${modelProvider}. Supported providers: openrouter, lmstudio`);
    }
}