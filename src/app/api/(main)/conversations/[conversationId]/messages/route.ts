import { NextResponse } from 'next/server';
import {
  addMessage,
  deleteLastAssistantMessage,
} from '@/app/api/lib/store/chatStore';

export async function POST(
  request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId: conversationId } = await params;
  const { role, content, removeLastAssistantMessage } = await request.json();

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
