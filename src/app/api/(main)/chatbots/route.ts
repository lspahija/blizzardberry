import { NextResponse } from 'next/server';
import { supabaseClient } from '@/app/api/lib/supabase';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, websiteDomain } = await req.json();

    const { data, error } = await supabaseClient
      .from('chatbots')
      .insert({
        name,
        website_domain: websiteDomain,
        created_by: session.user.id,
      })
      .select('id')
      .single();

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
