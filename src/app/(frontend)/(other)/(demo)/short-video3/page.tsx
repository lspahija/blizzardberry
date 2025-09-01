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

export default function MusicAppRefundVideo() {
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

  const addUserMessage = (text: string) => {
    const messagesContainer = document.querySelector('.chat-messages-area');
    if (messagesContainer) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'flex justify-end mb-3';
      messageDiv.innerHTML = `
        <div class="bg-blue-600 text-white rounded-lg p-3 max-w-[80%] shadow-lg">
          <p class="text-sm">${text}</p>
        </div>
      `;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  const addBotMessage = (text: string) => {
    const messagesContainer = document.querySelector('.chat-messages-area');
    if (messagesContainer) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'flex justify-start mb-3';
      messageDiv.innerHTML = `
        <div class="bg-gray-100 rounded-lg p-3 max-w-[80%] shadow-sm">
          <p class="text-sm text-gray-800">${text}</p>
        </div>
      `;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
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
        typeText(input, "Hi, I'd like to request a refund for my last payment.", 30, () => {
          // Simulate sending message and show user message in chat
          addTimeout(() => {
            if (input) input.value = '';
            addUserMessage("Hi, I'd like to request a refund for my last payment.");
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
      // Hide typing indicator and add bot response
      gsap.to('[data-animate="typing-indicator"]', { opacity: 0, duration: 0.3 });
      
      addBotMessage("I'd be happy to help you with your refund request. This seems like a complex billing matter that requires human expertise. Let me connect you with our billing specialist who can review your account details and process your refund.");

      setVideoState(prev => ({ ...prev, currentPhase: 'result' }));
      
      // Show connecting to agent message
      addTimeout(() => {
        addBotMessage("🔄 Connecting you to Agent Sarah from our billing team...");
        
        // Show human agent response
        addTimeout(() => {
          addAgentMessage();
        }, 2000);
        
        // Show finale
        addTimeout(() => {
          showFinale();
        }, 6000);
      }, 2000);
    }, 2500);
  };

  const addAgentMessage = () => {
    const messagesContainer = document.querySelector('.chat-messages-area');
    if (messagesContainer) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'flex justify-start mb-3';
      messageDiv.innerHTML = `
        <div class="bg-green-50 border border-green-200 rounded-lg p-3 max-w-[80%] shadow-sm">
          <div class="flex items-center mb-2">
            <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
              <span class="text-white text-xs font-semibold">SA</span>
            </div>
            <div>
              <p class="text-sm font-semibold text-green-800">Agent Sarah</p>
              <p class="text-xs text-green-600">Billing Specialist</p>
            </div>
          </div>
          <p class="text-sm text-gray-800">Hi! I've reviewed your account and I can see your premium subscription charge from last week. I can absolutely process that refund for you. It will be back in your account within 3-5 business days. Is there anything else I can help you with regarding your MusicStream account?</p>
        </div>
      `;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // Animate the agent message entrance
      gsap.fromTo(messageDiv, 
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
      );
    }
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
          
          {/* MusicStream App Interface */}
          <div 
            data-animate="app-interface" 
            className="absolute inset-0 opacity-0"
            style={{ transform: 'translateY(20px) scale(0.9)' }}
          >
            {/* App header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">♪</span>
                </div>
                <span className="font-semibold">MusicStream</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Premium</span>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Main music app content */}
            <div className="p-8 h-full bg-gradient-to-br from-purple-50 to-pink-50">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Music Library</h1>
              <p className="text-gray-600 mb-8">Premium subscription - Unlimited streaming</p>
              
              {/* Mock music content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">♪</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Recently Played</h3>
                      <p className="text-gray-600">Your latest tracks</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">★</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Your Playlists</h3>
                      <p className="text-gray-600">47 curated playlists</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface - Full Center Focus */}
          <div 
            data-animate="chat-container" 
            className="absolute inset-4 bg-white rounded-2xl shadow-2xl opacity-0 flex flex-col"
            style={{ transform: 'translateY(20px) scale(0.9)' }}
            id="chatContainer"
          >
            {/* Chat header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">♪</span>
                </div>
                <div>
                  <span className="font-semibold">MusicStream Support</span>
                  <div className="text-xs opacity-80">AI-Powered Customer Service</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs">Online</span>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 p-6 overflow-y-auto chat-messages-area">
              <div className="text-center text-gray-500 text-sm mb-4 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Welcome to MusicStream Support</span>
                <div className="text-xs mt-1">We're here to help with your premium subscription</div>
              </div>

              {/* Initial bot message */}
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg p-4 max-w-[80%] shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">MusicStream Assistant</span>
                  </div>
                  <p className="text-sm text-gray-800">Hi! I'm here to help you with any questions about your MusicStream account. How can I assist you today?</p>
                </div>
              </div>

              {/* Typing indicator */}
              <div data-animate="typing-indicator" className="opacity-0 flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg p-4 max-w-[80%] shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI is typing...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat input */}
            <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
              <div className="flex space-x-3">
                <input
                  data-input="user-message"
                  type="text"
                  placeholder="Type your message here..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm"
                  readOnly
                />
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-medium shadow-lg transition-all">
                  Send
                </button>
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