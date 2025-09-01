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

  const typeTextWithScroll = (element: HTMLTextAreaElement | null, text: string, speed = 50, callback?: () => void) => {
    if (!element) return;
    element.value = '';
    let i = 0;
    let hasScrolled = false;
    
    const type = () => {
      if (i < text.length) {
        element.value += text.charAt(i);
        
        // When we hit the first line break, scroll the text up slightly
        if (text.charAt(i) === '\n' && !hasScrolled) {
          hasScrolled = true;
          // Animate the textarea content to scroll up
          gsap.to(element, {
            scrollTop: 8, // Small scroll to move first line up slightly
            duration: 0.3,
            ease: "power2.out"
          });
        }
        
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
    setVideoState(prev => ({ ...prev, isRunning: true, currentPhase: 'chat' }));

    // Show chat interface immediately
    showChatInterface();
  };

  const showChatInterface = () => {
    console.log('=== SHOWING CHAT INTERFACE ===');
    
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.style.display = 'block';
      chatContainer.style.opacity = '1';
      
      // Start typing user message immediately
      addTimeout(() => {
        startUserMessage();
      }, 500);
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
      userInput.disabled = false;
      userInput.focus();
      typeTextWithScroll(userInput, "Hi, I'd like to extend my premium\nsubscription for another month.", 60, () => {
        // Show airplane animation and send with natural pause
        addTimeout(() => {
          triggerAirplane();
        }, 800);
      });
    }
  };

  const triggerAirplane = () => {
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
      // Airplane animation like in demo-niko
      gsap.to(sendButton, {
        x: 300,
        y: -15,
        rotation: -6,
        scale: 1.1,
        duration: 0.4, // Slightly slower airplane
        ease: "power1.out",
        onComplete: () => {
          console.log('Airplane animation complete, transitioning to processing');
          transitionToConversation();
        }
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
          addUserMessageToChat("Hi, I'd like to extend my premium subscription for another month.");
          
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
        <div class="bg-brand text-primary-foreground px-6 py-4 rounded-3xl max-w-sm shadow-lg">
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

  const addProcessingBubble = () => {
    addBotMessageToChat(`
      <div class="flex items-center space-x-3">
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-brand/60 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-brand/60 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-brand/60 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
        <div class="text-base text-muted-foreground">Analyzing subscription...</div>
      </div>
    `);

    // Store reference for later removal
    const allMessages = document.querySelectorAll('.chat-message');
    const processingBubble = allMessages[allMessages.length - 1];
    if (processingBubble) {
      processingBubble.id = 'processingBubble';
    }
  };

  const showBotResponse = () => {
    console.log('=== SHOWING BOT RESPONSE ===');
    setVideoState(prev => ({ ...prev, currentPhase: 'processing' }));
    
    // Add processing bubble directly
    addProcessingBubble();
    
    addTimeout(() => {
      // Start subscription analysis
      showSubscriptionAnalysis();
    }, 2000);
  };

  const animateFinaleElements = () => {
    // Scene 4: Brand Finale - Sequential animation with proper timing (from demo-video)
    const finaleLogo = document.getElementById('finaleLogo');
    const finaleBrand = document.getElementById('finaleBrand');
    const finaleTagline = document.getElementById('finaleTagline');

    // Ensure all elements start hidden
    if (finaleLogo) gsap.set(finaleLogo, { scale: 0, opacity: 0 });
    if (finaleBrand) gsap.set(finaleBrand, { y: 50, opacity: 0 });
    if (finaleTagline) gsap.set(finaleTagline, { y: 30, opacity: 0 });

    // 1. Logo appears first (reduced delay)
    addTimeout(() => {
      console.log('=== SCENE 4: Showing logo ===');
      if (finaleLogo) {
        gsap.to(finaleLogo, {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: 'elastic.out(1, 0.3)',
        });
      }
    }, 300);

    // 2. Brand text appears (faster)
    addTimeout(() => {
      console.log('=== SCENE 4: Showing brand text ===');
      if (finaleBrand) {
        gsap.to(finaleBrand, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        });
      }
    }, 1800);

    // 3. Tagline appears (faster)
    addTimeout(() => {
      console.log('=== SCENE 4: Showing tagline ===');
      if (finaleTagline) {
        gsap.to(finaleTagline, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        });
      }
    }, 2800);

    // Complete
    addTimeout(() => {
      setVideoState(prev => ({ ...prev, currentPhase: 'complete', isRunning: false }));
    }, 4000);
  };

  const showSubscriptionAnalysis = () => {
    console.log('=== STARTING SUBSCRIPTION ANALYSIS ===');
    const processingBubble = document.getElementById('processingBubble');
    const chatContainer = document.getElementById('chatContainer');
    
    // Create analysis overlay
    const analysisOverlay = document.createElement('div');
    analysisOverlay.id = 'subscriptionAnalysis';
    analysisOverlay.className = 'fixed inset-0 bg-white flex flex-col items-center justify-center z-50';
    analysisOverlay.style.opacity = '0';
    
    analysisOverlay.innerHTML = `
      <div class="w-[500px] bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 transform scale-95">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl text-white">♪</span>
          </div>
          <h3 class="text-2xl font-bold text-foreground mb-2">MusicStream Premium</h3>
          <p class="text-muted-foreground">Current Subscription Status</p>
        </div>
        
        <div class="space-y-4 mb-6">
          <div class="flex justify-between items-center py-3 px-4 bg-muted/50 rounded-xl">
            <span class="text-muted-foreground">Account Holder</span>
            <span class="font-semibold text-foreground">Sarah Johnson</span>
          </div>
          <div class="flex justify-between items-center py-3 px-4 bg-muted/50 rounded-xl">
            <span class="text-muted-foreground">Plan Type</span>
            <span class="font-semibold text-foreground">Premium Monthly</span>
          </div>
          <div class="flex justify-between items-center py-3 px-4 bg-muted/50 rounded-xl">
            <span class="text-muted-foreground">Current Period</span>
            <span class="font-semibold text-foreground">Feb 15 - Mar 15, 2024</span>
          </div>
          <div class="flex justify-between items-center py-3 px-4 bg-orange-50 border border-orange-200 rounded-xl">
            <span class="text-orange-700">Status</span>
            <span class="font-semibold text-orange-800">Expires in 2 days</span>
          </div>
        </div>
        
        <button id="extendButton" class="w-full bg-brand text-primary-foreground py-4 rounded-xl font-semibold text-lg hover:scale-[1.02] transition-transform">
          Extend for Another Month
        </button>
      </div>
    `;
    
    document.body.appendChild(analysisOverlay);
    
    // Animate overlay in
    gsap.to(analysisOverlay, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out"
    });
    
    const card = analysisOverlay.querySelector('.w-\\[500px\\]');
    if (card) {
      gsap.to(card, {
        scale: 1,
        duration: 0.6,
        delay: 0.1,
        ease: "back.out(1.7)"
      });
    }
    
    // Handle extend button click
    const extendButton = document.getElementById('extendButton');
    if (extendButton) {
      addTimeout(() => {
        extendButton.click();
      }, 3000); // Auto-click after 3 seconds
      
      extendButton.addEventListener('click', () => {
        handleSubscriptionExtension(analysisOverlay);
      });
    }
  };
  
  const handleSubscriptionExtension = (analysisOverlay: HTMLElement) => {
    const extendButton = document.getElementById('extendButton');
    if (extendButton) {
      // Button click animation
      gsap.to(extendButton, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
      
      // Update button text
      extendButton.textContent = 'Processing...';
      extendButton.disabled = true;
      
      addTimeout(() => {
        // Show success state
        extendButton.textContent = '✓ Extended Successfully!';
        extendButton.className = 'w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg';
        
        addTimeout(() => {
          // Animate overlay out
          gsap.to(analysisOverlay, {
            opacity: 0,
            scale: 0.95,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
              document.body.removeChild(analysisOverlay);
              returnToChatWithSuccess();
            }
          });
        }, 1500);
      }, 1000);
    }
  };
  
  const returnToChatWithSuccess = () => {
    // Remove processing bubble
    const processingBubble = document.getElementById('processingBubble');
    if (processingBubble) {
      processingBubble.remove();
    }
    
    // Add success message
    setVideoState(prev => ({ ...prev, currentPhase: 'result' }));
    addBotMessageToChat("Perfect! I've successfully extended Sarah's premium subscription for another month until April 15th, 2024. Your premium features will continue uninterrupted. Enjoy your music!");
    
    addTimeout(() => {
      showFinale();
    }, 4000);
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
          
          animateFinaleElements();
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
          className="h-full bg-gradient-to-r from-brand to-secondary transition-all duration-300 ease-out" 
          style={{ 
            width: videoState.currentPhase === 'chat' ? '22%' :
                   videoState.currentPhase === 'processing' ? '31%' :
                   videoState.currentPhase === 'result' ? '88%' :
                   videoState.currentPhase === 'finale' ? '100%' : '22%'
          }}
        />
      </div>

      {/* Chat Interface - MusicStream Style */}
      <div 
        id="chatContainer"
        className="fixed inset-0 bg-white"
        style={{ display: 'none' }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-[600px] h-[680px] bg-white flex flex-col transition-all duration-300 ease-out relative overflow-hidden">
            
            {/* Initial State: Centered Input */}
            <div id="initialState" className="flex-1 flex items-center justify-center px-6">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
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
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300 text-brand">
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
            <div className="absolute inset-0 w-48 h-48 border-2 border-brand/40 rounded-3xl" style={{ animation: 'ringPulse 3s infinite ease-out' }}></div>
          </div>
        </div>

        {/* Brand text with modern styling */}
        <div id="finaleBrand" className="text-center mb-8 opacity-0">
          <h1 className="text-7xl font-bold text-foreground mb-8 tracking-tight">
            BlizzardBerry
          </h1>
          <div className="h-2 w-48 bg-gradient-to-r from-[#F43F5E] to-[#1D4ED8] rounded-full mx-auto mb-9"></div>
          <div
            id="finaleTagline"
            className="text-xl text-muted-foreground font-normal opacity-0 tracking-wide"
          >
            An AI-powered natural language interface for every web app
          </div>
        </div>
      </div>
    </div>
  );
}