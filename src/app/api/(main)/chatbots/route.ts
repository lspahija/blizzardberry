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

    const { name, websiteDomain, model } = await req.json();

    const data = await createChatbot(name, websiteDomain, session.user.id, model);

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

    const data = await getChatbots(session.user.id);

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
