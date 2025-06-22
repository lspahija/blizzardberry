import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getAgentsByTeam, createAgent } from '@/app/api/lib/store/agentStore';
import { userHasTeamAccess } from '@/app/api/lib/store/teamStore';

interface RouteContext {
  params: {
    teamId: string;
  };
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Explicitly resolve the params to address the Next.js warning
    const { teamId } = await Promise.resolve(context.params);
    
    // Check if the user has access to this team
    const hasAccess = await userHasTeamAccess(session.user.id, teamId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const agentsFromDb = await getAgentsByTeam(teamId);

    const agents = agentsFromDb.map((agent: any) => ({
      id: agent.id,
      name: agent.name,
      websiteDomain: agent.website_domain,
      model: agent.model,
      teamId: agent.team_id,
      createdBy: agent.created_by,
      createdAt: agent.created_at,
    }));

    return NextResponse.json({ agents }, { status: 200 });
  } catch (error) {
    // Note: context.params might not be available here if the promise was rejected
    console.error(`[TEAMS/AGENTS]`, error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { teamId } = await Promise.resolve(context.params);
    
    // Check if the user has access to this team
    const hasAccess = await userHasTeamAccess(session.user.id, teamId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, websiteDomain, model } = body;

    if (!name || !websiteDomain || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: name, websiteDomain, model' },
        { status: 400 }
      );
    }

    const agentId = await createAgent(
      name,
      websiteDomain,
      teamId,
      session.user.id,
      model
    );

    return NextResponse.json({ agentId }, { status: 201 });
  } catch (error) {
    console.error(`[TEAMS/AGENTS/POST]`, error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
} 