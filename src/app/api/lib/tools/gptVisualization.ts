import OpenAI from 'openai';
export async function generateVisualizationWithGPT(
  data: any,
  description?: string
): Promise<{ svg?: string; error?: string }> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Create a data visualization for this data:

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

${description ? `User request: ${description}\n` : ''}

Please:
Visualize the data as a chart and return the SVG.`;

  try {
    const response = await openai.responses.create({
      model: 'gpt-5',
      input: prompt,
    });

    console.log('GPT-5 response:', JSON.stringify(response, null, 2));

    if (response.output && response.output.length > 1) {
      const messageOutput = response.output[1];
      if (messageOutput.type === 'message') {
        const textContent = messageOutput.content[0];
        if (textContent.type === 'output_text') {
          const svgMatch = textContent.text.match(/<svg[\s\S]*?<\/svg>/i);
          if (svgMatch) {
            return { svg: svgMatch[0] };
          }
        }
      }
    }

    return { error: 'No SVG generated in response' };
  } catch (error) {
    console.error('Error generating visualization with GPT-4.1:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate visualization',
    };
  }
}
