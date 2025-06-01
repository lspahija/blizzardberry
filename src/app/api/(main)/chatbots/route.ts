import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { Chatbot } from '@/app/api/lib/model/chatbot/chatbot';
import { createChatbot, getChatbots } from '@/app/api/lib/store/chatbotStore';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, websiteDomain } = await req.json();

    const { data, error } = await createChatbot(
      name,
      websiteDomain,
      session.user.id
    );

    if (error) {
      console.error('Error creating chatbot:', error);
      return NextResponse.json(
        { error: 'Failed to create chatbot' },
        { status: 500 }
      );
    }

    return NextResponse.json({ chatbotId: data.id }, { status: 201 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(_: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await getChatbots(session.user.id);

    if (error) {
      console.error('Error fetching chatbots:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chatbots' },
        { status: 500 }
      );
    }

    const chatbots: Chatbot[] = data.map((d) => ({
      id: d.id,
      name: d.name,
      websiteDomain: d.website_domain,
      createdBy: d.created_by,
      createdAt: d.created_at,
    }));

    return NextResponse.json({ chatbots }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
