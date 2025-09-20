import { NextRequest, NextResponse } from 'next/server';
import { chartJsGenerator } from '@/app/api/lib/visualization/chartJsGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, chartType, xKey, yKey, title, options } = body;

    if (!data || !Array.isArray(data) || !xKey || !yKey) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const html = chartJsGenerator.generateChartHTML({
      data,
      chartType,
      xKey,
      yKey,
      title,
      options
    });

    return NextResponse.json({ html });
  } catch (error) {
    console.error('Error generating visualization:', error);
    return NextResponse.json(
      { error: 'Failed to generate chart' },
      { status: 500 }
    );
  }
}
