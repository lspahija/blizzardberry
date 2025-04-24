"use client";

import React, { useState } from 'react';

export default function AdminPage() {
    const [apiSpec, setApiSpec] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{success: boolean, message: string} | null>(null);

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

            const data = await response.json();

            if (response.ok) {
                setSubmitResult({
                    success: true,
                    message: 'Chatbot created successfully!'
                });
                // Optionally clear the text area after successful submission
                // setApiSpec('');
            } else {
                setSubmitResult({
                    success: false,
                    message: data.message || 'Failed to create chatbot'
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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Admin</h1>
                    <p className="mt-2 text-lg text-gray-600">Create a chatbot from an OpenAPI spec</p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
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
                    </form>

                    {submitResult && (
                        <div className={`mt-6 p-4 rounded-md ${submitResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <p className="text-sm font-medium">{submitResult.message}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}