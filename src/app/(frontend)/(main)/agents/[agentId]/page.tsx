'use client';

import { useEffect, useState } from 'react';
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
  Edit,
  Save,
  Globe,
  Settings,
  MessageSquare,
  Plus,
} from 'lucide-react';
import {
  Action,
  ExecutionContext,
} from '@/app/api/lib/model/action/baseAction';
import { Agent } from '@/app/api/lib/model/agent/agent';
import { use } from 'react';
import { BackendAction } from '@/app/api/lib/model/action/backendAction';
import { FrontendAction } from '@/app/api/lib/model/action/frontendAction';
import { useActionForm } from '@/app/(frontend)/hooks/useActionForm';
import { useDocuments } from '@/app/(frontend)/hooks/useDocuments';
import { usePrompts } from '@/app/(frontend)/hooks/usePrompts';
import { useFramework } from '@/app/(frontend)/contexts/useFramework';
import { getRegisterMultipleToolsExample } from '@/app/(frontend)/lib/actionUtils';
import { Framework, getAgentScript } from '@/app/(frontend)/lib/scriptUtils';
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
import {
  AgentModel,
  AgentModelDisplay,
  AgentModelList,
} from '@/app/api/lib/model/agent/agent';

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
  const [agent, setAgent] = useState<Agent | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [loadingActions, setLoadingActions] = useState(true);
  const [deletingActionId, setDeletingActionId] = useState<string | null>(null);
  const [showClientActions, setShowClientActions] = useState(false);
  const [showAgentCode, setShowAgentCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const { selectedFramework, setSelectedFramework } = useFramework();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editWebsiteDomain, setEditWebsiteDomain] = useState('');
  const [editModel, setEditModel] = useState<AgentModel>(AgentModel.GEMINI_2_0_FLASH);
  const [editPrompts, setEditPrompts] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { handleUpdateAgent } = useAgents();
  const { handleDeleteAction } = useActionForm();
  const {
    documents,
    loadingDocuments,
    deletingDocumentId,
    handleDeleteDocument,
  } = useDocuments();
  const {
    prompts,
    loadingPrompts,
    deletingPromptId,
    handleDeletePrompt,
  } = usePrompts(params.agentId);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<Action | null>(null);
  const [isDeleteDocumentDialogOpen, setIsDeleteDocumentDialogOpen] =
    useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<
    (typeof documents)[0] | null
  >(null);
  const [isDeletePromptDialogOpen, setIsDeletePromptDialogOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<
    (typeof prompts)[0] | null
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
        setEditWebsiteDomain(data.agent?.websiteDomain || '');
        setEditModel(data.agent?.model as AgentModel || AgentModel.GEMINI_2_0_FLASH);
      } catch (error) {
        console.error('Error fetching agent:', error);
      } finally {
        setLoadingAgent(false);
      }
    }

    fetchAgent();
  }, [params.agentId]);

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const response = await fetch(`/api/agents/${params.agentId}/prompts`);
        if (!response.ok) return;
        const data = await response.json();
        let promptContents = data.prompts?.map((p: any) => p.content) || [];
        if (promptContents.length === 0) promptContents = [''];
        setEditPrompts(promptContents);
      } catch (e) {
        setEditPrompts(['']);
      }
    }
    fetchPrompts();
  }, [params.agentId]);

  // Fetch actions for the agent
  useEffect(() => {
    async function fetchActions() {
      try {
        const response = await fetch(`/api/agents/${params.agentId}/actions`);
        if (!response.ok) {
          throw new Error('Failed to fetch actions');
        }
        const data = await response.json();
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Edit functionality
  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    // Reset to original values
    if (agent) {
      setEditName(agent.name);
      setEditWebsiteDomain(agent.websiteDomain);
      setEditModel(agent.model as AgentModel);
    }
  };

  const saveChanges = async () => {
    if (!agent) return;
    
    try {
      setIsSaving(true);
      const filteredPrompts = editPrompts.filter((p) => p.trim());
      const updatePayload: any = { 
        name: editName, 
        websiteDomain: editWebsiteDomain, 
        model: editModel 
      };
      updatePayload.prompts = filteredPrompts;
      
      await handleUpdateAgent(agent.id, updatePayload);
      
      // Update local agent state
      setAgent({
        ...agent,
        name: editName,
        websiteDomain: editWebsiteDomain,
        model: editModel,
      });
      
      setIsEditing(false);
      toast.success('Agent updated successfully!');
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Failed to update agent. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addPrompt = () => {
    if (editPrompts.length < 4) setEditPrompts([...editPrompts, '']);
  };

  const removePrompt = (index: number) => {
    if (editPrompts.length > 1) setEditPrompts(editPrompts.filter((_, i) => i !== index));
  };

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...editPrompts];
    newPrompts[index] = value;
    setEditPrompts(newPrompts);
  };

  useEffect(() => {
    if (showClientActions || showAgentCode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showClientActions, showAgentCode]);

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

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            {isEditing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-transparent border-none p-0 focus:ring-0 focus:border-none"
                placeholder="Agent Name"
              />
            ) : (
              agent.name
            )}
          </h1>
          {!isEditing && (
            <Button
              onClick={startEditing}
              className="bg-secondary text-secondary-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-secondary/90 transition-transform rounded-lg px-4 py-2 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Agent
            </Button>
          )}
        </div>

        <Card
          className="border-[3px] border-border bg-card mb-6 rounded-xl shadow-xl border-l-8"
          style={{ borderLeftColor: 'var(--color-destructive)' }}
        >
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-destructive" />
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                Agent Details
              </CardTitle>
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Button
                  onClick={saveChanges}
                  disabled={isSaving}
                  className="bg-brand text-primary-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90 transition-transform rounded-lg px-4 py-2 flex items-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
                <Button
                  onClick={cancelEditing}
                  disabled={isSaving}
                  variant="outline"
                  className="border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-lg px-4 py-2"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <Globe className="h-4 w-4 text-destructive" />
                Domain:
              </Label>
              {isEditing ? (
                <Input
                  value={editWebsiteDomain}
                  onChange={(e) => setEditWebsiteDomain(e.target.value)}
                  placeholder="example.com"
                  className="mt-1 border-[2px] border-border"
                />
              ) : (
                <p className="text-muted-foreground text-sm sm:text-base ml-6">
                  {agent.websiteDomain}
                </p>
              )}
            </div>
            
            <div>
              <Label className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <Settings className="h-4 w-4 text-destructive" />
                Model:
              </Label>
              {isEditing ? (
                <Select
                  value={editModel}
                  onValueChange={(value) => setEditModel(value as AgentModel)}
                >
                  <SelectTrigger className="mt-1 border-[2px] border-border">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {AgentModelList.map((modelValue) => (
                      <SelectItem key={modelValue} value={modelValue}>
                        {AgentModelDisplay[modelValue]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-muted-foreground text-sm sm:text-base ml-6">
                  {AgentModelDisplay[agent.model as AgentModel] || agent.model}
                </p>
              )}
            </div>
            
            <div>
              <Label className="text-foreground flex items-center gap-2 text-sm font-semibold">
                Created:
              </Label>
              <p className="text-muted-foreground text-sm sm:text-base ml-6">
                {new Date(agent.createdAt).toLocaleString()}
              </p>
            </div>

            {isEditing && (
              <div>
                <Label className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  <MessageSquare className="h-4 w-4 text-brand" />
                  Suggested Prompts (Optional)
                </Label>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  These are example prompts users can choose from or use as inspiration when interacting with your agent.
                </p>
                <div className="mt-4 ml-6 space-y-4">
                  {editPrompts.map((prompt, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Textarea
                          value={prompt}
                          onChange={(e) => updatePrompt(index, e.target.value)}
                          placeholder="Enter a prompt for your agent..."
                          className="border-[2px] border-border resize-none"
                          rows={3}
                        />
                      </div>
                      {(editPrompts.length > 1 || (index === 0 && prompt.trim())) && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            if (index === 0 && editPrompts.length === 1) {
                              updatePrompt(0, '');
                            } else {
                              removePrompt(index);
                            }
                          }}
                          className="ml-auto rounded-full p-2 hover:bg-destructive/80 transition group-hover:scale-110"
                          tabIndex={-1}
                        >
                          <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-12" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPrompt}
                    className="border-[2px] border-border hover:bg-secondary"
                    disabled={editPrompts.length >= 4}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Prompt
                  </Button>
                  {editPrompts.length >= 4 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Maximum 4 prompts allowed.
                    </p>
                  )}
                </div>
              </div>
            )}

            {!isEditing && prompts.length > 0 && (
              <div className="mt-4">
                <Label className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  <MessageSquare className="h-4 w-4 text-brand" />
                  Suggested Prompts:
                </Label>
                <div className="space-y-2 mt-2">
                  {prompts.map((prompt, idx) => (
                    <div key={prompt.id} className="p-2 bg-muted/30 rounded-md border border-border/50 ml-6">
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                        {prompt.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
          <Button
            asChild
            className="bg-brand text-primary-foreground border-[3px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-base font-semibold px-4 py-2 sm:px-6 sm:py-2 rounded-lg w-full sm:w-auto hover:bg-brand/90"
          >
            <Link
              href={`/agents/${params.agentId}/actions/new`}
              className="flex items-center justify-center"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Action
            </Link>
          </Button>
          <Button
            asChild
            className="bg-brand text-primary-foreground border-[3px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-base font-semibold px-4 py-2 sm:px-6 sm:py-2 rounded-lg w-full sm:w-auto hover:bg-brand/90"
          >
            <Link
              href={`/agents/${params.agentId}/documents/new`}
              className="flex items-center justify-center"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Document
            </Link>
          </Button>
          <Button
            className="bg-secondary text-secondary-foreground border-[3px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-base font-semibold px-4 py-2 sm:px-6 sm:py-2 rounded-lg flex items-center gap-2 shadow-md w-full sm:w-auto justify-center hover:bg-secondary/90"
            onClick={() => setShowAgentCode(true)}
            title="Show installation code for this agent"
          >
            <Code className="h-5 w-5" />
            Embed Your Agent
          </Button>
          {clientActions.length > 0 && (
            <Button
              className="bg-secondary text-secondary-foreground border-[3px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-base font-semibold px-4 py-2 sm:px-6 sm:py-2 rounded-lg flex items-center gap-2 shadow-md w-full sm:w-auto justify-center hover:bg-secondary/90"
              onClick={() => setShowClientActions(true)}
              title="Show code for client actions"
            >
              <Zap className="h-5 w-5" />
              Client Actions Code
            </Button>
          )}
        </div>
        {showClientActions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl shadow-2xl"
              aria-hidden="true"
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
                          Client Actions Code
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close"
                        className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-3 rounded-full hover:bg-destructive/10 transition"
                        onClick={() => setShowClientActions(false)}
                      >
                        <X className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-8 mt-8">
                      <div>
                        <Label className="text-foreground text-lg font-semibold flex items-center gap-2 mt-4">
                          <Code className="h-4 w-4 text-destructive" />
                          Framework
                        </Label>
                        <p className="text-sm text-muted-foreground mt-2 ml-6">
                          Select the framework you're using to implement the
                          client actions.
                        </p>
                        <div className="mt-2 ml-6">
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
                        <Label className="text-foreground text-lg font-semibold flex items-center gap-2 mb-2">
                          <Code className="h-4 w-4 text-destructive" />
                          Implementation Code
                        </Label>
                        <SyntaxHighlighter
                          language="html"
                          style={vscDarkPlus}
                          customStyle={{
                            borderRadius: '8px',
                            padding: '16px',
                            border: '2px solid var(--color-border)',
                            backgroundColor: 'var(--color-background-dark)',
                          }}
                        >
                          {getRegisterMultipleToolsExample(
                            clientActions.map((action) => ({
                              functionName: action.name,
                              dataInputs: (
                                action.executionModel.parameters || []
                              ).map((param) => ({
                                name: param.name,
                                type: param.type,
                                description: param.description || '',
                                isArray: param.isArray || false,
                                required: param.required || true,
                              })),
                            })),
                            selectedFramework
                          )}
                        </SyntaxHighlighter>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              getRegisterMultipleToolsExample(
                                clientActions.map((action) => ({
                                  functionName: action.name,
                                  dataInputs: (
                                    action.executionModel.parameters || []
                                  ).map((param) => ({
                                    name: param.name,
                                    type: param.type,
                                    description: param.description || '',
                                    isArray: param.isArray || false,
                                    required: param.required || true,
                                  })),
                                })),
                                selectedFramework
                              )
                            );
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="absolute top-11 right-2 bg-secondary text-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-xl flex items-center gap-2 hover:bg-secondary/90 px-2 py-1 sm:px-3 sm:py-1.5"
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
                      <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4 text-sm">
                        <li>
                          Implement your functions into your app like the
                          example above
                        </li>
                        <li>
                          Add the code between the <code>&lt;body&gt;</code>{' '}
                          tags of your website's HTML
                        </li>
                        <li>
                          The code will be available to your agent as a
                          client-side action
                        </li>
                        <li>
                          Need help? Visit our{' '}
                          <Link
                            href="/docs"
                            className="text-[#FE4A60] hover:underline"
                          >
                            documentation{' '}
                            <ExternalLink className="inline w-4 h-4" />
                          </Link>
                          .
                        </li>
                      </ul>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {showAgentCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl shadow-2xl"
              aria-hidden="true"
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
                          Agent Installation Code
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
                          <Code className="h-4 w-4 text-destructive" />
                          Framework
                        </Label>
                        <p className="text-sm text-muted-foreground mt-2 ml-6">
                          Select the framework you're using to implement the
                          agent.
                        </p>
                        <div className="mt-2 ml-6">
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
                        <Label className="text-foreground text-lg font-semibold flex items-center gap-2 mb-2">
                          <Code className="h-4 w-4 text-destructive" />
                          Installation Code
                        </Label>
                        <SyntaxHighlighter
                          language="html"
                          style={vscDarkPlus}
                          customStyle={{
                            borderRadius: '8px',
                            padding: '16px',
                            border: '2px solid var(--color-border)',
                            backgroundColor: 'var(--color-background-dark)',
                          }}
                        >
                          {getAgentScript(selectedFramework, params.agentId)}
                        </SyntaxHighlighter>
                        <Button
                          onClick={() =>
                            handleCopy(
                              getAgentScript(selectedFramework, params.agentId)
                            )
                          }
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
                            Paste it between the <code>&lt;body&gt;</code> tags
                            of your website's HTML
                          </li>
                          <li>Save and publish your website changes</li>
                          <li>
                            Your agent will appear on your website at{' '}
                            <code>https://{agent.websiteDomain}</code>
                          </li>
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

        {loadingActions ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
          </div>
        ) : actions.length === 0 ? (
          <p className="text-foreground text-base sm:text-lg mb-4 flex items-center justify-center text-center">
            <Zap className="h-6 w-6 mr-2 text-[#FE4A60]" />
            No actions found. Create one to get started!
          </p>
        ) : (
          <Card
            className="border-[3px] border-border bg-card mb-6 rounded-xl shadow-xl border-l-8"
            style={{ borderLeftColor: 'var(--color-destructive)' }}
          >
            <CardHeader className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-destructive" />
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {actions.map((action, idx) => (
                  <li
                    key={action.id || action.name}
                    className="border-t pt-2 flex flex-row items-center transition hover:bg-muted hover:shadow-md rounded-lg group px-2 sm:px-4 py-2 gap-2"
                  >
                    <div className="flex-1">
                      <p className="text-base sm:text-lg text-foreground font-semibold mb-1">
                        {action.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        <span className="font-semibold">Description:</span>{' '}
                        {action.description}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        <span className="font-semibold">Context:</span>{' '}
                        {action.executionContext}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        <span className="font-semibold">Model:</span>{' '}
                        {action.executionContext === ExecutionContext.SERVER ? (
                          <>
                            {(
                              action as BackendAction
                            ).executionModel.request.method.toUpperCase()}{' '}
                            {
                              (action as BackendAction).executionModel.request
                                .url
                            }
                          </>
                        ) : (
                          (action as FrontendAction).executionModel.functionName
                        )}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        <span className="font-semibold">Parameters:</span>{' '}
                        {(action.executionModel.parameters || []).length > 0
                          ? (action.executionModel.parameters || [])
                              .map(
                                (param) =>
                                  `${param.name} (${param.type}${param.isArray ? '[]' : ''})`
                              )
                              .join(', ')
                          : 'None'}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="ml-auto rounded-full p-2 hover:bg-destructive/80 transition group-hover:scale-110"
                      onClick={() => {
                        setActionToDelete(action);
                        setIsDeleteDialogOpen(true);
                      }}
                      disabled={deletingActionId === action.id}
                      title="Delete Action"
                    >
                      {deletingActionId === action.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-12" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {loadingDocuments ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-foreground text-base sm:text-lg mb-4 flex items-center justify-center text-center">
            <FileText className="h-6 w-6 mr-2 text-[#FE4A60]" />
            No documents found. Add one to get started!
          </p>
        ) : (
          <Card
            className="border-[3px] border-border bg-card rounded-xl shadow-xl border-l-8"
            style={{ borderLeftColor: 'var(--color-destructive)' }}
          >
            <CardHeader className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-destructive" />
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {documents.map((doc, idx) => (
                  <li
                    key={doc.id}
                    className="border-t pt-2 flex flex-row items-center transition hover:bg-muted hover:shadow-md rounded-lg group px-2 sm:px-4 py-2 gap-2"
                  >
                    <div className="flex-1">
                      <p className="text-base sm:text-lg text-foreground font-semibold mb-1">
                        Document {idx + 1}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        <span className="font-semibold">Content:</span>{' '}
                        {doc.content.length > 100
                          ? `${doc.content.substring(0, 100)}...`
                          : doc.content}
                      </p>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                        <span className="font-semibold">Metadata:</span>
                        <ul>
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
                            .map(([key, value]) => (
                              <li key={key} className="mb-1">
                                <span className="font-semibold">{key}:</span>{' '}
                                {typeof value === 'object' && value !== null ? (
                                  <pre className="inline">
                                    {JSON.stringify(value, null, 2)}
                                  </pre>
                                ) : (
                                  String(value)
                                )}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="ml-auto rounded-full p-2 hover:bg-destructive/80 transition group-hover:scale-110"
                      onClick={() => {
                        setDocumentToDelete(doc);
                        setIsDeleteDocumentDialogOpen(true);
                      }}
                      disabled={deletingDocumentId === doc.id}
                      title="Delete Document"
                    >
                      {deletingDocumentId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-12" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
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

        <DeleteConfirmationDialog
          isOpen={isDeletePromptDialogOpen}
          onOpenChange={setIsDeletePromptDialogOpen}
          onConfirm={async () => {
            if (promptToDelete?.id) {
              await handleDeletePrompt(promptToDelete.id);
              setPromptToDelete(null);
            }
          }}
          title="Delete Prompt"
          message={`Are you sure you want to delete this prompt? This action cannot be undone.`}
          isLoading={!!deletingPromptId}
        />
      </div>
    </motion.div>
  );
}
