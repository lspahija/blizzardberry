import sql from '@/app/api/lib/store/db';
import { ApiKey } from '@/app/api/lib/model/apiKey/apiKey';
import crypto from 'crypto';

/**
 * Generates a secure random API key
 * Format: bb_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(32);
  const key = randomBytes.toString('hex');
  return `bb_live_${key}`;
}

/**
 * Hashes an API key for secure storage
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Creates a new API key for a user
 * @returns Object containing the unhashed API key (show once) and key metadata
 */
export async function createApiKey(
  userId: string,
  name?: string,
  expiresAt?: Date
): Promise<{ apiKey: string; keyData: ApiKey }> {
  const apiKey = generateApiKey();
  const keyHash = hashApiKey(apiKey);
  const keySuffix = apiKey.slice(-4);

  const [result] = await sql`
    INSERT INTO api_keys (user_id, key_hash, key_suffix, name, expires_at)
    VALUES (${userId}, ${keyHash}, ${keySuffix}, ${name || null}, ${expiresAt || null})
    RETURNING id, user_id, name, key_suffix, last_used_at, expires_at, created_at, updated_at
  `;

  return {
    apiKey, // Return the full key only once
    keyData: {
      id: result.id,
      userId: result.user_id,
      name: result.name,
      keyPreview: `****${result.key_suffix}`,
      lastUsedAt: result.last_used_at,
      expiresAt: result.expires_at,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    },
  };
}

/**
 * Verifies an API key and returns the associated user ID
 * Also updates the last_used_at timestamp
 * @returns userId if valid, null if invalid or expired
 */
export async function verifyApiKey(apiKey: string): Promise<string | null> {
  const keyHash = hashApiKey(apiKey);

  const [result] = await sql`
    UPDATE api_keys
    SET last_used_at = now()
    WHERE key_hash = ${keyHash}
      AND (expires_at IS NULL OR expires_at > now())
    RETURNING user_id
  `;

  return result?.user_id || null;
}

/**
 * Gets all API keys for a user (without the actual key values)
 */
export async function getApiKeys(userId: string): Promise<ApiKey[]> {
  const results = await sql`
    SELECT id, user_id, name, key_suffix, last_used_at, expires_at, created_at, updated_at
    FROM api_keys
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return results.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    keyPreview: `****${r.key_suffix}`,
    lastUsedAt: r.last_used_at,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

/**
 * Deletes an API key
 */
export async function deleteApiKey(
  keyId: string,
  userId: string
): Promise<boolean> {
  const result = await sql`
    DELETE FROM api_keys
    WHERE id = ${keyId} AND user_id = ${userId}
    RETURNING id
  `;

  return result.length > 0;
}

/**
 * Gets a single API key by ID
 */
export async function getApiKey(
  keyId: string,
  userId: string
): Promise<ApiKey | null> {
  const [result] = await sql`
    SELECT id, user_id, name, key_suffix, last_used_at, expires_at, created_at, updated_at
    FROM api_keys
    WHERE id = ${keyId} AND user_id = ${userId}
  `;

  if (!result) return null;

  return {
    id: result.id,
    userId: result.user_id,
    name: result.name,
    keyPreview: `****${result.key_suffix}`,
    lastUsedAt: result.last_used_at,
    expiresAt: result.expires_at,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}
