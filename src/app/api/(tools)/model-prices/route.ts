import { NextResponse } from 'next/server';
import { fetchModelPrices } from '@/app/api/lib/llm/tokenUsageManager';

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

function formatModelPrices(rawPrices: Record<string, { input: number; output: number }>) {
  const formatted: Record<string, { input: string; output: string; rawInput: number; rawOutput: number }> = {};

  for (const [model, prices] of Object.entries(rawPrices)) {
    formatted[model] = {
      input: formatPrice(prices.input),
      output: formatPrice(prices.output),
      rawInput: prices.input,
      rawOutput: prices.output
    };
  }

  return formatted;
}

export async function GET() {
  try {
    const modelPrices = await fetchModelPrices();
    const formattedPrices = formatModelPrices(modelPrices);
    return NextResponse.json(formattedPrices, { status: 200 });
  } catch (error) {
    console.error('Error fetching model prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model prices' },
      { status: 500 }
    );
  }
}