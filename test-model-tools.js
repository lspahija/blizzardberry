// Test script to check which models support function calling
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const models = [
  'google/gemini-2.0-flash-001',
  'google/gemini-2.5-pro',
  'openai/gpt-4o-mini',
  'openai/gpt-4.1-nano',
  'openai/gpt-4.1-mini',
  'openai/gpt-4.1',
  'openai/gpt-4o',
  'openai/o4-mini',
  'openai/o4-mini-high',
  'anthropic/claude-3.7-sonnet',
  'anthropic/claude-sonnet-4',
  'anthropic/claude-opus-4',
  'x-ai/grok-3-mini',
  'x-ai/grok-3',
  'x-ai/grok-3-beta',
  'meta-llama/llama-4-maverick',
  'meta-llama/llama-4-scout',
  'deepseek/deepseek-chat',
  'qwen/qwen3-30b-a3b',
];

async function testModelTools(model) {
  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Model Tools Test',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: 'Hello, can you help me?',
            },
          ],
          tools: [
            {
              type: 'function',
              function: {
                name: 'test_function',
                description: 'A test function',
                parameters: {
                  type: 'object',
                  properties: {
                    test: {
                      type: 'string',
                      description: 'A test parameter',
                    },
                  },
                },
              },
            },
          ],
          tool_choice: 'auto',
        }),
      }
    );

    if (response.ok) {
      console.log(`✅ ${model}: Supports tools`);
      return true;
    } else {
      const error = await response.json();
      if (
        error.error?.message?.includes('tool use') ||
        error.error?.message?.includes('function')
      ) {
        console.log(
          `❌ ${model}: Does not support tools - ${error.error.message}`
        );
      } else {
        console.log(
          `⚠️ ${model}: Error (may or may not support tools) - ${error.error?.message || 'Unknown error'}`
        );
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ ${model}: Request failed - ${error.message}`);
    return false;
  }
}

async function testAllModels() {
  console.log('Testing models for tool support...\n');

  const results = [];
  for (const model of models) {
    const supportsTools = await testModelTools(model);
    results.push({ model, supportsTools });
    // Wait a bit between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n=== SUMMARY ===');
  const supportedModels = results.filter((r) => r.supportsTools);
  const unsupportedModels = results.filter((r) => !r.supportsTools);

  console.log(`\n✅ Models that support tools (${supportedModels.length}):`);
  supportedModels.forEach((r) => console.log(`  - ${r.model}`));

  console.log(
    `\n❌ Models that don't support tools (${unsupportedModels.length}):`
  );
  unsupportedModels.forEach((r) => console.log(`  - ${r.model}`));
}

// Run the test
if (!OPENROUTER_API_KEY) {
  console.error('Please set OPENROUTER_API_KEY environment variable');
  process.exit(1);
}

testAllModels().catch(console.error);
