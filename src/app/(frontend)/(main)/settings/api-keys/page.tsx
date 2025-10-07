'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/app/(frontend)/components/ui/button';
import {
  Card,
  CardContent,
} from '@/app/(frontend)/components/ui/card';
import { motion } from 'framer-motion';
import {
  Loader2,
  Key,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ApiKey {
  id: string;
  name?: string;
  keyPreview: string;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export default function ApiKeysPage() {
  const { data: session, status } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchApiKeys();
    }
  }, [status]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/api-keys');
      if (!res.ok) throw new Error('Failed to fetch API keys');
      const data = await res.json();
      setApiKeys(data.apiKeys);
      setError(null);
    } catch (err) {
      setError('Failed to load API keys');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      setCreating(true);
      setError(null);
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() || undefined }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create API key');
      }

      const data = await res.json();
      setNewlyCreatedKey(data.apiKey);
      setShowNewKey(true);
      setNewKeyName('');
      await fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(keyId);
      setError(null);
      const res = await fetch('/api/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: keyId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete API key');
      }

      await fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleCopyKey = async (key: string, keyId?: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKeyId(keyId || 'new');
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Please sign in to manage API keys</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background p-4 sm:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto mt-6 sm:mt-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">
            API Keys
          </h1>
          <p className="text-muted-foreground">
            Manage your API keys for programmatic access to your agents and actions
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-destructive/10 border-2 border-destructive rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* New Key Created Alert */}
        {newlyCreatedKey && (
          <div className="mb-6 bg-brand/10 border-2 border-brand rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle2 className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-1">
                  API Key Created Successfully
                </h3>
                <p className="text-sm text-muted-foreground">
                  Make sure to copy your API key now. You won't be able to see it again!
                </p>
              </div>
            </div>
            <div className="bg-background border-2 border-border rounded-lg p-4 flex items-center gap-3">
              <code className="flex-1 text-sm font-mono break-all">
                {showNewKey ? newlyCreatedKey : '•'.repeat(64)}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewKey(!showNewKey)}
                className="flex-shrink-0"
              >
                {showNewKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => handleCopyKey(newlyCreatedKey)}
                className="bg-brand text-primary-foreground hover:bg-brand/90 flex-shrink-0"
              >
                {copiedKeyId === 'new' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewlyCreatedKey(null)}
              className="mt-4 text-xs"
            >
              I've saved my key, dismiss this message
            </Button>
          </div>
        )}

        {/* Create New Key Form */}
        <Card className="mb-8 border-2 border-border shadow-sm">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Create New API Key
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Key name (optional)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 px-4 py-2 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                disabled={creating}
              />
              <Button
                onClick={handleCreateKey}
                disabled={creating}
                className="bg-brand text-primary-foreground border-[3px] border-border transition-all duration-200 font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Key
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Your API Keys
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            </div>
          ) : apiKeys.length === 0 ? (
            <Card className="border-2 border-dashed border-border">
              <CardContent className="py-12 text-center">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  No API keys yet. Create one to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <Card
                  key={key.id}
                  className="border-2 border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Key className="h-5 w-5 text-brand flex-shrink-0" />
                          <h3 className="font-bold text-foreground truncate">
                            {key.name || 'Unnamed Key'}
                          </h3>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            <span className="font-medium">Key:</span>{' '}
                            <code className="bg-muted px-2 py-0.5 rounded">
                              {key.keyPreview}
                            </code>
                          </p>
                          <p>
                            <span className="font-medium">Created:</span>{' '}
                            {new Date(key.createdAt).toLocaleDateString()} at{' '}
                            {new Date(key.createdAt).toLocaleTimeString()}
                          </p>
                          {key.lastUsedAt && (
                            <p>
                              <span className="font-medium">Last used:</span>{' '}
                              {new Date(key.lastUsedAt).toLocaleDateString()} at{' '}
                              {new Date(key.lastUsedAt).toLocaleTimeString()}
                            </p>
                          )}
                          {key.expiresAt && (
                            <p>
                              <span className="font-medium">Expires:</span>{' '}
                              {new Date(key.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                        disabled={deleting === key.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      >
                        {deleting === key.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-2 border-border bg-muted/30">
          <CardContent className="pt-6">
            <h3 className="font-bold text-foreground mb-2">Using Your API Keys</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Include your API key in the Authorization header:
            </p>
            <code className="block bg-background border border-border rounded-lg p-3 text-xs font-mono text-foreground">
              Authorization: Bearer bb_live_xxxxxxxxxx
            </code>
            <p className="text-xs text-muted-foreground mt-3">
              See the documentation for more details on API authentication.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
