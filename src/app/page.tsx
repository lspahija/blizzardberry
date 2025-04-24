'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';

export default function Chat() {
    const { messages, input, handleInputChange, handleSubmit } = useChat();
    const [fetchResults, setFetchResults] = useState<{ [key: string]: any }>({});

    const executeFetch = async (httpModel: any, messageId: string, partIndex: number) => {
        try {
            const response = await fetch(httpModel.url, {
                method: httpModel.method,
                headers: httpModel.header,
                body: httpModel.data,
            });
            const result = await response.json();
            setFetchResults((prev) => ({
                ...prev,
                [`${messageId}-${partIndex}`]: {
                    status: response.status,
                    data: result,
                },
            }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setFetchResults((prev) => ({
                ...prev,
                [`${messageId}-${partIndex}`]: {
                    error: 'Failed to execute request',
                    details: errorMessage,
                },
            }));
        }
    };

    // Effect to handle tool invocations and execute fetch
    useEffect(() => {
        messages.forEach((message) => {
            message.parts.forEach((part, i) => {
                if (
                    part.type === 'tool-invocation' &&
                    part.toolInvocation.state === 'result' &&
                    part.toolInvocation.result?.httpModel
                ) {
                    const key = `${message.id}-${i}`;
                    if (!fetchResults[key]) {
                        executeFetch(part.toolInvocation.result.httpModel, message.id, i);
                    }
                }
            });
        });
    }, [messages]);

    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
            {messages.map((message) => (
                <div key={message.id} className="whitespace-pre-wrap mb-4">
                    <strong>{message.role === 'user' ? 'User: ' : 'AI: '}</strong>
                    {message.parts.map((part, i) => {
                        switch (part.type) {
                            case 'text':
                                return <div key={`${message.id}-${i}`}>{part.text}</div>;
                            case 'tool-invocation':
                                const fetchResult = fetchResults[`${message.id}-${i}`];
                                return (
                                    <div key={`${message.id}-${i}`} className="mt-2">
                                        <div>Tool Invocation:</div>
                                        <pre className="bg-gray-100 dark:bg-zinc-800 p-2 rounded">
                                            {JSON.stringify(part.toolInvocation, null, 2)}
                                        </pre>
                                        {fetchResult ? (
                                            <div>
                                                <div>Fetch Result:</div>
                                                <pre className="bg-gray-100 dark:bg-zinc-800 p-2 rounded">
                                                    {JSON.stringify(fetchResult, null, 2)}
                                                </pre>
                                            </div>
                                        ) : (
                                            <div>Executing request...</div>
                                        )}
                                    </div>
                                );
                        }
                    })}
                </div>
            ))}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                }}
                className="fixed bottom-0 w-full max-w-md p-2 mb-8"
            >
                <input
                    className="w-full p-2 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl dark:bg-zinc-900"
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                />
            </form>
        </div>
    );
}