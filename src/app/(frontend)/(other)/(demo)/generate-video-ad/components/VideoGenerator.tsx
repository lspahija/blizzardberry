'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/(frontend)/components/ui/card';
import { GeneratedVideo } from '../types';
import { generateVideoFromPrompt } from '../services/promptProcessor';

interface VideoGeneratorProps {
  onVideoGenerated: (video: GeneratedVideo) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

export function VideoGenerator({ onVideoGenerated, isGenerating, setIsGenerating }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const generatedVideo = await generateVideoFromPrompt(prompt);
      onVideoGenerated(generatedVideo);
    } catch (err) {
      setError('Failed to generate video. Please try again.');
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    "Create a demo for TechFlow, a SaaS analytics platform that helps businesses track customer engagement metrics and revenue growth in real-time",
    "Show off DataViz Pro, an enterprise dashboard tool that visualizes sales data, support tickets, and team performance for mid-size companies",
    "Demo CloudSync, a file storage solution that offers 99.9% uptime, automated backups, and team collaboration features for remote teams",
    "Present ShopAI, an e-commerce chatbot that increases conversions by 40% through personalized product recommendations and instant customer support"
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError('');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Describe Your Product or Service</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter a description of what you want to demo and our AI will automatically generate a video showcasing it
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Prompt *
          </label>
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setError('');
            }}
            placeholder="Describe your product, service, or what you want to showcase in the demo video..."
            className="w-full px-4 py-3 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50 min-h-[120px] resize-vertical"
            disabled={isGenerating}
          />
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Character Count */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{prompt.length} characters</span>
          <span>Recommended: 100-500 characters for best results</span>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full px-6 py-4 bg-brand hover:bg-brand/90 disabled:bg-brand/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-3 text-lg"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating Your Video...
            </>
          ) : (
            <>
              🎬 Generate Demo Video
            </>
          )}
        </button>

        {/* Example Prompts */}
        <div className="space-y-4">
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-foreground mb-4">Example Prompts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  disabled={isGenerating}
                  className="p-3 text-left text-sm bg-muted/50 hover:bg-muted/80 disabled:hover:bg-muted/50 border border-muted hover:border-brand/50 rounded-lg transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-foreground mb-2">How it works</h3>
          <ol className="text-sm text-muted-foreground space-y-1">
            <li>1. AI analyzes your prompt to understand your business</li>
            <li>2. Extracts key information (company name, features, metrics)</li>
            <li>3. Selects the best video template for your use case</li>
            <li>4. Generates scenes with your specific content</li>
            <li>5. Creates an interactive demo video with animations</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}