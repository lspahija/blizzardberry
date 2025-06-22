import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { Agent } from '@/app/api/lib/model/agent/agent';
import { agentAuth } from '@/app/api/lib/auth/agentAuth';
import {
  deleteAgent,
  getAgentByTeamAccess,
  updateAgent,
} from '@/app/api/lib/store/agentStore';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ agentId: string; teamSlug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId, teamSlug } = await params;

    const data = await getAgentByTeamAccess(agentId, session.user.id);

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
      teamId: data.team_id,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };

    return NextResponse.json({ agent, teamSlug }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await params;
    const { name, websiteDomain, model } = await req.json();

    // Check if user has access to the agent through team membership
    const agent = await getAgentByTeamAccess(agentId, session.user.id);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      );
    }

    const data = await updateAgent(agentId, {
      name,
      website_domain: websiteDomain,
      model,
    });

    return NextResponse.json({ agent: data }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
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

    // Check if user has access to the agent through team membership
    const agent = await getAgentByTeamAccess(agentId, session.user.id);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      );
    }

    await deleteAgent(agentId);

    return NextResponse.json({ message: 'Agent deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
