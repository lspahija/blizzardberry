import { NextResponse } from 'next/server';
import {
  addMessage,
  deleteLastAssistantMessage,
} from '@/app/api/lib/store/chatStore';

export async function POST(
  request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const { role, content, removeLastAssistantMessage } = await request.json();

  if (!chatId || !role || !content) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  if (removeLastAssistantMessage && role === 'assistant') {
    await deleteLastAssistantMessage(chatId);
  }

  await addMessage(chatId, role, content);

  return NextResponse.json({ success: true }, { status: 200 });
}
