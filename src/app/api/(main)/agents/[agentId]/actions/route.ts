import { NextResponse } from 'next/server';
import { Action } from '@/app/api/lib/model/action/baseAction';
import { auth } from '@/lib/auth/auth';
import { agentAuth } from '@/app/api/lib/auth/agentAuth';
import { createAction, getActions } from '@/app/api/lib/store/actionStore';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await params;

    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    const actions = await getActions(agentId);

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
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await params;

    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    const action: Action = await req.json();

    await createAction(
      action.name,
      action.description,
      action.executionContext,
      action.executionModel,
      agentId
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
