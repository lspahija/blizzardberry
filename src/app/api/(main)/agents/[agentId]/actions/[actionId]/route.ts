import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { agentAuth } from '@/app/api/lib/auth/agentAuth';
import { deleteAction, updateAction, getAction } from '@/app/api/lib/store/actionStore';
import { Action } from '@/app/api/lib/model/action/baseAction';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ agentId: string; actionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId, actionId } = await params;

    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    const action = await getAction(actionId, agentId);

    if (!action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    return NextResponse.json({ action }, { status: 200 });
  } catch (error) {
    console.error('Error fetching action:', error);
    return NextResponse.json(
      { error: 'Failed to fetch action' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ agentId: string; actionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId, actionId } = await params;

    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    const action: Action = await req.json();

    if (!action.name || !action.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await updateAction(actionId, agentId, {
      name: action.name,
      description: action.description,
      execution_context: action.executionContext,
      execution_model: action.executionModel,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating action:', error);
    return NextResponse.json(
      { error: 'Failed to update action' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ agentId: string; actionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId, actionId } = await params;

    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    const body = await req.json();
    const { name, description, executionContext, executionModel } = body;

    const updateData: any = {};
    
    if (name !== undefined) {
      updateData.name = name;
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (executionContext !== undefined) {
      updateData.execution_context = executionContext;
    }
    
    if (executionModel !== undefined) {
      updateData.execution_model = executionModel;
    }

    if (Object.keys(updateData).length > 0) {
      await updateAction(actionId, agentId, updateData);
    }

    return NextResponse.json({ 
      success: true,
      updatedFields: Object.keys(body).filter(key => body[key] !== undefined)
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating action:', error);
    return NextResponse.json(
      { error: 'Failed to update action' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ agentId: string; actionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId, actionId } = await params;

    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    await deleteAction(actionId, agentId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting action:', error);
    return NextResponse.json(
      { error: 'Failed to delete action' },
      { status: 500 }
    );
  }
}
