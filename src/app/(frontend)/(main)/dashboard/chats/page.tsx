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
  Bot,
} from 'lucide-react';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background p-4 sm:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Conversation History
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedAgentFilter}
                onValueChange={setSelectedAgentFilter}
              >
                <SelectTrigger className="w-full sm:w-56 border-[3px] border-border">
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
            <Badge className="bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-medium w-full sm:w-auto text-center">
              {filteredConversations.length}
            </Badge>
          </div>
        </div>

      {filteredConversations.length === 0 ? (
        <Card className="border-[3px] border-border rounded-xl shadow-lg">
          <CardContent className="flex flex-col items-center justify-center h-64 p-6">
            <MessageSquare className="h-16 w-16 text-brand/50 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              {selectedAgentFilter === 'all'
                ? 'No conversations yet'
                : 'No conversations for this agent'}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {selectedAgentFilter === 'all'
                ? 'When users interact with your agents, their conversations will appear here.'
                : 'When users interact with this agent, their conversations will appear here.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Conversation List */}
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`border-[3px] border-border bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer py-3 gap-0 ${
                  selectedConversation === conversation.id
                    ? 'ring-4 ring-brand/50 border-brand'
                    : ''
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <CardContent className="px-4 py-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="font-bold text-base text-foreground group-hover:text-brand transition-colors">
                        {getEndUserInfo(conversation.end_user_config)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{conversation.message_count}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(conversation.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Bot className="h-3.5 w-3.5 text-brand" />
                        <span className="text-sm text-brand font-medium">
                          {conversation.agent_name}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 [&_svg]:!size-5"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Conversation Messages */}
          <div className="space-y-0 pt-0" ref={messagesRef}>
            {selectedConversation ? (
              <Card className="h-[600px] flex flex-col mt-0 border-[3px] border-border rounded-xl shadow-lg">
                <CardHeader className="border-b border-border py-4 px-6">
                  <CardTitle className="text-xl font-bold text-foreground mt-0 mb-0 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-brand" />
                    Messages
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="animate-spin h-8 w-8 text-brand" />
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
                            className={`max-w-[85%] rounded-xl px-4 py-3 border-[3px] shadow-sm ${
                              message.role === 'user'
                                ? 'bg-brand text-primary-foreground border-brand'
                                : 'bg-card text-foreground border-border'
                            }`}
                          >
                            <div className="text-sm font-bold mb-1.5 opacity-90">
                              {message.role === 'user' ? 'User' : 'Assistant'}
                            </div>
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </div>
                            <div className="text-xs opacity-60 mt-2">
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
              <Card className="h-[600px] flex items-center justify-center mt-0 border-[3px] border-border rounded-xl shadow-lg">
                <CardContent className="text-center p-6">
                  <MessageSquare className="h-16 w-16 text-brand/50 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Choose a conversation from the list to view the messages.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border-[3px] border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Delete Conversation
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleting}
              className="border-[3px] border-border font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="font-semibold"
            >
              {deleting ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
