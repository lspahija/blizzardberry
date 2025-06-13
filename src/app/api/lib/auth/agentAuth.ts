import { NextResponse } from 'next/server';
import { getAgent } from '@/app/api/lib/store/agentStore';

export async function agentAuth(userId: string, agentId: string) {
  const agent = await getAgent(agentId);

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  if (agent.created_by !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
}
