'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useConversations,
  useConversationMessages,
} from '@/app/(frontend)/hooks/useConversations.ts';
import { useAgents } from '@/app/(frontend)/hooks/useAgents';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import { Button } from '@/app/(frontend)/components/ui/button';
import { Badge } from '@/app/(frontend)/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/(frontend)/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';
import {
  Trash2,
  MessageSquare,
  Calendar,
  User,
  Loader2,
  Filter,
} from 'lucide-react';

export default function ConversationsPage() {
  const { conversations, loading, error, deleteConversation } =
    useConversations();
  const { agents, loadingAgents } = useAgents();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');
  const messagesRef = useRef<HTMLDivElement>(null);

  const { messages: selectedConversationMessages, loading: loadingMessages } =
    useConversationMessages(selectedConversation);

  const filteredConversations = conversations.filter((conversation) => {
    if (selectedAgentFilter === 'all') return true;
    return conversation.agent_id === selectedAgentFilter;
  });

  const agentConversationCounts = agents.reduce(
    (acc, agent) => {
      acc[agent.id] = conversations.filter(
        (conversation) => conversation.agent_id === agent.id
      ).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleDeleteConversation = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (conversationToDelete) {
      setDeleting(true);
      await deleteConversation(conversationToDelete);
      setIsDeleteDialogOpen(false);
      setConversationToDelete(null);
      setDeleting(false);
      if (selectedConversation === conversationToDelete) {
        setSelectedConversation(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEndUserInfo = (endUserConfig: any) => {
    if (!endUserConfig) return 'Anonymous User';
    let config = endUserConfig;
    if (typeof config === 'string') {
      try {
        config = JSON.parse(config);
      } catch {
        return 'Unknown User';
      }
    }
    return (
      config.email ||
      config.name ||
      config.user_metadata?.name ||
      config.user_id ||
      config.userId ||
      'Unknown User'
    );
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    if (window.innerWidth < 1024 && messagesRef.current) {
      setTimeout(() => {
        messagesRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedConversation]);

  if (loading || loadingAgents) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading conversations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6 max-w-full w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Conversation History</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={selectedAgentFilter}
              onValueChange={setSelectedAgentFilter}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Agents ({conversations.length})
                </SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} ({agentConversationCounts[agent.id]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary" className="w-full sm:w-auto text-center">
            {filteredConversations.length} conversations
          </Badge>
        </div>
      </div>

      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedAgentFilter === 'all'
                ? 'No conversations yet'
                : 'No conversations for this agent'}
            </h3>
            <p className="text-gray-500 text-center">
              {selectedAgentFilter === 'all'
                ? 'When users interact with your agents, their conversations will appear here.'
                : 'When users interact with this agent, their conversations will appear here.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Conversation List */}
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedConversation === conversation.id
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm">
                          {getEndUserInfo(conversation.end_user_config)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{conversation.message_count} messages</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(conversation.created_at)}</span>
                        </div>
                      </div>

                      <div className="text-xs text-blue-600 font-medium">
                        Agent: {conversation.agent_name}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Conversation Messages */}
          <div className="space-y-0 pt-0" ref={messagesRef}>
            {selectedConversation ? (
              <Card className="h-[600px] flex flex-col mt-0">
                <CardHeader className="border-b py-2">
                  <CardTitle className="text-lg mt-0 mb-1">Messages</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedConversationMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.role === 'user'
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="text-sm font-medium mb-1">
                              {message.role === 'user' ? 'User' : 'Assistant'}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </div>
                            <div className="text-xs opacity-70 mt-1">
                              {formatDate(message.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center mt-0">
                <CardContent className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to view the messages.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
