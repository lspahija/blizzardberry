import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { Agent, AgentModelList } from '@/app/api/lib/model/agent/agent';
import { createAgent, getUserAgents } from '@/app/api/lib/store/agentStore';
import { userHasTeamAccess } from '@/app/api/lib/store/teamStore';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agents = await getUserAgents(session.user.id);

    return NextResponse.json({ agents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, websiteDomain, model, teamId } = await req.json();

    if (!name || !websiteDomain || !model || !teamId) {
      return NextResponse.json(
        { error: 'Name, website domain, model, and team ID are required' },
        { status: 400 }
      );
    }

    if (!AgentModelList.includes(model)) {
      return NextResponse.json(
        { error: 'Invalid model selected' },
        { status: 400 }
      );
    }

    // Check if user has access to the team
    const hasAccess = await userHasTeamAccess(session.user.id, teamId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to team' },
        { status: 403 }
      );
    }

    const data = await createAgent(name, websiteDomain, teamId, session.user.id, model);

    return NextResponse.json({ agentId: data.id }, { status: 201 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
