'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, FormEvent } from 'react';

export default function Chat() {
    const { messages, input, handleInputChange, handleSubmit } = useChat({api: '/api/example-chat'});
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
                return <div key={key} className="text-[var(--foreground)]">{part.text}</div>;
            case 'tool-invocation':
                const fetchResult = fetchResults[key];
                return (
                    <div key={key} className="mt-3 p-3 bg-[var(--card)] rounded-[var(--radius)]">
                        <div className="font-semibold text-[var(--card-foreground)]">Tool Invocation:</div>
                        <pre className="mt-1 p-2 bg-white dark:bg-[var(--background)] rounded-[var(--radius)] text-sm text-[var(--foreground)] overflow-auto">
                            {JSON.stringify(part.toolInvocation, null, 2)}
                        </pre>
                        {fetchResult ? (
                            <div className="mt-2">
                                <div className="font-semibold text-[var(--card-foreground)]">Fetch Result:</div>
                                <pre className="mt-1 p-2 bg-white dark:bg-[var(--background)] rounded-[var(--radius)] text-sm text-[var(--foreground)] overflow-auto">
                                    {JSON.stringify(fetchResult, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <div className="mt-1 text-[var(--foreground)]/50">Executing request...</div>
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
        <div className="fixed inset-0 flex items-center justify-center bg-[var(--background)]">
            <div className="flex flex-col h-[90vh] w-full max-w-2xl mx-4 bg-[var(--card)] rounded-[var(--radius)] shadow-2xl">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-[var(--radius)] ${
                                    message.role === 'user'
                                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                                        : 'bg-[var(--card)] text-[var(--card-foreground)]'
                                } shadow-md`}
                            >
                                <span className="text-xs font-semibold opacity-75">
                                    {message.role === 'user' ? 'You' : 'AI'}
                                </span>
                                <div className="mt-1">
                                    {message.parts.map((part: MessagePart, index) =>
                                        renderPart(part, message.id, index)
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <form
                    onSubmit={handleFormSubmit}
                    className="p-4 bg-[var(--card)] border-t border-[var(--border)]"
                >
                    <div className="flex items-center space-x-2">
                        <input
                            className="flex-1 p-3 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            value={input}
                            placeholder="Type a message..."
                            onChange={handleInputChange}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius)] hover:bg-[var(--primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

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