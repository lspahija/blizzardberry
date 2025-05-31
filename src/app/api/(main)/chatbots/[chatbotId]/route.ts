import { NextResponse } from 'next/server';
import { supabaseClient } from '@/app/api/lib/store/supabase';
import { auth } from '@/lib/auth/auth';
import { Chatbot } from '@/app/api/lib/model/chatbot/chatbot';
import { chatbotAuth } from '@/app/api/lib/auth/chatbotAuth';

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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ chatbotId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatbotId } = await params;

    // Check if the chatbot exists and user has access
    const { data: chatbot, error: fetchError } = await supabaseClient
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    const authResponse = await chatbotAuth(session.user.id, chatbotId);
    if (authResponse) return authResponse;

    // Delete the chatbot
    const { error: deleteError } = await supabaseClient
      .from('chatbots')
      .delete()
      .eq('id', chatbotId);

    if (deleteError) {
      throw new Error(`Failed to delete chatbot: ${deleteError.message}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete chatbot' },
      { status: 500 }
    );
  }
}
