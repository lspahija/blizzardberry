"use client";

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import Image from 'next/image';

gsap.registerPlugin(TextPlugin);

interface VideoState {
  isRunning: boolean;
  currentPhase: 'intro' | 'chat' | 'processing' | 'result' | 'finale' | 'complete';
}

export default function ShortVideo3() {
  const [videoState, setVideoState] = useState<VideoState>({
    isRunning: false,
    currentPhase: 'intro'
  });

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const addTimeout = (fn: () => void, delay: number) => {
    const timeout = setTimeout(fn, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  const clearAllTimers = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  const typeText = (element: HTMLInputElement | HTMLTextAreaElement | null, text: string, speed = 50, callback?: () => void) => {
    if (!element) return;
    element.value = '';
    let i = 0;
    const type = () => {
      if (i < text.length) {
        element.value += text.charAt(i);
        i++;
        addTimeout(type, speed);
      } else if (callback) {
        callback();
      }
    };
    type();
  };

  const startVideo = () => {
    if (videoState.isRunning) return;
    
    clearAllTimers();
    setVideoState(prev => ({ ...prev, isRunning: true, currentPhase: 'intro' }));

    // Reset all elements to initial state
    const allElements = document.querySelectorAll('[data-animate]');
    allElements.forEach(el => {
      gsap.set(el, { opacity: 0, y: 20, scale: 0.9 });
    });

    // Start the video sequence
    runVideoSequence();
  };

  const runVideoSequence = () => {
    // Phase 1: Show app interface
    setVideoState(prev => ({ ...prev, currentPhase: 'intro' }));
    
    addTimeout(() => {
      gsap.to('[data-animate="app-interface"]', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power2.out"
      });
    }, 500);

    // Phase 2: Start chat interaction
    addTimeout(() => {
      setVideoState(prev => ({ ...prev, currentPhase: 'chat' }));
      
      gsap.to('[data-animate="chat-container"]', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out"
      });

      // Type user message
      addTimeout(() => {
        const input = document.querySelector('[data-input="user-message"]') as HTMLInputElement;
        typeText(input, "Hello! I need help with something", 30, () => {
          // Simulate sending message
          addTimeout(() => {
            if (input) input.value = '';
            showBotResponse();
          }, 800);
        });
      }, 1000);
    }, 2000);
  };

  const showBotResponse = () => {
    setVideoState(prev => ({ ...prev, currentPhase: 'processing' }));

    // Show typing indicator
    gsap.to('[data-animate="typing-indicator"]', {
      opacity: 1,
      duration: 0.3
    });

    addTimeout(() => {
      // Hide typing indicator and show response
      gsap.to('[data-animate="typing-indicator"]', { opacity: 0, duration: 0.3 });
      
      gsap.to('[data-animate="bot-response"]', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      });

      setVideoState(prev => ({ ...prev, currentPhase: 'result' }));
      
      // Show result/action
      addTimeout(() => {
        gsap.to('[data-animate="action-result"]', {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out"
        });

        // Show finale
        addTimeout(() => {
          showFinale();
        }, 3000);
      }, 2000);
    }, 2500);
  };

  const showFinale = () => {
    setVideoState(prev => ({ ...prev, currentPhase: 'finale' }));

    // Fade out chat interface
    gsap.to('[data-animate="app-interface"], [data-animate="chat-container"]', {
      opacity: 0.3,
      scale: 0.95,
      duration: 0.8
    });

    // Show BlizzardBerry logo and branding
    addTimeout(() => {
      gsap.to('[data-animate="finale-logo"]', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "back.out(1.7)"
      });

      gsap.to('[data-animate="finale-text"]', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out"
      });

      // Complete the video
      addTimeout(() => {
        setVideoState(prev => ({ ...prev, currentPhase: 'complete', isRunning: false }));
      }, 3000);
    }, 1000);
  };

  const resetVideo = () => {
    clearAllTimers();
    if (masterTimelineRef.current) {
      masterTimelineRef.current.kill();
    }

    setVideoState({
      isRunning: false,
      currentPhase: 'intro'
    });

    // Reset all animations
    const allElements = document.querySelectorAll('[data-animate]');
    allElements.forEach(el => {
      gsap.set(el, { clearProps: "all" });
    });

    // Clear input fields
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        input.value = '';
      }
    });
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {/* Video Container */}
      <div className="relative w-full max-w-4xl mx-auto">
        
        {/* Control Panel */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <button
            onClick={startVideo}
            disabled={videoState.isRunning}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {videoState.isRunning ? 'Playing...' : 'Start Video'}
          </button>
          <button
            onClick={resetVideo}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-all"
          >
            Reset
          </button>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/80 text-white text-sm rounded-full">
          Phase: {videoState.currentPhase}
        </div>

        {/* Main Video Content */}
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
          
          {/* App Interface */}
          <div 
            data-animate="app-interface" 
            className="absolute inset-0 opacity-0"
            style={{ transform: 'translateY(20px) scale(0.9)' }}
          >
            {/* Mock app header */}
            <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">A</span>
                </div>
                <span className="font-semibold">My Application</span>
              </div>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            {/* Main app content */}
            <div className="p-8 h-full bg-gradient-to-br from-blue-50 to-indigo-100">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Your Dashboard</h1>
              <p className="text-gray-600 mb-8">Manage your account and get things done.</p>
              
              {/* Mock content cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-2">Quick Actions</h3>
                  <p className="text-gray-600">Access commonly used features</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-2">Recent Activity</h3>
                  <p className="text-gray-600">See what's been happening</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div 
            data-animate="chat-container" 
            className="absolute bottom-4 right-4 w-80 h-96 bg-white rounded-xl shadow-2xl opacity-0 flex flex-col"
            style={{ transform: 'translateY(20px) scale(0.9)' }}
          >
            {/* Chat header */}
            <div className="bg-blue-600 text-white p-3 rounded-t-xl flex items-center justify-between">
              <span className="font-semibold">AI Assistant</span>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              <div className="text-center text-gray-500 text-sm">
                Chat started
              </div>

              {/* Bot response (initially hidden) */}
              <div data-animate="bot-response" className="opacity-0" style={{ transform: 'translateY(20px)' }}>
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm">Hi! I'm your AI assistant. How can I help you today?</p>
                </div>
              </div>

              {/* Typing indicator */}
              <div data-animate="typing-indicator" className="opacity-0">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat input */}
            <div className="p-3 border-t">
              <div className="flex space-x-2">
                <input
                  data-input="user-message"
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  readOnly
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Action Result (e.g., success message, data display) */}
          <div 
            data-animate="action-result"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-100 border-l-4 border-green-500 p-6 rounded-lg shadow-lg opacity-0"
            style={{ transform: 'translateY(20px) scale(0.9) translateX(-50%) translateY(-50%)' }}
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Task Completed!</h3>
                <p className="text-green-700">Your request has been processed successfully.</p>
              </div>
            </div>
          </div>

          {/* Finale - Logo and Branding */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/95">
            <div className="text-center">
              {/* Logo */}
              <div 
                data-animate="finale-logo"
                className="opacity-0"
                style={{ transform: 'translateY(20px) scale(0.9)' }}
              >
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-4xl font-bold text-white">BB</span>
                </div>
              </div>

              {/* Text */}
              <div 
                data-animate="finale-text"
                className="opacity-0"
                style={{ transform: 'translateY(20px)' }}
              >
                <h1 className="text-4xl font-bold text-gray-800 mb-2">BlizzardBerry</h1>
                <p className="text-xl text-gray-600 mb-4">AI Agents That Get Things Done</p>
                <p className="text-gray-500">Transform user interaction from search to action.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: videoState.currentPhase === 'intro' ? '20%' :
                     videoState.currentPhase === 'chat' ? '40%' :
                     videoState.currentPhase === 'processing' ? '60%' :
                     videoState.currentPhase === 'result' ? '80%' :
                     videoState.currentPhase === 'finale' ? '90%' :
                     videoState.currentPhase === 'complete' ? '100%' : '0%'
            }}
          />
        </div>
      </div>
    </div>
  );
}