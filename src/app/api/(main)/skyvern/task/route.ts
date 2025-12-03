/**
 * Skyvern task execution endpoint
 * Runs a complete Skyvern task with URL and prompt
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Skyvern task request received`);

  try {
    const {
      url,
      prompt,
      maxSteps = 10,
      dataExtractionSchema,
      browserSessionId,
    } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    // Get Skyvern configuration from environment
    const skyvernApiKey = process.env.SKYVERN_API_KEY;
    const skyvernBaseUrl =
      process.env.SKYVERN_BASE_URL || 'https://api.skyvern.com';

    if (!skyvernApiKey) {
      console.error('SKYVERN_API_KEY not configured');
      return NextResponse.json(
        {
          error:
            'Skyvern is not configured. Please set SKYVERN_API_KEY environment variable.',
        },
        { status: 500 }
      );
    }

    console.log(`[${new Date().toISOString()}] Preparing Skyvern task request`);

    // Prepare the task request
    const taskRequest: any = {
      url,
      prompt,
      max_steps: maxSteps,
      user_agent: req.headers.get('user-agent') || 'BlizzardBerry Widget',
    };

    // Add optional parameters if provided
    if (dataExtractionSchema) {
      taskRequest.data_extraction_schema = dataExtractionSchema;
    }

    if (browserSessionId) {
      taskRequest.browser_session_id = browserSessionId;
    }

    console.log(`[${new Date().toISOString()}] Calling Skyvern API`);

    // Call Skyvern run_task API
    const skyvernResponse = await fetch(`${skyvernBaseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': skyvernApiKey,
      },
      body: JSON.stringify(taskRequest),
    });

    if (!skyvernResponse.ok) {
      const errorText = await skyvernResponse.text();
      console.error('Skyvern API error:', {
        status: skyvernResponse.status,
        body: errorText,
      });

      return NextResponse.json(
        {
          error: 'Skyvern API error',
          details: errorText,
          status: skyvernResponse.status,
        },
        { status: 500 }
      );
    }

    const taskResult = await skyvernResponse.json();
    console.log(`[${new Date().toISOString()}] Skyvern task created`);

    const totalTime = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] Skyvern task completed in ${totalTime}ms`
    );

    return NextResponse.json({
      taskId: taskResult.task_id || taskResult.id,
      status: taskResult.status,
      result: taskResult,
      timestamp: new Date().toISOString(),
      processingTime: totalTime,
    });
  } catch (error) {
    console.error('Error in Skyvern task API:', error);
    return NextResponse.json(
      {
        error: 'Failed to process Skyvern task request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check task status
 */
export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    const skyvernApiKey = process.env.SKYVERN_API_KEY;
    const skyvernBaseUrl =
      process.env.SKYVERN_BASE_URL || 'https://api.skyvern.com';

    if (!skyvernApiKey) {
      return NextResponse.json(
        { error: 'Skyvern is not configured' },
        { status: 500 }
      );
    }

    // Get task status from Skyvern
    const skyvernResponse = await fetch(
      `${skyvernBaseUrl}/api/v1/tasks/${taskId}`,
      {
        headers: {
          'x-api-key': skyvernApiKey,
        },
      }
    );

    if (!skyvernResponse.ok) {
      const errorText = await skyvernResponse.text();
      return NextResponse.json(
        {
          error: 'Failed to get task status',
          details: errorText,
        },
        { status: skyvernResponse.status }
      );
    }

    const taskStatus = await skyvernResponse.json();

    return NextResponse.json({
      taskId,
      status: taskStatus.status,
      result: taskStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting Skyvern task status:', error);
    return NextResponse.json(
      {
        error: 'Failed to get task status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
