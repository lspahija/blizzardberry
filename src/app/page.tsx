'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, FormEvent } from 'react';

export default function Chat(){
    const { messages, input, handleInputChange, handleSubmit } = useChat();
    const [fetchResults, setFetchResults] = useState<Record<string, FetchResult>>({});

    const executeFetch = async (httpModel: ToolInvocationPart['toolInvocation']['result'], messageId: string, partIndex: number) => {
        const key = `${messageId}-${partIndex}`;
        try {
            const response = await fetch(httpModel.url, {
                method: httpModel.method,
                headers: httpModel.headers,
                body: httpModel.body,
            });
            const data = await response.json();
            setFetchResults((prev) => ({
                ...prev,
                [key]: { status: response.status, data },
            }));
        } catch (error) {
            setFetchResults((prev) => ({
                ...prev,
                [key]: {
                    error: 'Failed to execute request',
                    details: error instanceof Error ? error.message : 'Unknown error occurred',
                },
            }));
        }
    };

    useEffect(() => {
        messages.forEach((message) => {
            message.parts.forEach((part: MessagePart, index) => {
                if (part.type === 'tool-invocation' && part.toolInvocation.state === 'result' && part.toolInvocation.result) {
                    const key = `${message.id}-${index}`;
                    if (!fetchResults[key]) {
                        executeFetch(part.toolInvocation.result, message.id, index);
                    }
                }
            });
        });
    }, [messages, fetchResults]);

    const renderPart = (part: MessagePart, messageId: string, index: number) => {
        const key = `${messageId}-${index}`;
        switch (part.type) {
            case 'text':
                return <div key={key}>{part.text}</div>;
            case 'tool-invocation':
                const fetchResult = fetchResults[key];
                return (
                    <div key={key} className="mt-2">
                        <div className="font-semibold">Tool Invocation:</div>
                        <pre className="bg-gray-100 dark:bg-zinc-800 p-2 rounded text-sm">
              {JSON.stringify(part.toolInvocation, null, 2)}
            </pre>
                        {fetchResult ? (
                            <div>
                                <div className="font-semibold">Fetch Result:</div>
                                <pre className="bg-gray-100 dark:bg-zinc-800 p-2 rounded text-sm">
                  {JSON.stringify(fetchResult, null, 2)}
                </pre>
                            </div>
                        ) : (
                            <div className="text-gray-500">Executing request...</div>
                        )}
                    </div>
                );
        }
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSubmit(e);
    };

    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto">
            {messages.map((message) => (
                <div key={message.id} className="mb-4 whitespace-pre-wrap">
                    <strong className="font-bold">{message.role === 'user' ? 'User: ' : 'AI: '}</strong>
                    {message.parts.map((part: MessagePart, index) => renderPart(part, message.id, index))}
                </div>
            ))}
            <form onSubmit={handleFormSubmit} className="fixed bottom-0 w-full max-w-md p-2 mb-8">
                <input
                    className="w-full p-2 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl dark:bg-zinc-900"
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                />
            </form>
        </div>
    );
};

interface FetchResult {
    status?: number;
    data?: unknown;
    error?: string;
    details?: string;
}

interface ToolInvocationPart {
    type: 'tool-invocation';
    toolInvocation: {
        state: string;
        result?: {
            url: string;
            method: string;
            headers?: Record<string, string>;
            body?: string;
        };
    };
}

interface TextPart {
    type: 'text';
    text: string;
}

type MessagePart = TextPart | ToolInvocationPart;
