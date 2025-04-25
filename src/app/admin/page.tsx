"use client";

import React, { useState } from 'react';

export default function AdminPage() {
    const [apiSpec, setApiSpec] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{success: boolean, message: string} | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!apiSpec.trim()) {
            setSubmitResult({
                success: false,
                message: 'Please enter an OpenAPI specification'
            });
            return;
        }

        setIsSubmitting(true);
        setSubmitResult(null);

        try {
            const response = await fetch('/api/actions/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    format: 'openapi',
                    content: apiSpec
                })
            });

            if (response.status == 201) {
                setSubmitResult({
                    success: true,
                    message: 'Chatbot created successfully!'
                });
                setShowInstructions(true);
            } else {
                setSubmitResult({
                    success: false,
                    message: 'Failed to create chatbot'
                });
            }
        } catch (error) {
            setSubmitResult({
                success: false,
                message: 'An error occurred while submitting the OpenAPI spec'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = () => {
        const codeSnippet = `<meta httpEquiv="Content-Security-Policy"
      content="default-src 'self' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *; manifest-src 'self' *;"/>
<div id="myWidget" />
<Script id="widget-script" strategy="afterInteractive">
  {
    \`(function() {
    var s = document.createElement('script');
    s.src = 'http://localhost:3000/widget.js';
    s.async = true;
    document.head.appendChild(s);
  })();\`
  }
</Script>`;

        navigator.clipboard.writeText(codeSnippet)
            .then(() => {
                // Set a temporary success message
                const copyBtn = document.getElementById('copyBtn');
                if (copyBtn) {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                    }, 2000);
                }
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    const createNewChatbot = () => {
        setApiSpec('');
        setSubmitResult(null);
        setShowInstructions(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Admin</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        {showInstructions ? 'Installation Instructions' : 'Create a chatbot from an OpenAPI spec'}
                    </p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    {!showInstructions ? (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="apiSpec" className="block text-sm font-medium text-gray-700 mb-2">
                                    OpenAPI Spec (YAML or JSON)
                                </label>
                                <textarea
                                    id="apiSpec"
                                    name="apiSpec"
                                    rows={15}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Paste your OpenAPI specification here..."
                                    value={apiSpec}
                                    onChange={(e) => setApiSpec(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? 'Creating Chatbot...' : 'Create Chatbot'}
                                </button>
                            </div>

                            {submitResult && !submitResult.success && (
                                <div className="mt-6 p-4 rounded-md bg-red-50 text-red-800">
                                    <p className="text-sm font-medium">{submitResult.message}</p>
                                </div>
                            )}
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800">Chatbot created successfully!</h3>
                                        <p className="text-sm text-green-700 mt-1">
                                            Follow the instructions below to add the chatbot to your website.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Installation Instructions</h3>
                                <p className="text-gray-600 mb-4">
                                    Put this code at the bottom of your <code className="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono">&lt;body&gt;</code> tag in your HTML file:
                                </p>

                                <div className="relative">
                                    <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
                                        <code className="text-sm font-mono">
{`<meta httpEquiv="Content-Security-Policy"
      content="default-src 'self' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *; manifest-src 'self' *;"/>
<div id="myWidget" />
<Script id="widget-script" strategy="afterInteractive">
  {
    \`(function() {
    var s = document.createElement('script');
    s.src = 'http://localhost:3000/widget.js';
    s.async = true;
    document.head.appendChild(s);
  })();\`
  }
</Script>`}
                                        </code>
                                    </pre>
                                    <button
                                        id="copyBtn"
                                        onClick={copyToClipboard}
                                        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded"
                                    >
                                        Copy Code
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={createNewChatbot}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Create Another Chatbot
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}