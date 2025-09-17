import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import {
  getConversationsForAgentOwner,
  createNewConversation,
  addMessage,
  getMessagesForConversation,
} from '@/app/api/lib/store/conversationStore.ts';
import { getAgent } from '@/app/api/lib/store/agentStore.ts';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const conversations = await getConversationsForAgentOwner(
      session.user.id,
      limit,
      offset
    );

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { agentId, endUserConfig } = await request.json();

    const agent = await getAgent(agentId);
    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      );
    }

    const conversationId = await createNewConversation(
      agentId,
      agent.created_by,
      endUserConfig || {}
    );

    await addMessage(
      conversationId,
      'assistant',
      `Hi! I'm ${agent.name}. How can I help you today?` // TODO: make this configurable
    );

    const messages = await getMessagesForConversation(conversationId);

    return NextResponse.json(
      {
        conversationId,
        messages,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
