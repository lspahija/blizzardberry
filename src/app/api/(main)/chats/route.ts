import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getChatsForAgentOwner } from '@/app/api/lib/store/chatStore';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const chats = await getChatsForAgentOwner(session.user.id, limit, offset);

    return NextResponse.json({ chats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
} 