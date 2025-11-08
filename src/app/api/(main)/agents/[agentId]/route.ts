import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { Agent } from '@/app/api/lib/model/agent/agent';
import { agentAuth } from '@/app/api/lib/auth/agentAuth';
import {
  deleteAgent,
  getAgentByUserId,
  updateAgent,
} from '@/app/api/lib/store/agentStore';
import { updatePrompts } from '@/app/api/lib/store/promptStore';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    const data = await getAgentByUserId(agentId);

    if (!data) {
      console.error('Error fetching agent:', agentId);
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      );
    }

    const agent: Agent = {
      id: data.id,
      name: data.name,
      websiteDomain: data.website_domain,
      model: data.model,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };

    return NextResponse.json({ agent }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
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

    const body = await request.json();
    const { name, websiteDomain, model, prompts } = body;

    if (!name || !model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await updateAgent(agentId, {
      name,
      website_domain: websiteDomain || null,
      model,
    });

    if (Array.isArray(prompts)) {
      await updatePrompts(agentId, prompts);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
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

    const body = await request.json();
    const { name, websiteDomain, model, prompts } = body;

    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (websiteDomain !== undefined) {
      updateData.website_domain = websiteDomain || null;
    }

    if (model !== undefined) {
      updateData.model = model;
    }

    if (Object.keys(updateData).length > 0) {
      await updateAgent(agentId, updateData);
    }

    if (Array.isArray(prompts)) {
      await updatePrompts(agentId, prompts);
    }

    return NextResponse.json(
      {
        success: true,
        updatedFields: Object.keys(body).filter(
          (key) => body[key] !== undefined
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await deleteAgent(agentId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
