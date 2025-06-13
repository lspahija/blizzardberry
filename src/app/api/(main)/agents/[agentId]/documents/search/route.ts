import { NextResponse } from 'next/server';
import { agentAuth } from '@/app/api/lib/auth/agentAuth';
import { auth } from '@/lib/auth/auth';
import { similaritySearch } from '@/app/api/lib/store/documentStore';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await params;

    const authResponse = await agentAuth(session.user.id, agentId);
    if (authResponse) return authResponse;

    const { query, topK = 3 } = await req.json();

    const groupedResults = await similaritySearch(query, topK, agentId);

    return NextResponse.json({ results: groupedResults }, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
