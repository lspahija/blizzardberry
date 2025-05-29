'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/(frontend)/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/app/(frontend)/components/ui/card';
import { Loader2, PlusCircle } from 'lucide-react';
import {
  Action,
  ExecutionContext,
} from '@/app/api/lib/model/action/baseAction';
import { Chatbot } from '@/app/api/lib/model/chatbot/chatbot';
import { use } from 'react';
import { BackendAction } from '@/app/api/lib/model/action/backendAction';
import { FrontendAction } from '@/app/api/lib/model/action/frontendAction';
import { Document } from '@/app/api/lib/model/document/document';

export default function ChatbotDetails({
  params: paramsPromise,
}: {
  params: Promise<{ chatbotId: string }>;
}) {
  const params = use(paramsPromise);
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingChatbot, setLoadingChatbot] = useState(true);
  const [loadingActions, setLoadingActions] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

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

  // Fetch documents for the chatbot
  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch(`/api/documents/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chatbotId: params.chatbotId }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (error) {
        console.error(
          `Error fetching documents for chatbot ${params.chatbotId}:`,
          error
        );
      } finally {
        setLoadingDocuments(false);
      }
    }

    fetchDocuments();
  }, [params.chatbotId]);

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
              Domain: {chatbot.websiteDomain}
            </p>
            <p className="text-gray-600 mb-4">
              Created: {new Date(chatbot.createdAt).toLocaleString()}
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
        </div>

        {loadingActions ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
          </div>
        ) : actions.length === 0 ? (
          <p className="text-gray-600 text-lg">
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
                      {action.executionModel.parameters.length > 0
                        ? action.executionModel.parameters
                            .map(
                              (param) =>
                                `${param.name} (${param.type}${param.isArray ? '[]' : ''})`
                            )
                            .join(', ')
                        : 'None'}
                    </p>
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
          <p className="text-gray-600 text-lg">
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
                    <p className="font-medium text-gray-900">
                      Document {idx + 1}
                    </p>
                    <p className="text-gray-600">
                      Content:{' '}
                      {doc.content.length > 100
                        ? `${doc.content.substring(0, 100)}...`
                        : doc.content}
                    </p>
                    <div className="text-sm text-gray-500">
                      <span className="font-semibold">Metadata:</span>
                      <ul>
                        {Object.entries(doc.metadata)
                          .filter(([key]) =>
                            !['loc', 'chatbot_id', 'chunk_index', 'parent_document_id'].includes(key)
                          )
                          .map(([key, value]) => (
                            <li key={key}>
                              <span className="font-semibold">{key}:</span>{' '}
                              {typeof value === 'object' && value !== null
                                ? <pre className="inline">{JSON.stringify(value, null, 2)}</pre>
                                : String(value)}
                            </li>
                          ))}
                      </ul>
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
