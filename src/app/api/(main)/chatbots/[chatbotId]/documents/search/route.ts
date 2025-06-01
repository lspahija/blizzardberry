import { NextResponse } from 'next/server';
import { chatbotAuth } from '@/app/api/lib/auth/chatbotAuth';
import { auth } from '@/lib/auth/auth';
import { similaritySearch } from '@/app/api/lib/store/documentStore';

export async function POST(
  req: Request,
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

    const { query, topK = 3 } = await req.json();

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
