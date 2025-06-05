import { NextResponse } from 'next/server';
import { getChatbot } from '@/app/api/lib/store/chatbotStore';

export async function chatbotAuth(userId: string, chatbotId: string) {
  const chatbot = await getChatbot(chatbotId);

  if (!chatbot) {
    return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
  }

  if (chatbot.created_by !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
}
