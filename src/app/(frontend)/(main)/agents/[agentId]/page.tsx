'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/app/(frontend)/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/app/(frontend)/components/ui/card';
import {
  Loader2,
  PlusCircle,
  Trash2,
  X,
  Copy,
  ExternalLink,
  Bot,
  FileText,
  Zap,
  Info,
  Code,
  Save,
  Settings,
  Clock,
  Calendar,
} from 'lucide-react';
import {
  Action,
  ExecutionContext,
} from '@/app/api/lib/model/action/baseAction';
import { Agent } from '@/app/api/lib/model/agent/agent';
import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BackendAction } from '@/app/api/lib/model/action/backendAction';
import {
  FrontendAction,
  FrontendModel,
} from '@/app/api/lib/model/action/frontendAction';
import { useActionForm } from '@/app/(frontend)/hooks/useActionForm';
import { useDocuments } from '@/app/(frontend)/hooks/useDocuments';
import { useFramework } from '@/app/(frontend)/contexts/useFramework';
import {
  Framework,
  getUnifiedEmbedScript,
} from '@/app/(frontend)/lib/scriptUtils';
import { DEFAULT_AGENT_USER_CONFIG } from '@/app/(frontend)/lib/defaultUserConfig';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';
import { Label } from '@/app/(frontend)/components/ui/label';
import { Input } from '@/app/(frontend)/components/ui/input';
import { Textarea } from '@/app/(frontend)/components/ui/textarea';
import { Suspense } from 'react';
import { DeleteConfirmationDialog } from '@/app/(frontend)/components/ui/delete-confirmation-dialog';
import { useAgents } from '@/app/(frontend)/hooks/useAgents';
import { toast } from 'sonner';
import { AgentModel, AGENT_MODELS } from '@/app/api/lib/model/agent/agent';

export default function AgentDetailsWrapper({
  params: paramsPromise,
}: {
  params: Promise<{ agentId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
        </div>
      }
    >
      <AgentDetails params={paramsPromise} />
    </Suspense>
  );
}

