import { NextResponse } from 'next/server';
import { Action } from '@/app/api/lib/model/action/baseAction';
import { auth } from '@/lib/auth';
import { chatbotAuth } from '@/app/api/lib/chatbotAuth';
import { createAction, getActions } from '@/app/api/lib/actionStore';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ chatbotId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatbotId } = await params;

    const authResponse = await chatbotAuth(session.user.id, chatbotId);
    if (authResponse) return authResponse;

    const actions = await getActions(chatbotId);

    return NextResponse.json({ actions }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatbotId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatbotId } = await params;

    const authResponse = await chatbotAuth(session.user.id, chatbotId);
    if (authResponse) return authResponse;

    const action: Action = await req.json();

    const { error } = await createAction(
      action.name,
      action.description,
      action.executionContext,
      action.executionModel,
      chatbotId
    );

    if (error) {
      console.error('Error creating action:', error);
      return NextResponse.json(
        { error: 'Failed to create action' },
        { status: 500 }
      );
    }

    return NextResponse.json({ actionName: action.name }, { status: 201 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
