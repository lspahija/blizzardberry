import { generateText } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';

export async function generateVisualizationWithLLM(
  data: any,
  description?: string
): Promise<{ svg?: string; error?: string }> {
  const prompt = `Create a data visualization for this data:

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

${description ? `User request: ${description}\n` : ''}

Please:
Visualize the data as a chart and return the SVG.`;

  try {
    const result = await generateText({
      model: openrouter('openai/gpt-4o'),
      prompt: prompt,
    });
    const svgMatch = result.text.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      return { svg: svgMatch[0] };
    }
    return { error: 'No SVG generated in response' };
  } catch (error) {
    console.error('Error generating visualization with LLM:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate visualization',
    };
  }
}
