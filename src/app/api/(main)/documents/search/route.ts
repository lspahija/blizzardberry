import { NextResponse } from 'next/server';
import { similaritySearch } from '@/app/api/lib/embedding';
import { authChatbot } from '@/app/api/lib/chatbotAuth';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, topK = 3, chatbotId } = await req.json();

    const authResponse = await authChatbot(session.user.id, chatbotId);
    if (authResponse) return authResponse;

    const groupedResults = await similaritySearch(query, topK, chatbotId);

    return NextResponse.json({ results: groupedResults }, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
