import { NextResponse } from 'next/server';
import { Action } from '@/app/api/lib/model/action/baseAction';
import { supabaseClient } from '@/app/api/lib/supabase';
import { auth } from '@/lib/auth';

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

    // Verify the chatbot exists and belongs to the user
    const { data: chatbot, error: chatbotError } = await supabaseClient
      .from('chatbots')
      .select('id, created_by')
      .eq('id', chatbotId)
      .single();

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    if (chatbot.created_by !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch actions for the chatbot
    const { data, error: actionsError } = await supabaseClient
      .from('actions')
      .select(
        'id, name, description, execution_context, execution_model, chatbot_id'
      )
      .eq('chatbot_id', chatbotId);

    if (actionsError) {
      console.error('Error fetching actions:', actionsError);
      return NextResponse.json(
        { error: 'Failed to fetch actions' },
        { status: 500 }
      );
    }

    const actions: Action[] = data.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      executionContext: d.execution_context,
      executionModel: d.execution_model,
      chatbotId: d.chatbot_id,
    }));

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
  { params }: { params: Promise<{ chatbotId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const action: Action = await req.json();
    const { chatbotId } = await params;

    // Verify the chatbot exists and belongs to the user
    const { data: chatbot, error: chatbotError } = await supabaseClient
      .from('chatbots')
      .select('id, created_by')
      .eq('id', chatbotId)
      .single();

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    if (chatbot.created_by !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabaseClient.from('actions').insert({
      name: action.name,
      description: action.description,
      execution_context: action.executionContext,
      execution_model: action.executionModel,
      chatbot_id: chatbotId,
    });

    if (error) {
      console.error('Error creating action:', error);
      return NextResponse.json(
        { error: 'Failed to create action' },
        { status: 500 }
      );
    }

    return NextResponse.json({ actionName: action.name }, { status: 201 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
