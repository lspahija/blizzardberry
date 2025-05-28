import { NextResponse } from 'next/server';
import { supabaseClient } from '@/app/api/lib/supabase';
import { auth } from '@/lib/auth/auth';
import { Chatbot } from '@/app/api/lib/model/chatbot/chatbot';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ chatbotId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatbotId } = await params;

    const { data, error } = await supabaseClient
      .from('chatbots')
      .select('id, name, website_domain, created_by, created_at')
      .eq('id', chatbotId)
      .eq('created_by', session.user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching chatbot:', error);
      return NextResponse.json(
        { error: 'Chatbot not found or unauthorized' },
        { status: 404 }
      );
    }

    const chatbot: Chatbot = {
      id: data.id,
      name: data.name,
      websiteDomain: data.website_domain,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };

    return NextResponse.json({ chatbot }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
