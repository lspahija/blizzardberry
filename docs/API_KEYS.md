# API Key Authentication

This application supports both session-based authentication (cookies) and API key authentication for programmatic access.

## Overview

API keys allow you to authenticate API requests without requiring a browser session. This is useful for:
- Server-to-server integrations
- CLI tools
- Automated scripts
- Third-party integrations

## API Key Format

API keys follow this format:
```
bb_live_[64 character hex string]
```

Example: `bb_live_a1b2c3d4e5f6...`

## Managing API Keys

### Creating an API Key

**Endpoint:** `POST /api/api-keys`

**Authentication:** Requires session (cookie-based auth)

**Request Body:**
```json
{
  "name": "My Integration Key",  // Optional: descriptive name
  "expiresAt": "2025-12-31T23:59:59Z"  // Optional: ISO date string
}
```

**Response:**
```json
{
  "apiKey": "bb_live_a1b2c3d4e5f6...",  // SAVE THIS! Only shown once
  "keyData": {
    "id": "uuid",
    "userId": "uuid",
    "name": "My Integration Key",
    "keyPreview": "****abc4",
    "createdAt": "2025-10-07T12:00:00Z",
    "expiresAt": "2025-12-31T23:59:59Z"
  },
  "message": "API key created successfully. Store it securely - you will not be able to see it again."
}
```

⚠️ **Important:** The full API key is only shown once during creation. Store it securely!

### Listing API Keys

**Endpoint:** `GET /api/api-keys`

**Authentication:** Requires session (cookie-based auth)

**Response:**
```json
{
  "apiKeys": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "My Integration Key",
      "keyPreview": "****abc4",  // Last 4 chars of hash
      "lastUsedAt": "2025-10-07T12:30:00Z",
      "expiresAt": "2025-12-31T23:59:59Z",
      "createdAt": "2025-10-07T12:00:00Z",
      "updatedAt": "2025-10-07T12:30:00Z"
    }
  ]
}
```

### Deleting an API Key

**Endpoint:** `DELETE /api/api-keys`

**Authentication:** Requires session (cookie-based auth)

**Request Body:**
```json
{
  "id": "uuid"  // The API key ID to delete
}
```

**Response:**
```json
{
  "message": "API key deleted successfully"
}
```

## Using API Keys

### Authentication Header

Include your API key in the `Authorization` header using the Bearer scheme:

```http
Authorization: Bearer bb_live_a1b2c3d4e5f6...
```

### Example: Creating an Agent with API Key

```bash
curl -X POST https://your-app.com/api/agents \
  -H "Authorization: Bearer bb_live_a1b2c3d4e5f6..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Support Agent",
    "websiteDomain": "example.com",
    "model": "anthropic/claude-sonnet-4.5",
    "prompts": [
      "You are a helpful customer support agent."
    ]
  }'
```

### Example: Listing Agents with API Key

```bash
curl -X GET https://your-app.com/api/agents \
  -H "Authorization: Bearer bb_live_a1b2c3d4e5f6..."
```

### JavaScript/TypeScript Example

```typescript
const API_KEY = 'bb_live_a1b2c3d4e5f6...';
const BASE_URL = 'https://your-app.com/api';

async function createAgent(name: string, domain: string, model: string) {
  const response = await fetch(`${BASE_URL}/agents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      websiteDomain: domain,
      model,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

async function listAgents() {
  const response = await fetch(`${BASE_URL}/agents`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

### Python Example

```python
import requests

API_KEY = 'bb_live_a1b2c3d4e5f6...'
BASE_URL = 'https://your-app.com/api'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Create an agent
response = requests.post(
    f'{BASE_URL}/agents',
    headers=headers,
    json={
        'name': 'Customer Support Agent',
        'websiteDomain': 'example.com',
        'model': 'anthropic/claude-sonnet-4.5'
    }
)

if response.ok:
    agent_data = response.json()
    print(f"Created agent: {agent_data['agentId']}")
else:
    print(f"Error: {response.status_code}")

# List agents
response = requests.get(f'{BASE_URL}/agents', headers=headers)
agents = response.json()
```

## Security Best Practices

1. **Store Securely:** Never commit API keys to version control
2. **Use Environment Variables:** Store keys in environment variables or secure vaults
3. **Rotate Regularly:** Delete old keys and create new ones periodically
4. **Set Expiration:** Use the `expiresAt` field to automatically expire keys
5. **Limit Scope:** Create separate keys for different integrations
6. **Monitor Usage:** Check `lastUsedAt` to detect unauthorized access
7. **Revoke Immediately:** Delete compromised keys right away

## Authentication Flow

```
1. Client sends request with Authorization header
   Authorization: Bearer bb_live_xxx...

2. apiAuth.ts checks for Bearer token
   ├─ If valid API key → Authenticate user
   ├─ If invalid API key → Return 401
   └─ If no API key → Fall back to session auth

3. Request proceeds with authenticated user ID
```

## Limitations

- API keys provide full access equivalent to the user's session
- API keys cannot be used to create/manage other API keys (requires session)
- There is currently no rate limiting specific to API keys
- API keys do not have granular permission scopes

## Migration

To set up the API key functionality in your database:

```bash
supabase migration up
# Or if using a different setup:
psql < supabase/migrations/20251007000001_add_api_keys.sql
```

## Troubleshooting

### 401 Unauthorized
- Ensure the API key is included in the Authorization header
- Check that the key starts with `bb_live_`
- Verify the key hasn't been deleted or expired

### 500 Internal Server Error
- Check server logs for detailed error messages
- Ensure the database migration has been applied
- Verify database connectivity

## Support

For issues or questions about API key authentication, please contact support or file an issue in the repository.
