// Test script to check which models support function calling
import { AGENT_MODELS } from './src/app/api/lib/model/agent/agent';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const models = Object.keys(AGENT_MODELS);

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
