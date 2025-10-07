import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import {
  createApiKey,
  getApiKeys,
  deleteApiKey,
} from '@/app/api/lib/store/apiKeyStore';

/**
 * GET /api/api-keys
 * Lists all API keys for the authenticated user
 */
export async function GET(_: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeys = await getApiKeys(session.user.id);

    return NextResponse.json({ apiKeys }, { status: 200 });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/api-keys
 * Creates a new API key for the authenticated user
 *
 * Body:
 * - name (optional): A descriptive name for the key
 * - expiresAt (optional): ISO date string for expiration
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, expiresAt } = body;

    const expiresAtDate = expiresAt ? new Date(expiresAt) : undefined;

    // Validate expiration date if provided
    if (expiresAtDate && expiresAtDate <= new Date()) {
      return NextResponse.json(
        { error: 'Expiration date must be in the future' },
        { status: 400 }
      );
    }

    const { apiKey, keyData } = await createApiKey(
      session.user.id,
      name,
      expiresAtDate
    );

    return NextResponse.json(
      {
        apiKey, // Only shown once!
        keyData,
        message:
          'API key created successfully. Store it securely - you will not be able to see it again.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/api-keys/:id
 * Deletes an API key
 *
 * Body:
 * - id: The ID of the API key to delete
 */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteApiKey(id, session.user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'API key not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'API key deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