function AgentDetails({
  params: paramsPromise,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [loadingActions, setLoadingActions] = useState(true);
  const [deletingActionId, setDeletingActionId] = useState<string | null>(null);
  const [showAgentCode, setShowAgentCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const { selectedFramework, setSelectedFramework } = useFramework();

  const [editName, setEditName] = useState('');
  const [editModel, setEditModel] = useState<AgentModel>(
    'google/gemini-2.0-flash-001'
  );
  const [editSystemMessage, setEditSystemMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Calendly integration state
  const [calendlyToken, setCalendlyToken] = useState('');
  const [calendlyConnected, setCalendlyConnected] = useState(false);
  const [calendlyUserName, setCalendlyUserName] = useState<string | null>(null);
  const [calendlySaving, setCalendlySaving] = useState(false);
  const searchParams = useSearchParams();

  const { handleUpdateAgent, handleDeleteAgent, deletingAgentId } = useAgents();
  const { handleDeleteAction, handleFetchActions } = useActionForm();
  const {
    documents,
    loadingDocuments,
    deletingDocumentId,
    handleDeleteDocument,
  } = useDocuments();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAgentDialogOpen, setIsDeleteAgentDialogOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<Action | null>(null);
  const [isDeleteDocumentDialogOpen, setIsDeleteDocumentDialogOpen] =
    useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<
    (typeof documents)[0] | null
  >(null);
  const [isNavigatingToNewAction, setIsNavigatingToNewAction] = useState(false);
  const [isNavigatingToNewDocument, setIsNavigatingToNewDocument] =
    useState(false);
  const [isNavigatingToEditAction, setIsNavigatingToEditAction] = useState<
    string | null
  >(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  // Fetch agent details
  useEffect(() => {
    async function fetchAgent() {
      try {
        const response = await fetch(`/api/agents/${params.agentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch agent');
        }
        const data = await response.json();
        setAgent(data.agent || null);
        // Initialize edit state
        setEditName(data.agent?.name || '');
        setEditModel(
          (data.agent?.model as AgentModel) || 'google/gemini-2.0-flash-001'
        );
        setEditSystemMessage(data.agent?.systemMessage || '');
        
        // Initialize Calendly state from agent config
        const calendlyConfig = data.agent?.calendlyConfig;
        if (calendlyConfig) {
          setCalendlyConnected(!!calendlyConfig.access_token);
          setCalendlyUserName(calendlyConfig.user_name || null);
          // Don't pre-fill token for security
          setCalendlyToken('');
        }
      } catch (error) {
        console.error('Error fetching agent:', error);
      } finally {
        setLoadingAgent(false);
      }
    }

    fetchAgent();
  }, [params.agentId]);

  // Fetch actions for the agent
  useEffect(() => {
    async function fetchActions() {
      try {
        const data = await handleFetchActions(params.agentId);
        setActions(data.actions || []);
      } catch (error) {
        console.error(
          `Error fetching actions for agent ${params.agentId}:`,
          error
        );
      } finally {
        setLoadingActions(false);
      }
    }

    fetchActions();
  }, [params.agentId]);


  const handleDeleteActionWithLoading = async (actionId: string) => {
    setDeletingActionId(actionId);
    try {
      await handleDeleteAction(actionId);
      setActions(actions.filter((action) => action.id !== actionId));
    } finally {
      setDeletingActionId(null);
    }
  };

  const clientActions = actions.filter(
    (action) => action.executionContext === ExecutionContext.CLIENT
  );

  const embedScript = useMemo(() => {
    const defaultUserConfig = DEFAULT_AGENT_USER_CONFIG;
    return getUnifiedEmbedScript(
      selectedFramework,
      params.agentId,
      defaultUserConfig,
      clientActions.map((action) => ({
        functionName: (action.executionModel as FrontendModel).functionName,
        dataInputs: (action.executionModel.parameters || []).map((param) => ({
          name: param.name,
          type: param.type,
          description: param.description || '',
          isArray: param.isArray || false,
        })),
      }))
    );
  }, [selectedFramework, params.agentId, clientActions]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Calendly token save
  const handleCalendlySave = async () => {
    if (!agent || !calendlyToken.trim()) {
      toast.error('Please enter a Calendly Personal Access Token');
      return;
    }

    setCalendlySaving(true);
    try {
      const response = await fetch(`/api/agents/${params.agentId}/calendly/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: calendlyToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save Calendly token');
      }

      toast.success('Calendly connected successfully!');
      setCalendlyToken(''); // Clear input for security
      setCalendlyConnected(true);
      setCalendlyUserName(data.userInfo?.name || null);
      
      // Refresh agent data
      const agentResponse = await fetch(`/api/agents/${params.agentId}`);
      const agentData = await agentResponse.json();
      setAgent(agentData.agent);
    } catch (error: any) {
      console.error('Error saving Calendly token:', error);
      toast.error(error.message || 'Failed to save Calendly token');
    } finally {
      setCalendlySaving(false);
    }
  };

  // Handle Calendly disconnect
  const handleCalendlyDisconnect = async () => {
    if (!agent) return;

    setCalendlySaving(true);
    try {
      const response = await fetch(`/api/agents/${params.agentId}/calendly/token`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect Calendly');
      }

      toast.success('Calendly disconnected successfully');
      setCalendlyToken('');
      setCalendlyConnected(false);
      setCalendlyUserName(null);
      
      // Refresh agent data
      const agentResponse = await fetch(`/api/agents/${params.agentId}`);
      const agentData = await agentResponse.json();
      setAgent(agentData.agent);
    } catch (error: any) {
      console.error('Error disconnecting Calendly:', error);
      toast.error(error.message || 'Failed to disconnect Calendly');
    } finally {
      setCalendlySaving(false);
    }
  };

  const saveChanges = async () => {
    if (!agent) return;

    try {
      setIsSaving(true);
      const updatePayload: any = {
        name: editName,
        model: editModel,
        systemMessage: editSystemMessage.trim() || undefined,
      };

      await handleUpdateAgent(agent.id, updatePayload);

      try {
        const response = await fetch(`/api/agents/${params.agentId}`);
        if (response.ok) {
          const data = await response.json();
          setAgent(data.agent || null);
        }
      } catch (fetchError) {
        console.error('Error fetching updated agent:', fetchError);
        setAgent({
          ...agent,
          name: editName,
          model: editModel,
        });
      }

      toast.success('Agent updated successfully!');
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Failed to update agent. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (showAgentCode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAgentCode]);

  if (loadingAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground text-lg">
          Agent not found.{' '}
          <Link href="/dashboard" className="text-[#FE4A60] hover:underline">
            Go back to dashboard
          </Link>
          .
        </p>
      </div>
    );
  }

  const handleNavigateToNewAction = async () => {
    setIsNavigatingToNewAction(true);
    router.push(`/agents/${params.agentId}/actions/new`);
  };

  const handleNavigateToNewDocument = async () => {
    setIsNavigatingToNewDocument(true);
    router.push(`/agents/${params.agentId}/documents/new`);
  };

  const handleNavigateToEditAction = async (actionId: string) => {
    setIsNavigatingToEditAction(actionId);
    router.push(`/agents/${params.agentId}/actions/${actionId}/edit`);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto w-full">
        <Card
          className="border-[3px] border-border bg-card mb-6 rounded-xl shadow-xl border-l-8"
          style={{ borderLeftColor: 'var(--color-destructive)' }}
        >
          <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 min-w-0">
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground ml-6 flex-1 truncate">
              Agent Details
            </CardTitle>
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
              <Button
                className="bg-secondary text-secondary-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-lg px-4 py-2 flex items-center gap-2 shadow-md hover:bg-secondary/90 w-full sm:w-auto"
                onClick={() => setShowAgentCode(true)}
                title="Show installation code for this agent"
              >
                <Code className="h-4 w-4" />
                Embed Your Agent
              </Button>
              <Button
                onClick={saveChanges}
                disabled={isSaving}
                className="bg-brand text-primary-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90 transition-transform rounded-lg px-6 py-2 flex items-center gap-2 w-full sm:w-auto"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setIsDeleteAgentDialogOpen(true)}
                disabled={deletingAgentId === agent.id}
                className="border-[2px] border-border rounded-full p-2 hover:bg-destructive/90 transition group-hover:scale-110"
                title="Delete this agent"
              >
                {deletingAgentId === agent.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-foreground flex items-center gap-2 text-sm font-semibold mb-2">
                <Bot className="h-4 w-4 text-destructive" />
                Name:
              </Label>
              <div className="ml-6 max-w-md">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Agent Name"
                  className="border-[2px] border-border"
                />
              </div>
            </div>

            <div>
              <Label className="text-foreground flex items-center gap-2 text-sm font-semibold mb-2">
                <Settings className="h-4 w-4 text-destructive" />
                Model:
              </Label>
              <div className="ml-6 max-w-md">
                <Select
                  value={editModel}
                  onValueChange={(value) => setEditModel(value as AgentModel)}
                >
                  <SelectTrigger className="border-[2px] border-border">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AGENT_MODELS).map(
                      ([modelValue, displayName]) => (
                        <SelectItem key={modelValue} value={modelValue}>
                          {displayName}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-foreground flex items-center gap-2 text-sm font-semibold mb-2">
                <FileText className="h-4 w-4 text-destructive" />
                Custom Instructions (Optional):
              </Label>
              <p className="text-sm text-muted-foreground mt-1 ml-6 mb-3">
                Add custom instructions to define your agent's behavior, personality, or specific guidelines. This will be used as the system message for your agent.
              </p>
              <div className="ml-6 max-w-2xl">
                <Textarea
                  value={editSystemMessage}
                  onChange={(e) => setEditSystemMessage(e.target.value)}
                  placeholder="You are a helpful assistant that specializes in..."
                  className="border-[2px] border-border resize-none"
                  rows={5}
                />
              </div>
            </div>

            {/* Calendly Integration Section */}
            <div>
              <Label className="text-foreground flex items-center gap-2 text-sm font-semibold mb-2">
                <Calendar className="h-4 w-4 text-destructive" />
                Calendly Integration:
              </Label>
              <p className="text-sm text-muted-foreground mt-1 ml-6 mb-3">
                Connect your Calendly account to allow your agent to check availability and book meetings. 
                <a 
                  href="https://calendly.com/integrations/api_webhooks" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand hover:underline ml-1"
                >
                  Get your Personal Access Token here
                </a>
              </p>
              <div className="ml-6 space-y-3">
                {calendlyConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-muted-foreground">
                        Connected{calendlyUserName ? ` as ${calendlyUserName}` : ''}
                      </span>
                    </div>
                    <Button
                      onClick={handleCalendlyDisconnect}
                      variant="outline"
                      size="sm"
                      disabled={calendlySaving}
                      className="w-full sm:w-auto"
                    >
                      {calendlySaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        'Disconnect'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="calendly-token" className="text-sm text-foreground">
                        Personal Access Token
                      </Label>
                      <Input
                        id="calendly-token"
                        type="password"
                        placeholder="Enter your Calendly Personal Access Token"
                        value={calendlyToken}
                        onChange={(e) => setCalendlyToken(e.target.value)}
                        className="w-full"
                        disabled={calendlySaving}
                      />
                    </div>
                    <Button
                      onClick={handleCalendlySave}
                      className="bg-brand text-primary-foreground hover:bg-brand/90"
                      size="sm"
                      disabled={calendlySaving || !calendlyToken.trim()}
                    >
                      {calendlySaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect Calendly'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-destructive" />
                Created:
              </Label>
              <p className="text-muted-foreground text-sm sm:text-base ml-6">
                {new Date(agent.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Separator */}
            <div className="flex justify-center mt-8 mb-6">
              <div className="w-5/6 h-px bg-border"></div>
            </div>

            {/* Actions and Documents Sections */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Actions Section */}
              <div>
                <div className="flex items-start sm:items-center justify-between mb-4 gap-2 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-destructive" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Actions
                    </h3>
                  </div>
                  <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                    <Button
                      className="bg-brand text-primary-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-brand/90 w-full sm:w-auto"
                      onClick={handleNavigateToNewAction}
                      disabled={isNavigatingToNewAction}
                    >
                      {isNavigatingToNewAction ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create New
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {loadingActions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
                  </div>
                ) : actions.length === 0 ? (
                  <p className="text-foreground text-base flex items-center justify-center text-center py-8">
                    No actions found. Create one to get started!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {actions.map((action, idx) => (
                      <Card
                        key={action.id || action.name}
                        className="border-[2px] border-border bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                        onClick={() => handleNavigateToEditAction(action.id)}
                      >
                        <CardContent className="pt-2 pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-tight truncate group-hover:text-brand transition-colors mb-0.5">
                                  {action.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                                  {action.description}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                                  <span className="inline-flex items-center gap-1">
                                    <Info className="h-4 w-4" />
                                    {action.executionContext}
                                  </span>
                                  <span className="inline-flex items-center gap-1 min-w-0">
                                    <Code className="h-4 w-4" />
                                    <span className="truncate">
                                      {action.executionContext ===
                                      ExecutionContext.SERVER
                                        ? `${(action as BackendAction).executionModel.request.method.toUpperCase()} ${(action as BackendAction).executionModel.request.url}`
                                        : (action as FrontendAction)
                                            .executionModel.functionName}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start mt-1">
                              {isNavigatingToEditAction === action.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-brand" />
                              ) : (
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="rounded-full p-2 hover:bg-destructive/80 transition"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionToDelete(action);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  disabled={deletingActionId === action.id}
                                  title="Delete Action"
                                >
                                  {deletingActionId === action.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Documents Section */}
              <div>
                <div className="flex items-start sm:items-center justify-between mb-4 gap-2 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-destructive" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Documents
                    </h3>
                  </div>
                  <Button
                    className="bg-brand text-primary-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-brand/90 w-full sm:w-auto"
                    onClick={handleNavigateToNewDocument}
                    disabled={isNavigatingToNewDocument}
                  >
                    {isNavigatingToNewDocument ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New
                      </>
                    )}
                  </Button>
                </div>
                {loadingDocuments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-foreground text-base flex items-center justify-center text-center py-8">
                    No documents found. Add one to get started!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {documents.map((doc, idx) => (
                      <Card
                        key={doc.id}
                        className="border-[2px] border-border bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                      >
                        <CardContent className="pt-2 pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-tight group-hover:text-brand transition-colors mb-0.5">
                                  Document {idx + 1}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {doc.content.length > 150
                                    ? `${doc.content.substring(0, 150)}...`
                                    : doc.content}
                                </p>
                                {Object.entries(doc.metadata).filter(
                                  ([key]) =>
                                    ![
                                      'loc',
                                      'agent_id',
                                      'chunk_index',
                                      'parent_document_id',
                                    ].includes(key)
                                ).length > 0 && (
                                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                                    {Object.entries(doc.metadata)
                                      .filter(
                                        ([key]) =>
                                          ![
                                            'loc',
                                            'agent_id',
                                            'chunk_index',
                                            'parent_document_id',
                                          ].includes(key)
                                      )
                                      .slice(0, 2)
                                      .map(([key, value]) => (
                                        <span
                                          key={key}
                                          className="inline-flex items-center gap-1 min-w-0"
                                        >
                                          <Info className="h-4 w-4" />
                                          <span className="truncate">
                                            {key}:{' '}
                                            {typeof value === 'object' &&
                                            value !== null
                                              ? JSON.stringify(value)
                                              : String(value)}
                                          </span>
                                        </span>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="rounded-full p-2 hover:bg-destructive/80 transition shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocumentToDelete(doc);
                                setIsDeleteDocumentDialogOpen(true);
                              }}
                              disabled={deletingDocumentId === doc.id}
                              title="Delete Document"
                            >
                              {deletingDocumentId === doc.id ? (
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
            </div>
          </CardContent>
        </Card>
        {showAgentCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl shadow-2xl"
              aria-hidden="true"
              onClick={() => setShowAgentCode(false)}
            />
            <div className="relative z-10 w-full max-w-lg sm:max-w-2xl md:max-w-4xl max-h-[90vh] rounded-2xl">
              <div className="relative mb-8 md:mb-12">
                <div className="absolute inset-0 bg-gray-900 rounded-3xl translate-x-1 translate-y-1"></div>
                <Card
                  className="relative bg-muted border-[3px] border-border rounded-3xl shadow-2xl border-l-8"
                  style={{ borderLeftColor: 'var(--color-destructive)' }}
                >
                  <div className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-destructive/60 scrollbar-track-card/60 rounded-2xl pr-2">
                    <CardHeader className="flex items-center justify-between relative">
                      <div className="flex items-center space-x-2">
                        <Code className="h-7 w-7 text-destructive" />
                        <CardTitle className="text-lg sm:text-2xl font-semibold text-foreground">
                          Agent Installation Snippet
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close"
                        className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-3 rounded-full hover:bg-destructive/10 transition"
                        onClick={() => setShowAgentCode(false)}
                      >
                        <X className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-8 mt-8">
                      <div>
                        <Label className="text-foreground text-lg font-semibold flex items-center gap-2 mb-2">
                          Framework
                        </Label>
                        <p className="text-sm text-muted-foreground mt-2">
                          Select the framework you're using to implement the
                          agent.
                        </p>
                        <div className="mt-2">
                          <Select
                            value={selectedFramework}
                            onValueChange={(value) =>
                              setSelectedFramework(value as Framework)
                            }
                          >
                            <SelectTrigger className="w-[200px] border-[2px] border-border">
                              <SelectValue placeholder="Select framework" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={Framework.ANGULAR}>
                                Angular
                              </SelectItem>
                              <SelectItem value={Framework.NEXT_JS}>
                                Next.js
                              </SelectItem>
                              <SelectItem value={Framework.REACT}>
                                React
                              </SelectItem>
                              <SelectItem value={Framework.VANILLA}>
                                Vanilla JS
                              </SelectItem>
                              <SelectItem value={Framework.VUE}>Vue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="relative">
                        <SyntaxHighlighter
                          language={
                            selectedFramework === Framework.NEXT_JS
                              ? 'jsx'
                              : 'html'
                          }
                          style={vscDarkPlus}
                          customStyle={{
                            borderRadius: '8px',
                            padding: '16px',
                            border: '2px solid var(--color-border)',
                            backgroundColor: 'var(--color-background-dark)',
                          }}
                        >
                          {embedScript}
                        </SyntaxHighlighter>
                        <Button
                          onClick={() => handleCopy(embedScript)}
                          className="absolute top-11 right-2 bg-secondary text-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-xl flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5"
                        >
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline text-xs sm:text-sm">
                            {copied ? 'Copied!' : 'Copy Code'}
                          </span>
                          <span className="inline sm:hidden text-xs">
                            {copied ? 'Copied!' : 'Copy'}
                          </span>
                        </Button>
                      </div>
                      <div>
                        <Label className="text-foreground text-lg font-semibold flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-destructive" />
                          Installation Instructions
                        </Label>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-6">
                          <li>Copy the code snippet above</li>
                          <li>
                            {selectedFramework === Framework.NEXT_JS ? (
                              <>
                                Paste the code in your layout.tsx or page
                                component
                              </>
                            ) : (
                              <>
                                Paste the code before the closing{' '}
                                <code className="bg-muted px-1 rounded">
                                  &lt;/body&gt;
                                </code>{' '}
                                tag
                              </>
                            )}
                          </li>
                          <li>Save and publish your website changes</li>
                          <li>Your agent will appear on your website</li>
                          <li>
                            Need help? Visit our{' '}
                            <Link
                              href="/docs"
                              className="text-destructive hover:underline"
                            >
                              documentation{' '}
                              <ExternalLink className="inline w-4 h-4" />
                            </Link>
                            .
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={async () => {
            if (actionToDelete?.id) {
              await handleDeleteActionWithLoading(actionToDelete.id);
              setActionToDelete(null);
            }
          }}
          title="Delete Action"
          message={`Are you sure you want to delete the action "${actionToDelete?.name}"? This action cannot be undone.`}
          isLoading={!!deletingActionId}
        />

        <DeleteConfirmationDialog
          isOpen={isDeleteAgentDialogOpen}
          onOpenChange={setIsDeleteAgentDialogOpen}
          onConfirm={async () => {
            if (agent?.id) {
              await handleDeleteAgent(agent.id);
              setIsDeleteAgentDialogOpen(false);
              router.push('/dashboard');
            }
          }}
          title="Delete Agent"
          message={`Are you sure you want to delete this agent? This action cannot be undone.`}
          isLoading={!!deletingAgentId}
        />

        <DeleteConfirmationDialog
          isOpen={isDeleteDocumentDialogOpen}
          onOpenChange={setIsDeleteDocumentDialogOpen}
          onConfirm={async () => {
            if (documentToDelete?.id) {
              await handleDeleteDocument(documentToDelete.id);
              setDocumentToDelete(null);
            }
          }}
          title="Delete Document"
          message={`Are you sure you want to delete Document ${documentToDelete ? documents.findIndex((d) => d.id === documentToDelete.id) + 1 : ''}? This action cannot be undone.`}
          isLoading={!!deletingDocumentId}
        />
      </div>
    </motion.div>
  );
}
