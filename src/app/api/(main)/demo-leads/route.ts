import sql from '@/app/api/lib/store/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, websiteUrl } = await request.json();

    if (!email || !websiteUrl) {
      return NextResponse.json(
        { error: 'Email and website URL are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const [data] = await sql`
      INSERT INTO demo_leads (email, website_url)
      VALUES (${email.toLowerCase().trim()}, ${websiteUrl.trim()})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in demo-leads API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
