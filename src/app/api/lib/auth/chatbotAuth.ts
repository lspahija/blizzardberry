import { supabaseClient } from '@/app/api/lib/store/supabase';
import { NextResponse } from 'next/server';

export async function chatbotAuth(userId: string, chatbotId: string) {
  const { data: chatbot, error: chatbotError } = await supabaseClient
    .from('chatbots')
    .select('id, created_by')
    .eq('id', chatbotId)
    .single();

  if (chatbotError || !chatbot) {
    return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
  }

  if (chatbot.created_by !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
}
