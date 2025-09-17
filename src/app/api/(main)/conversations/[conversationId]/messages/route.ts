import { NextResponse } from 'next/server';
import {
  addMessage,
  deleteLastAssistantMessage,
  getMessagesForConversation,
} from '@/app/api/lib/store/conversationStore.ts';

export async function POST(
  request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId: conversationId } = await params;
  const { role, content, removeLastAssistantMessage } = await request.json();

  console.log('POST new messages conversationId, request body:', {
    conversationId,
    role,
    content,
    removeLastAssistantMessage,
  });

  if (!conversationId || !role || !content) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  if (removeLastAssistantMessage && role === 'assistant') {
    await deleteLastAssistantMessage(conversationId);
  }

  await addMessage(conversationId, role, content);

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function GET(
  request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;

  if (!conversationId) {
    return NextResponse.json(
      { error: 'Missing conversationId' },
      { status: 400 }
    );
  }

  try {
    const messages = await getMessagesForConversation(conversationId);
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
