'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { CheckCircle2, Copy } from "lucide-react";

export default function AdminPage() {
    const [apiSpec, setApiSpec] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success: boolean, message: string } | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, staggerChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!apiSpec.trim()) {
            setSubmitResult({
                success: false,
                message: 'Please enter an OpenAPI specification',
            });
            return;
        }

        setIsSubmitting(true);
        setSubmitResult(null);

        try {
            const response = await fetch('/api/actions/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    format: 'openapi',
                    content: apiSpec,
                }),
            });

            if (response.status === 201) {
                setSubmitResult({
                    success: true,
                    message: 'Chatbot created successfully!',
                });
                setShowInstructions(true);
            } else {
                setSubmitResult({
                    success: false,
                    message: 'Failed to create chatbot',
                });
            }
        } catch (error) {
            setSubmitResult({
                success: false,
                message: 'An error occurred while submitting the OpenAPI spec',
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                className="max-w-4xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="text-center mb-12" variants={itemVariants}>
                    <h1 className="text-4xl font-extrabold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-3 text-lg text-gray-600">
                        {showInstructions ? 'Install Your Chatbot' : 'Create a Chatbot from an OpenAPI Spec'}
                    </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-none shadow-lg">
                        <CardContent className="p-8">
                            {!showInstructions ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="apiSpec" className="block text-sm font-medium text-gray-700 mb-2">
                                            OpenAPI Specification (YAML or JSON)
                                        </label>
                                        <Textarea
                                            id="apiSpec"
                                            name="apiSpec"
                                            rows={15}
                                            className="w-full resize-none"
                                            placeholder="Paste your OpenAPI specification here..."
                                            value={apiSpec}
                                            onChange={(e) => setApiSpec(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex justify-center">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`bg-indigo-600 hover:bg-indigo-700 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                        >
                                            {isSubmitting ? 'Creating Chatbot...' : 'Create Chatbot'}
                                        </Button>
                                    </div>

                                    {submitResult && !submitResult.success && (
                                        <Alert variant="destructive">
                                            <AlertTitle>Error</AlertTitle>
                                            <AlertDescription>{submitResult.message}</AlertDescription>
                                        </Alert>
                                    )}
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <Alert className="bg-green-50 border-green-200">
                                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        <AlertTitle className="text-green-800">Success!</AlertTitle>
                                        <AlertDescription className="text-green-700">
                                            {submitResult?.message} Follow the instructions below to add the chatbot to your website.
                                        </AlertDescription>
                                    </Alert>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Installation Instructions</h3>
                                        <p className="text-gray-600 mb-4">
                                            Add this code at the bottom of your <code className="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono">&lt;body&gt;</code> tag in your HTML file:
                                        </p>

                                        <div className="relative">
                      <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
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
                      </pre>
                                            <Button
                                                id="copyBtn"
                                                onClick={copyToClipboard}
                                                variant="outline"
                                                className="absolute top-2 right-2"
                                                size="sm"
                                            >
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy Code
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex justify-center mt-8">
                                        <Button
                                            onClick={createNewChatbot}
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Create Another Chatbot
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}