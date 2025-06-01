import { NextResponse } from 'next/server';
import { getChatbot } from '@/app/api/lib/store/chatbotStore';

export async function chatbotAuth(userId: string, chatbotId: string) {
  const { data: chatbot, error: chatbotError } = await getChatbot(chatbotId);

  if (chatbotError || !chatbot) {
    return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
  }

  if (chatbot.created_by !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
}
