import { generateText } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';

export async function generateVisualizationWithLLM(
  data: any,
  description?: string
): Promise<{ svg?: string; error?: string }> {
  const prompt = `Create a professional data visualization for this data:

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

${description ? `User request: ${description}\n` : ''}

CRITICAL REQUIREMENTS:
- The chart MUST be rendered perfectly without any visual bugs or alignment issues
- All bars/data points must be properly aligned to their baseline/axis
- Labels must be clearly visible and not overlapping
- The chart must look professional and publication-ready
- Ensure accurate proportional scaling of all visual elements
- Use appropriate spacing and margins so nothing is cut off

DESIGN GUIDELINES:
- Use a consistent color palette
- If there are categories/regions, use colors to distinguish them and include a legend
- For time-series data, rotate x-axis labels if needed for readability
- Add gridlines for easier reading
- Ensure adequate spacing between bars/data points
- Use a clean, modern style
- Include a descriptive title and clear axis labels

Double-check that the final output has NO rendering bugs, misalignments, or visual glitches.

Return ONLY the complete, valid SVG code.`;

  try {
    const result = await generateText({
      model: openrouter('anthropic/claude-sonnet-4.5'),
      prompt: prompt,
    });
    const svgMatch = result.text.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      return { svg: svgMatch[0] };
    }
    console.error('No SVG generated in response', result.text);
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
