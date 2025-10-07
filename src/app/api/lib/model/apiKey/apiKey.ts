export interface ApiKey {
  id: string;
  userId: string;
  name?: string;
  keyPreview: string; // Last 4 characters of the key for display
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
