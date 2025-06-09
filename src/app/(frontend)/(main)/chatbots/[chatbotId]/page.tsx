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
import { Loader2, PlusCircle, Trash2, X, Copy, ExternalLink } from 'lucide-react';
import {
  Action,
  ExecutionContext,
} from '@/app/api/lib/model/action/baseAction';
import { Chatbot } from '@/app/api/lib/model/chatbot/chatbot';
import { use } from 'react';
import { BackendAction } from '@/app/api/lib/model/action/backendAction';
import { FrontendAction } from '@/app/api/lib/model/action/frontendAction';
import { useActionForm } from '@/app/(frontend)/hooks/useActionForm';
import { useDocuments } from '@/app/(frontend)/hooks/useDocuments';
import { getRegisterMultipleToolsExample } from '@/app/(frontend)/lib/actionUtils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ChatbotDetails({
  params: paramsPromise,
}: {
  params: Promise<{ chatbotId: string }>;
}) {
  const params = use(paramsPromise);
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loadingChatbot, setLoadingChatbot] = useState(true);
  const [loadingActions, setLoadingActions] = useState(true);
  const [deletingActionId, setDeletingActionId] = useState<string | null>(null);
  const [showClientActions, setShowClientActions] = useState(false);
  const [showChatbotCode, setShowChatbotCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const { handleDeleteAction } = useActionForm();
  const { documents, loadingDocuments, deletingDocumentId, handleDeleteDocument } = useDocuments();

  const getChatbotCode = (chatbotId: string) => `<Script
  id="omni-interface-chatbot"
  src="http://localhost:3000/chatbot.js"
  strategy="afterInteractive"
  data-chatbot-id="${chatbotId}"
/>`;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  // Fetch chatbot details
  useEffect(() => {
    async function fetchChatbot() {
      try {
        const response = await fetch(`/api/chatbots/${params.chatbotId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chatbot');
        }
        const data = await response.json();
        setChatbot(data.chatbot || null);
      } catch (error) {
        console.error('Error fetching chatbot:', error);
      } finally {
        setLoadingChatbot(false);
      }
    }

    fetchChatbot();
  }, [params.chatbotId]);

  // Fetch actions for the chatbot
  useEffect(() => {
    async function fetchActions() {
      try {
        const response = await fetch(
          `/api/chatbots/${params.chatbotId}/actions`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch actions');
        }
        const data = await response.json();
        setActions(data.actions || []);
      } catch (error) {
        console.error(
          `Error fetching actions for chatbot ${params.chatbotId}:`,
          error
        );
      } finally {
        setLoadingActions(false);
      }
    }

    fetchActions();
  }, [params.chatbotId]);

  const handleDeleteActionWithLoading = async (actionId: string) => {
    setDeletingActionId(actionId);
    try {
      await handleDeleteAction(actionId);
      setActions(actions.filter(action => action.id !== actionId));
    } finally {
      setDeletingActionId(null);
    }
  };

  const clientActions = actions.filter(action => action.executionContext === ExecutionContext.CLIENT);
  const clientActionsCode = getRegisterMultipleToolsExample(clientActions.map(action => ({
    functionName: action.name,
    dataInputs: (action.executionModel.parameters || []).map(param => ({
      name: param.name,
      type: param.type,
      description: param.description || '',
      isArray: param.isArray
    }))
  })));

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (showClientActions || showChatbotCode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showClientActions, showChatbotCode]);

  if (loadingChatbot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8]">
        <p className="text-gray-900 text-lg">
          Chatbot not found.{' '}
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {chatbot.name}
          </h1>
          <Button
            asChild
            className="bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
          >
            <Link href="/dashboard" className="flex items-center">
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card className="border-[3px] border-gray-900 bg-[#FFFDF8] mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Chatbot Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-2">
              <strong>Domain:</strong> {chatbot.websiteDomain}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Created:</strong> {new Date(chatbot.createdAt).toLocaleString()}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Model:</strong> {chatbot.model}
            </p>
          </CardContent>
        </Card>

        <div className="mb-6 flex space-x-4">
          <Button
            asChild
            className="bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
          >
            <Link
              href={`/chatbots/${params.chatbotId}/actions/new`}
              className="flex items-center"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Action
            </Link>
          </Button>
          <Button
            asChild
            className="bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
          >
            <Link
              href={`/chatbots/${params.chatbotId}/documents/new`}
              className="flex items-center"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Document
            </Link>
          </Button>
          <Button
            className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
            onClick={() => setShowChatbotCode(true)}
          >
            Chatbot Code
          </Button>
          {clientActions.length > 0 && (
            <Button
              className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
              onClick={() => setShowClientActions(true)}
            >
              Client Actions Code
            </Button>
          )}
        </div>
        {showClientActions && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: 'rgba(0,0,0,0.01)',
              pointerEvents: 'auto',
              overscrollBehavior: 'contain',
              touchAction: 'none',
            }}
            onWheel={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}
          >
            <div
              className="bg-[#FFFDF8] p-6 rounded-lg shadow-lg max-w-4xl w-full relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowClientActions(false)}
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Actions Code</h2>
              <div className="relative mb-2 max-h-[60vh] overflow-auto">
                <SyntaxHighlighter
                  language="javascript"
                  style={vscDarkPlus}
                  customStyle={{
                    borderRadius: '8px',
                    padding: '16px',
                    border: '2px solid #1a1a1a',
                    backgroundColor: '#1a1a1a',
                    margin: 0,
                  }}
                >
                  {clientActionsCode}
                </SyntaxHighlighter>
                <Button
                  onClick={() => handleCopy(clientActionsCode)}
                  className="absolute top-2 right-2 bg-[#FFC480] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Installation Instructions</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Implement your client-side functions into your app like the example above</li>
                  <li>Add the code between the <code>&lt;body&gt;</code> tags of your website's HTML</li>
                  <li>These functions will be available to your chatbot as client-side actions</li>
                  <li>
                    Need help? Visit our{' '}
                    <a
                      href="https://omni-interface.com/docs"
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
            </div>
          </div>
        )}

        {showChatbotCode && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: 'rgba(0,0,0,0.01)',
              pointerEvents: 'auto',
              overscrollBehavior: 'contain',
              touchAction: 'none',
            }}
            onWheel={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}
          >
            <div
              className="bg-[#FFFDF8] p-6 rounded-lg shadow-lg max-w-4xl w-full relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowChatbotCode(false)}
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Chatbot Installation Code</h2>
              <div className="relative mb-2">
                <SyntaxHighlighter
                  language="html"
                  style={vscDarkPlus}
                  customStyle={{
                    borderRadius: '8px',
                    padding: '16px',
                    border: '2px solid #1a1a1a',
                    backgroundColor: '#1a1a1a',
                    margin: 0,
                  }}
                >
                  {getChatbotCode(params.chatbotId)}
                </SyntaxHighlighter>
                <Button
                  onClick={() => handleCopy(getChatbotCode(params.chatbotId))}
                  className="absolute top-2 right-2 bg-[#FFC480] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Installation Instructions</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Copy the code snippet above</li>
                  <li>Paste it between the <code>&lt;body&gt;</code> tags of your website's HTML</li>
                  <li>Save and publish your website changes</li>
                  <li>Your chatbot will appear on your website at <code>https://{chatbot.websiteDomain}</code></li>
                  <li>
                    Need help? Visit our{' '}
                    <a
                      href="https://omni-interface.com/docs"
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
            </div>
          </div>
        )}

        {loadingActions ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
          </div>
        ) : actions.length === 0 ? (
          <p className="text-gray-600 text-lg mb-4">
            No actions found. Create one to get started!
          </p>
        ) : (
          <Card className="border-[3px] border-gray-900 bg-[#FFFDF8] mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {actions.map((action) => (
                  <li key={action.id || action.name} className="border-t pt-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{action.name}</p>
                        <p className="text-gray-600">{action.description}</p>
                        <p className="text-sm text-gray-500">
                          Context: {action.executionContext}
                        </p>
                        <p className="text-sm text-gray-500">
                          Model:{' '}
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
                        <p className="text-sm text-gray-500">
                          Parameters:{' '}
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
                        size="sm"
                        className="ml-4"
                        onClick={() => action.id && handleDeleteActionWithLoading(action.id)}
                        disabled={deletingActionId === action.id}
                      >
                        {deletingActionId === action.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
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
          <p className="text-gray-600 text-lg mb-4">
            No documents found. Add one to get started!
          </p>
        ) : (
          <Card className="border-[3px] border-gray-900 bg-[#FFFDF8]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {documents.map((doc, idx) => (
                  <li key={doc.id} className="border-t pt-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          Document {idx + 1}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Content:</span>{' '}
                          {doc.content.length > 100
                            ? `${doc.content.substring(0, 100)}...`
                            : doc.content}
                        </p>
                        <div className="text-sm text-gray-500">
                          <span className="font-semibold">Metadata:</span>
                          <ul>
                            {Object.entries(doc.metadata)
                              .filter(
                                ([key]) =>
                                  ![
                                    'loc',
                                    'chatbot_id',
                                    'chunk_index',
                                    'parent_document_id',
                                  ].includes(key)
                              )
                              .map(([key, value]) => (
                                <li key={key}>
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
                        className="ml-4"
                        onClick={() => doc.id && handleDeleteDocument(doc.id)}
                        disabled={deletingDocumentId === doc.id}
                      >
                        {deletingDocumentId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
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
