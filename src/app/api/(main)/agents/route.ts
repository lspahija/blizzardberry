import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { Agent, AgentModelList } from '@/app/api/lib/model/agent/agent';
import { createAgent, getAgents } from '@/app/api/lib/store/agentStore';
import { createPrompt } from '@/app/api/lib/store/promptStore';
import { getSubscription } from '@/app/api/lib/store/subscriptionStore';
import { pricing } from '@/app/api/(main)/stripe/pricingModel';
import { getActions } from '@/app/api/lib/store/actionStore';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, websiteDomain, model, prompts } = await req.json();

    if (!AgentModelList.includes(model)) {
      return NextResponse.json(
        { error: 'Invalid model selected' },
        { status: 400 }
      );
    }

    const validationResponse = await maxAgentsReached(session.user.id);
    if (validationResponse) return validationResponse;

    const data = await createAgent(name, websiteDomain, session.user.id, model);

    if (prompts && Array.isArray(prompts)) {
      for (const promptContent of prompts) {
        if (typeof promptContent === 'string' && promptContent.trim()) {
          await createPrompt(promptContent.trim(), data.id);
        }
      }
    }

    return NextResponse.json({ agentId: data.id }, { status: 201 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(_: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getAgents(session.user.id);

    const agents: Agent[] = data.map((d) => ({
      id: d.id,
      name: d.name,
      websiteDomain: d.website_domain,
      model: d.model,
      createdBy: d.created_by,
      createdAt: d.created_at,
    }));

    return NextResponse.json({ agents }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function maxAgentsReached(userId: string) {
  const sub = await getSubscription(userId);
  const maxAgents = pricing.tiers[sub.tier.toLowerCase()].agents;

  const existingAgents = await getAgents(userId);

  if (existingAgents.length >= maxAgents) {
    return NextResponse.json(
      { error: 'Agent limit reached for this subscription tier' },
      { status: 403 }
    );
  }
}
