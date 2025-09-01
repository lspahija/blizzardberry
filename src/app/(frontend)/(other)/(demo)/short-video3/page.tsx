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

export default function MusicStreamRefundVideo() {
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

  const startDemo = () => {
    console.log('=== STARTING MUSICSTREAM DEMO ===');
    if (videoState.isRunning) return;
    
    clearAllTimers();
    setVideoState(prev => ({ ...prev, isRunning: true, currentPhase: 'intro' }));

    // Phase 1: Intro with typing text
    addTimeout(() => {
      console.log('=== INTRO PHASE ===');
      const typingContainer = document.getElementById('typingContainer');
      const cursor = document.getElementById('typingCursor');
      
      if (typingContainer && cursor) {
        cursor.style.display = 'inline-block';
        
        // Type intro text
        gsap.to(typingContainer, {
          duration: 2.5,
          text: "Need help with your MusicStream account?",
          ease: "none",
          onComplete: () => {
            cursor.style.display = 'none';
            
            addTimeout(() => {
              showChatInterface();
            }, 1500);
          }
        });
      }
    }, 1000);
  };

  const showChatInterface = () => {
    console.log('=== SHOWING CHAT INTERFACE ===');
    setVideoState(prev => ({ ...prev, currentPhase: 'chat' }));
    
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.style.display = 'block';
      
      gsap.fromTo(chatContainer, 
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
      
      // Start typing user message
      addTimeout(() => {
        startUserMessage();
      }, 800);
    }
  };

  const startUserMessage = () => {
    console.log('=== USER TYPING MESSAGE ===');
    const userInput = document.getElementById('userInput') as HTMLTextAreaElement;
    
    if (userInput) {
      // Show initial state
      const initialState = document.getElementById('initialState');
      if (initialState) {
        initialState.style.display = 'flex';
      }
      
      // Type user message
      typeText(userInput, "Hi, I'd like to request a refund for my last payment.", 60, () => {
        addTimeout(() => {
          // Transition to conversation view
          transitionToConversation();
        }, 1000);
      });
    }
  };

  const transitionToConversation = () => {
    console.log('=== TRANSITIONING TO CONVERSATION ===');
    
    const initialState = document.getElementById('initialState');
    const conversationState = document.getElementById('conversationState');
    
    if (initialState && conversationState) {
      // Hide initial state and show conversation
      gsap.to(initialState, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          initialState.style.display = 'none';
          conversationState.style.display = 'flex';
          
          gsap.fromTo(conversationState,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
          );
          
          // Add user message
          addUserMessageToChat("Hi, I'd like to request a refund for my last payment.");
          
          addTimeout(() => {
            showBotResponse();
          }, 1500);
        }
      });
    }
  };

  const addUserMessageToChat = (text: string) => {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'flex justify-end chat-message';
      messageDiv.innerHTML = `
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-3xl max-w-sm shadow-lg">
          <div class="text-base font-medium">${text}</div>
        </div>
      `;
      chatMessages.appendChild(messageDiv);
    }
  };

  const addBotMessageToChat = (text: string, isAgent = false) => {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'flex justify-start chat-message';
      
      const bgColor = isAgent ? 'bg-green-50 border border-green-200' : 'bg-muted';
      const agentInfo = isAgent ? `
        <div class="flex items-center mb-2">
          <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
            <span class="text-white text-xs font-bold">SA</span>
          </div>
          <div>
            <div class="text-sm font-semibold text-green-800">Agent Sarah</div>
            <div class="text-xs text-green-600">Billing Specialist</div>
          </div>
        </div>
      ` : '';
      
      messageDiv.innerHTML = `
        <div class="${bgColor} px-6 py-4 rounded-3xl max-w-md shadow-sm">
          ${agentInfo}
          <div class="text-base text-foreground leading-relaxed">${text}</div>
        </div>
      `;
      chatMessages.appendChild(messageDiv);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  };

  const showBotResponse = () => {
    console.log('=== SHOWING BOT RESPONSE ===');
    setVideoState(prev => ({ ...prev, currentPhase: 'processing' }));
    
    // Add bot response
    addBotMessageToChat("I'd be happy to help you with your refund request. This seems like a complex billing matter that requires human expertise. Let me connect you with our billing specialist who can review your account details and process your refund.");
    
    addTimeout(() => {
      // Connect to agent message
      addBotMessageToChat("🔄 Connecting you to Agent Sarah from our billing team...");
      
      addTimeout(() => {
        // Agent response
        setVideoState(prev => ({ ...prev, currentPhase: 'result' }));
        addBotMessageToChat("Hi! I've reviewed your account and I can see your premium subscription charge from last week. I can absolutely process that refund for you. It will be back in your account within 3-5 business days. Is there anything else I can help you with regarding your MusicStream account?", true);
        
        addTimeout(() => {
          showFinale();
        }, 4000);
      }, 2500);
    }, 3000);
  };

  const showFinale = () => {
    console.log('=== SHOWING FINALE ===');
    setVideoState(prev => ({ ...prev, currentPhase: 'finale' }));
    
    const chatContainer = document.getElementById('chatContainer');
    const finaleContainer = document.getElementById('finaleContainer');
    
    if (chatContainer && finaleContainer) {
      // Fade out chat
      gsap.to(chatContainer, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          chatContainer.style.display = 'none';
          finaleContainer.style.display = 'flex';
          
          // Show finale
          gsap.to(finaleContainer, {
            opacity: 1,
            duration: 0.8
          });
          
          // Animate logo
          const logo = document.getElementById('finaleLogo');
          if (logo) {
            gsap.to(logo, {
              opacity: 1,
              scale: 1,
              duration: 1,
              ease: "back.out(1.7)"
            });
          }
          
          // Animate brand text
          const brand = document.getElementById('finaleBrand');
          if (brand) {
            gsap.to(brand, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: 0.3,
              ease: "power2.out"
            });
          }
          
          // Complete
          addTimeout(() => {
            setVideoState(prev => ({ ...prev, currentPhase: 'complete', isRunning: false }));
          }, 3000);
        }
      });
    }
  };

  useEffect(() => {
    // Auto-start demo after component mount
    addTimeout(startDemo, 500);

    return () => {
      clearAllTimers();
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }
    };
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-background via-muted/10 to-muted/30 overflow-hidden relative">
      <style>{`
        @keyframes logoPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        @keyframes ringPulse {
          0%, 49% {
            transform: scale(1);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        
        .chat-message {
          animation: slideUpFadeIn 250ms ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        
        @keyframes slideUpFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typingCursor {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .typing-cursor {
          animation: typingCursor 1s infinite;
        }
      `}</style>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-40">
        <div 
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 ease-out" 
          style={{ 
            width: videoState.currentPhase === 'intro' ? '12%' : 
                   videoState.currentPhase === 'chat' ? '22%' :
                   videoState.currentPhase === 'processing' ? '31%' :
                   videoState.currentPhase === 'result' ? '88%' :
                   videoState.currentPhase === 'finale' ? '100%' : '0%'
          }}
        />
      </div>

      {/* Clean Intro Phase - White Background with MusicStream Colors */}
      <div 
        data-phase="intro"
        className={`fixed inset-0 bg-white flex flex-col items-center justify-center text-center px-8 transition-opacity duration-500 ${
          videoState.currentPhase === 'intro' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Main intro content */}
        <div className="mb-16">
          {/* MusicStream branding */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">♪</span>
            </div>
            <h1 className="text-2xl font-bold text-muted-foreground mb-2">MusicStream</h1>
            <div className="text-sm text-muted-foreground/70">Premium Music Service</div>
          </div>
          
          {/* Typing text */}
          <div className="text-4xl font-bold text-foreground mb-4 h-16 flex items-center justify-center">
            <span id="typingContainer"></span>
            
            {/* Animated cursor - hidden */}
            <span className="inline-block w-1 h-8 bg-purple-600 ml-1 typing-cursor align-middle" id="typingCursor" style={{ display: 'none' }}></span>
          </div>
        </div>
        
        {/* Subtle decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-600/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-pink-600/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-purple-600/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-pink-600/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Chat Interface - MusicStream Style */}
      <div 
        id="chatContainer"
        className={`fixed inset-0 bg-white transition-opacity duration-300 ${
          videoState.currentPhase === 'chat' || videoState.currentPhase === 'processing' || videoState.currentPhase === 'result' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ display: 'none' }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-[600px] h-[680px] bg-white flex flex-col transition-all duration-300 ease-out relative overflow-hidden">
            
            {/* Initial State: Centered Input */}
            <div id="initialState" className="flex-1 flex items-center justify-center px-6">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-white">♪</span>
                  </div>
                  <h2 className="text-3xl font-bold text-muted-foreground mb-2">
                    MusicStream<br/>Customer Support
                  </h2>
                </div>
                
                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative overflow-visible">
                    <textarea
                      id="userInput"
                      placeholder="Tell me what you need..."
                      className="w-full px-6 py-4 pr-16 text-base bg-muted rounded-2xl focus:outline-none transition-all duration-300 resize-none h-17 leading-normal"
                      spellCheck={false}
                      disabled
                    />
                    <button id="sendButton" className="group absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:scale-110 transition-all duration-300">
                      <div className="transform -rotate-12 group-hover:-rotate-6 transition-transform duration-300">
                        <svg width="20" height="20" fill="#a855f7" viewBox="0 0 24 24" className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation State: Messages */}
            <div id="conversationState" className="flex-1 flex items-center justify-center overflow-y-auto" style={{ display: 'none' }}>
              <div id="chatMessages" className="w-full max-w-2xl px-6 flex flex-col gap-4 py-8">
                {/* Messages will be dynamically added here */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 4: Brand Finale - BlizzardBerry Style */}
      <div
        id="finaleContainer"
        className={`fixed inset-0 opacity-0 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
          videoState.currentPhase === 'finale' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ display: 'none' }}
      >
        {/* Logo with modern styling */}
        <div id="finaleLogo" className="relative z-10 mb-8 opacity-0">
          <div className="relative">
            <div
              className="w-48 h-48 bg-white rounded-3xl flex items-center justify-center"
              style={{ animation: 'logoPulse 3s infinite' }}
            >
              <Image
                src="/image/logo.png"
                alt="BlizzardBerry Logo"
                width={120}
                height={120}
                priority
                unoptimized
              />
            </div>
            
            {/* Pulse ring effects */}
            <div className="absolute inset-0 w-48 h-48 border-2 border-purple-600/40 rounded-3xl" style={{ animation: 'ringPulse 3s infinite ease-out' }}></div>
          </div>
        </div>

        {/* Brand text with modern styling */}
        <div id="finaleBrand" className="text-center mb-8 opacity-0">
          <h1 className="text-7xl font-bold text-foreground mb-8 tracking-tight">
            BlizzardBerry
          </h1>
          <div className="h-2 w-48 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mb-9"></div>
          
          <p className="text-2xl text-muted-foreground mb-4 tracking-wide">
            AI Agents That Get Things Done
          </p>
          
          <p className="text-lg text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
            Transform user interaction from search to action.
          </p>
        </div>
      </div>
    </div>
  );
}