import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { Chatbot } from '@/app/api/lib/model/chatbot/chatbot';
import { chatbotAuth } from '@/app/api/lib/auth/chatbotAuth';
import {
  deleteChatbot,
  getChatbotByUserId,
} from '@/app/api/lib/store/chatbotStore';

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

    const { data, error } = await getChatbotByUserId(
      chatbotId,
      session.user.id
    );

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
  _: Request,
  { params }: { params: Promise<{ chatbotId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatbotId } = await params;

    const authResponse = await chatbotAuth(session.user.id, chatbotId);
    if (authResponse) return authResponse;

    // Delete the chatbot
    const { error: deleteError } = await deleteChatbot(chatbotId);

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
