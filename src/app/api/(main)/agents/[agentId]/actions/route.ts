import { NextResponse } from 'next/server';
import { Action } from '@/app/api/lib/model/action/baseAction';
import { auth } from '@/lib/auth/auth';
import { agentAuth } from '@/app/api/lib/auth/agentAuth';
import { createAction, getActions } from '@/app/api/lib/store/actionStore';
import { getSubscription } from '@/app/api/lib/store/subscriptionStore';
import { pricing } from '@/app/api/(main)/stripe/pricingModel';

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

    const validationResponse = await maxActionReached(session.user.id, agentId);
    if (validationResponse) return validationResponse;

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

async function maxActionReached(userId: string, agentId: string) {
  const sub = await getSubscription(userId);
  const maxActions = pricing.tiers[sub.tier.toLowerCase()].actionsPerAgent;

  const existingActions = await getActions(agentId);

  if (existingActions.length >= maxActions) {
    return NextResponse.json(
      { error: 'Action limit reached for this subscription tier' },
      { status: 403 }
    );
  }
}
