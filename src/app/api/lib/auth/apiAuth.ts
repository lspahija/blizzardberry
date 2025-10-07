import { auth } from '@/lib/auth/auth';
import { verifyApiKey } from '@/app/api/lib/store/apiKeyStore';

export interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

/**
 * Unified authentication that supports both API keys and session auth
 *
 * Checks for API key in Authorization header first (Bearer token),
 * then falls back to session-based authentication.
 *
 * @param req - The request object
 * @returns AuthUser object if authenticated, null otherwise
 *
 * @example
 * // With API key
 * Authorization: Bearer bb_live_xxxxxxxxxxxxxxxxxxxxx
 *
 * // With session (cookie-based)
 * Cookie: authjs.session-token=...
 */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  // First, check for API key in Authorization header
  const authHeader = req.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (apiKey.startsWith('bb_live_')) {
      const userId = await verifyApiKey(apiKey);

      if (userId) {
        return { id: userId };
      }

      // API key was provided but invalid - don't fall through to session auth
      return null;
    }
  }

  // Fall back to session-based authentication
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}
