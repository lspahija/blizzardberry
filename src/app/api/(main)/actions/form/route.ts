import { NextResponse } from 'next/server';
import { createAction } from '@/app/api/lib/actionStore';
import { Action } from '@/app/api/lib/model/action/baseAction';

export async function POST(req: Request) {
  try {
    const action: Action = await req.json();

    console.log('Received action:', JSON.stringify(action, null, 2));

    await createAction(
      action.name,
      action.description,
      action.executionContext,
      action.executionModel
    );

    return NextResponse.json({ actionName: action.name }, { status: 201 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
