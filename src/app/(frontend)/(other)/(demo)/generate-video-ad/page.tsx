'use client';

import { useState } from 'react';
import { VideoGenerator } from './components/VideoGenerator';
import { VideoRenderer } from './components/VideoRenderer';
import { GeneratedVideo } from './types';

export default function GenerateVideoAdPage() {
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleVideoGenerated = (video: GeneratedVideo) => {
    setGeneratedVideo(video);
    setIsGenerating(false);
  };

  const handleNewVideo = () => {
    setGeneratedVideo(null);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-muted/30">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">
            Prompt-to-Video Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform any business idea into a compelling demo video. 
            Just describe what you want to showcase and our AI will generate the video automatically.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {!generatedVideo ? (
            <VideoGenerator 
              onVideoGenerated={handleVideoGenerated}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          ) : (
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex justify-between items-center p-4 bg-card rounded-xl border">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Generated Video</h3>
                  <p className="text-sm text-muted-foreground">
                    {generatedVideo.businessDomain.companyName} • {generatedVideo.template.name}
                  </p>
                </div>
                <button
                  onClick={handleNewVideo}
                  className="px-4 py-2 text-sm bg-brand hover:bg-brand/90 text-white rounded-lg transition-colors"
                >
                  Generate New Video
                </button>
              </div>

              {/* Video Player */}
              <VideoRenderer
                template={generatedVideo.template}
                businessDomain={generatedVideo.businessDomain}
                scenes={generatedVideo.scenes}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by BlizzardBerry's AI-driven prompt-to-video pipeline
          </p>
        </div>
      </div>
    </div>
  );
}