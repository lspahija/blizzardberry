'use client';

import { Suspense, useEffect, useState } from 'react';
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

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

function ActionsContent({
  actions,
  deletingActionId,
  setActions,
  setDeletingActionId,
}: {
  actions: Action[];
  deletingActionId: string | null;
  setActions: (actions: Action[]) => void;
  setDeletingActionId: (id: string | null) => void;
}) {
  const { handleDeleteAction } = useActionForm();

  const handleDeleteActionWithLoading = async (actionId: string) => {
    setDeletingActionId(actionId);
    try {
      await handleDeleteAction(actionId);
      setActions(actions.filter((action) => action.id !== actionId));
    } finally {
      setDeletingActionId(null);
    }
  };

  return (
    <>
      {actions.length === 0 ? (
        <p className="text-gray-600 text-lg mb-4 flex items-center justify-center">
          <Zap className="h-6 w-6 mr-2 text-[#FE4A60]" />
          No actions found. Create one to get started!
        </p>
      ) : (
        <Card className="border-[3px] border-gray-900 bg-[#FFFDF8] mb-6 rounded-xl shadow-xl border-l-8 border-l-[#FE4A60]">
          <CardHeader className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-[#FE4A60]" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {actions.map((action, idx) => (
                <li
                  key={action.id || action.name}
                  className="border-t pt-2 flex items-center transition hover:bg-[#FFF4DA] hover:shadow-md rounded-lg group px-4 py-2"
                >
                  <Zap className="h-4 w-4 text-[#FE4A60]/80 mr-3 mt-1" />
                  <div className="flex-1">
                    <p className="text-lg md:text-lg text-base text-gray-900 font-semibold mb-1">
                      {action.name}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-semibold">Description:</span>{' '}
                      {action.description}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-semibold">Context:</span>{' '}
                      {action.executionContext}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-semibold">Model:</span>{' '}
                      {action.executionContext === ExecutionContext.SERVER ? (
                        <>
                          {(
                            action as BackendAction
                          ).executionModel.request.method.toUpperCase()}{' '}
                          {(action as BackendAction).executionModel.request.url}
                        </>
                      ) : (
                        (action as FrontendAction).executionModel.functionName
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-semibold">Parameters:</span>{' '}
                      {(action.executionModel.parameters || []).length > 0
                        ? (action.prototype.executionModel.parameters || [])
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
                    size="sm"
                    className="ml-4 rounded-full p-2 hover:bg-[#FE4A60]/80 transition group-hover:scale-110"
                    onClick={() =>
                      action.id && handleDeleteActionWithLoading(action.id)
                    }
                    disabled={deletingActionId === action.id}
                    title="Delete Action"
                  >
                    {deletingActionId === action.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-12" />
                    )}
                  </Button>
                  {idx < actions.length - 1 && (
                    <hr className="my-2 border-gray-200" />
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default function AgentDetails({
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
  const {
    documents,
    loadingDocuments,
    deletingDocumentId,
    handleDeleteDocument,
  } = useDocuments();

  const clientActions = actions.filter(
    (action) => action.executionContext === ExecutionContext.CLIENT
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    async function fetchAgent() {
      try {
        const response = await fetch(`/api/agents/${params.agentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch agent');
        }
        const data = await response.json();
        setAgent(data.agent || null);
      } catch (error) {
        console.error('Error fetching agent:', error);
      } finally {
        setLoadingAgent(false);
      }
    }

    fetchAgent();
  }, [params.agentId]);

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
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8]">
        <p className="text-gray-900 text-lg">
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
      className="min-h-screen flex flex-col bg-[#FFFDF8] p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            {agent.name}
          </h1>
          <Button
            asChild
            className="bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-base font-semibold px-6 py-2 rounded-lg"
          >
            <Link href="/dashboard" className="flex items-center">
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card className="border-[3px] border-gray-900 bg-[#FFFDF8] mb-6 rounded-xl shadow-xl border-l-8 border-l-[#FE4A60]">
          <CardHeader className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-[#FE4A60]" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              Agent Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-2 text-base">
              <span className="font-semibold">Domain:</span>{' '}
              {agent.websiteDomain}
            </p>
            <p className="text-gray-600 mb-2 text-base">
              <span className="font-semibold">Created:</span>{' '}
              {new Date(agent.createdAt).toLocaleString()}
            </p>
            <p className="text-gray-600 mb-2 text-base">
              <span className="font-semibold">Model:</span> {agent.model}
            </p>
          </CardContent>
        </Card>

        <div className="mb-6 flex space-x-4">
          <Button
            asChild
            className="bg-[#FE4A60] text-white border-[3px] border-gray-900 transition-all duration-200 text-base font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-[#ff6a7a]"
          >
            <Link
              href={`/agents/${params.agentId}/actions/new`}
              className="flex items-center"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Action
            </Link>
          </Button>
          <Button
            asChild
            className="bg-[#FE4A60] text-white border-[3px] border-gray-900 transition-all duration-200 text-base font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-[#ff6a7a]"
          >
            <Link
              href={`/agents/${params.agentId}/documents/new`}
              className="flex items-center"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Document
            </Link>
          </Button>
          <Button
            className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-base font-semibold px-6 py-2 rounded-lg flex items-center gap-2 shadow-md"
            onClick={() => setShowAgentCode(true)}
            title="Show installation code for this agent"
          >
            <Code className="h-5 w-5" />
            Agent Code
          </Button>
          {clientActions.length > 0 && (
            <Button
              className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-base font-semibold px-6 py-2 rounded-lg flex items-center gap-2 shadow-md"
              onClick={() => setShowClientActions(true)}
              title="Show code for client actions"
            >
              <Zap className="h-5 w-5" />
              Client Actions Code
            </Button>
          )}
        </div>

        {showClientActions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl shadow-2xl"
              aria-hidden="true"
            />
            <div className="relative z-10 max-w-4xl w-full max-h-[90vh] rounded-2xl">
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-gray-900 rounded-3xl translate-x-1 translate-y-1"></div>
                <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-3xl shadow-2xl border-l-8 border-l-[#FE4A60]">
                  <div className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#FE4A60]/60 scrollbar-track-[#FFF4DA]/60 rounded-2xl pr-2">
                    <CardHeader className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Code className="h-7 w-7 text-[#FE4A60]" />
                        <CardTitle className="text-2xl font-semibold text-gray-900">
                          Client Actions Code
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-[#FFF4DA]"
                        onClick={() => setShowClientActions(false)}
                      >
                        <X className="h-6 w-6 text-gray-900" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div>
                        <Label className="text-gray-900 text-lg font-semibold flex items-center gap-2 mt-4">
                          <Code className="h-4 w-4 text-[#FE4A60]" />
                          Framework
                        </Label>
                        <p className="text-sm text-gray-600 mt-2 ml-6">
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
                            <SelectTrigger className="w-[200px] border-[2px] border-gray-900">
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
                        <Label className="text-gray-900 text-lg font-semibold flex items-center gap-2 mb-2">
                          <Code className="h-4 w-4 text-[#FE4A60]" />
                          Implementation Code
                        </Label>
                        <SyntaxHighlighter
                          language="html"
                          style={vscDarkPlus}
                          customStyle={{
                            borderRadius: '8px',
                            padding: '16px',
                            border: '2px solid #1a1a1a',
                            backgroundColor: '#1a1a1a',
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
                                  })),
                                })),
                                selectedFramework
                              )
                            );
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="absolute top-11 right-2 bg-[#FFC480] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-xl flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          {copied ? 'Copied!' : 'Copy Code'}
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {showAgentCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl shadow-2xl"
              aria-hidden="true"
            />
            <div className="relative z-10 max-w-4xl w-full max-h-[90vh] rounded-2xl">
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-gray-900 rounded-3xl translate-x-1 translate-y-1"></div>
                <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-3xl shadow-2xl border-l-8 border-l-[#FE4A60]">
                  <div className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#FE4A60]/60 scrollbar-track-[#FFF4DA]/60 rounded-2xl pr-2">
                    <CardHeader className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Code className="h-7 w-7 text-[#FE4A60]" />
                        <CardTitle className="text-2xl font-semibold text-gray-900">
                          Agent Installation Code
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-[#FFF4DA]"
                        onClick={() => setShowAgentCode(false)}
                      >
                        <X className="h-6 w-6 text-gray-900" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div>
                        <Label className="text-gray-900 text-lg font-semibold flex items-center gap-2 mt-4">
                          <Code className="h-4 w-4 text-[#FE4A60]" />
                          Framework
                        </Label>
                        <p className="text-sm text-gray-600 mt-2 ml-6">
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
                            <SelectTrigger className="w-[200px] border-[2px] border-gray-900">
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
                        <Label className="text-gray-900 text-lg font-semibold flex items-center gap-2 mb-2">
                          <Code className="h-4 w-4 text-[#FE4A60]" />
                          Installation Code
                        </Label>
                        <SyntaxHighlighter
                          language="html"
                          style={vscDarkPlus}
                          customStyle={{
                            borderRadius: '8px',
                            padding: '16px',
                            border: '2px solid #1a1a1a',
                            backgroundColor: '#1a1a1a',
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
                          className="absolute top-11 right-2 bg-[#FFC480] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-xl flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          {copied ? 'Copied!' : 'Copy Code'}
                        </Button>
                      </div>
                      <div>
                        <Label className="text-gray-900 text-lg font-semibold flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-[#FE4A60]" />
                          Installation Instructions
                        </Label>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 ml-6">
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
                            <a
                              href="https://blizzardberry.com/docs"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#FE4A60] hover:underline"
                            >
                              documentation{' '}
                              <ExternalLink className="inline w-4 h-4" />
                            </a>
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
        ) : (
          <Suspense
            fallback={
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
              </div>
            }
          >
            <ActionsContent
              actions={actions}
              deletingActionId={deletingActionId}
              setActions={setActions}
              setDeletingActionId={setDeletingActionId}
            />
          </Suspense>
        )}

        {loadingDocuments ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-gray-600 text-lg mb-4 flex items-center justify-center">
            <FileText className="h-6 w-6 mr-2 text-[#FE4A60]" />
            No documents found. Add one to get started!
          </p>
        ) : (
          <Card className="border-[3px] border-gray-900 bg-[#FFFDF8] rounded-xl shadow-xl border-l-8 border-l-[#FE4A60]">
            <CardHeader className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-[#FE4A60]" />
              <CardTitle className="text-2xl font-bold text-gray-900">
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {documents.map((doc, idx) => (
                  <li
                    key={doc.id}
                    className="border-t pt-2 flex items-center transition hover:bg-[#FFF4DA] hover:shadow-md rounded-lg group px-4 py-2"
                  >
                    <FileText className="h-4 w-4 text-[#FE4A60]/80 mr-3 mt-1" />
                    <div className="flex-1">
                      <p className="text-lg md:text-lg text-base text-gray-900 font-semibold mb-1">
                        Document {idx + 1}
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        <span className="font-semibold">Content:</span>{' '}
                        {doc.content.length > 100
                          ? `${doc.content.substring(0, 100)}...`
                          : doc.content}
                      </p>
                      <div className="text-sm text-gray-500 mb-1">
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
                      size="sm"
                      className="ml-4 rounded-full p-2 hover:bg-[#FE4A60]/80 transition group-hover:scale-110"
                      onClick={() => doc.id && handleDeleteDocument(doc.id)}
                      disabled={deletingDocumentId === doc.id}
                      title="Delete Document"
                    >
                      {deletingDocumentId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-12" />
                      )}
                    </Button>
                    {idx < documents.length - 1 && (
                      <hr className="my-2 border-gray-200" />
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
