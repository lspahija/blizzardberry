import { NextResponse } from 'next/server';
import { fetchModelPrices } from '@/app/api/lib/llm/tokenUsageManager';
import { AGENT_MODELS } from '@/app/api/lib/model/agent/agent';

function formatPrice(pricePerToken: number) {
  // Convert to price per 1M tokens for readability
  const pricePerMillion = pricePerToken * 1_000_000;

  if (pricePerMillion >= 1) {
    return `$${pricePerMillion.toFixed(2)} / 1M tokens`;
  } else if (pricePerMillion >= 0.01) {
    return `$${pricePerMillion.toFixed(3)} / 1M tokens`;
  } else {
    return `$${pricePerMillion.toFixed(4)} / 1M tokens`;
  }
}

function formatModelPrices(rawPrices: Record<string, { input: number; output: number }>, sortBy: 'price' | 'order' = 'price') {
  const formatted: Record<string, { input: string; output: string; rawInput: number; rawOutput: number }> = {};

  let sortedEntries: [string, { input: number; output: number }][];

  if (sortBy === 'order') {
    // Sort entries by the order defined in AGENT_MODELS
    const modelOrder = Object.keys(AGENT_MODELS);
    sortedEntries = Object.entries(rawPrices).sort(([a], [b]) => {
      const indexA = modelOrder.indexOf(a);
      const indexB = modelOrder.indexOf(b);
      return indexA - indexB;
    });
  } else {
    // Sort entries by combined cost (input + output) in descending order
    sortedEntries = Object.entries(rawPrices).sort(([, a], [, b]) => {
      const costA = a.input + a.output;
      const costB = b.input + b.output;
      return costB - costA;
    });
  }

  for (const [model, prices] of sortedEntries) {
    formatted[model] = {
      input: formatPrice(prices.input),
      output: formatPrice(prices.output),
      rawInput: prices.input,
      rawOutput: prices.output
    };
  }

  return formatted;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') === 'order' ? 'order' : 'price';

    const modelPrices = await fetchModelPrices();
    const formattedPrices = formatModelPrices(modelPrices, sortBy);
    return NextResponse.json(formattedPrices, { status: 200 });
  } catch (error) {
    console.error('Error fetching model prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model prices' },
      { status: 500 }
    );
  }
}