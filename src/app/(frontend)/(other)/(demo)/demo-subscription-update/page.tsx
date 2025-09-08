'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import Image from 'next/image';

gsap.registerPlugin(TextPlugin);

interface VideoState {
  isRunning: boolean;
  currentPhase: 'chat' | 'processing' | 'result' | 'finale' | 'complete';
}

export default function MusicStreamRefundVideo() {
  const [videoState, setVideoState] = useState<VideoState>({
    isRunning: false,
    currentPhase: 'chat',
  });

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const addTimeout = (fn: () => void, delay: number) => {
    const timeout = setTimeout(fn, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  const clearAllTimers = () => {
    if (timeoutsRef.current && Array.isArray(timeoutsRef.current)) {
      timeoutsRef.current.forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
      timeoutsRef.current = [];
    }
  };

  const typeTextWithScroll = (
    element: HTMLTextAreaElement | null,
    text: string,
    speed = 50,
    callback?: () => void
  ) => {
    if (!element) return;
    element.value = '';
    element.style.height = '60px'; // Reset to minimum height
    let i = 0;

    const type = () => {
      if (i < text.length) {
        element.value += text.charAt(i);

        // Auto-expand textarea as text is typed
        element.style.height = '60px'; // Reset to minimum
        element.style.height = Math.min(element.scrollHeight, 120) + 'px'; // Expand smoothly

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
    setVideoState((prev) => ({
      ...prev,
      isRunning: true,
      currentPhase: 'chat',
    }));

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
    const userInput = document.getElementById(
      'userInput'
    ) as HTMLTextAreaElement;

    if (userInput) {
      // Show initial state
      const initialState = document.getElementById('initialState');
      if (initialState) {
        initialState.style.display = 'flex';
      }

      // Type user message
      userInput.disabled = false;
      userInput.focus();
      typeTextWithScroll(
        userInput,
        "I'd like to upgrade to the premium plan",
        60,
        () => {
          // Show airplane animation and send with natural pause
          addTimeout(() => {
            triggerAirplane();
          }, 800);
        }
      );
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
        ease: 'power1.out',
        onComplete: () => {
          console.log(
            'Airplane animation complete, transitioning to processing'
          );
          transitionToConversation();
        },
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

          gsap.fromTo(
            conversationState,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
          );

          // Add user message
          addUserMessageToChat("I'd like to upgrade to the premium plan");

          addTimeout(() => {
            showBotResponse();
          }, 1500);
        },
      });
    }
  };

  const addUserMessageToChat = (text: string) => {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'flex justify-end chat-message';
      messageDiv.innerHTML = `
        <div class="bg-cyan-500/15 px-6 py-4 rounded-3xl max-w-sm shadow-lg">
          <div class="text-base leading-relaxed text-cyan-800 dark:text-cyan-200">${text}</div>
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

      const bgColor = isAgent
        ? 'bg-cyan-50 border border-cyan-200'
        : 'bg-muted';
      const agentInfo = isAgent
        ? `
        <div class="flex items-center mb-2">
          <div class="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center mr-3">
            <span class="text-white text-xs font-bold">SA</span>
          </div>
          <div>
            <div class="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Agent Sarah</div>
            <div class="text-xs text-cyan-600 dark:text-cyan-400">Billing Specialist</div>
          </div>
        </div>
      `
        : '';

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
          <div class="w-2 h-2 bg-cyan-500/15 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-cyan-500/15 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-cyan-500/15 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
        <div class="text-base text-muted-foreground">Checking plan options...</div>
      </div>
    `);

    // Store reference for later removal
    addTimeout(() => {
      try {
        const allMessages = document.querySelectorAll('.chat-message');
        if (allMessages && allMessages.length > 0) {
          const processingBubble = allMessages[allMessages.length - 1];
          if (
            processingBubble &&
            processingBubble.nodeType === Node.ELEMENT_NODE
          ) {
            processingBubble.id = 'processingBubble';
          }
        }
      } catch (error) {
        console.warn('Error setting processing bubble ID:', error);
      }
    }, 100);
  };

  const showBotResponse = () => {
    console.log('=== SHOWING BOT RESPONSE ===');
    setVideoState((prev) => ({ ...prev, currentPhase: 'processing' }));

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
      setVideoState((prev) => ({
        ...prev,
        currentPhase: 'complete',
        isRunning: false,
      }));

      // Auto-restart after completion
      addTimeout(() => {
        // Reset all UI elements
        const chatMessages = document.getElementById('chatMessages');
        const analysisOverlay = document.getElementById('subscriptionAnalysis');
        const finaleContainer = document.getElementById('finaleContainer');

        if (chatMessages) chatMessages.innerHTML = '';
        if (analysisOverlay) analysisOverlay.remove();
        if (finaleContainer) finaleContainer.style.display = 'none';

        // Restart demo
        startDemo();
      }, 2000);
    }, 4000);
  };

  const showSubscriptionAnalysis = () => {
    console.log('=== STARTING SUBSCRIPTION ANALYSIS ===');
    const processingBubble = document.getElementById('processingBubble');
    const chatContainer = document.getElementById('chatContainer');

    // Create cinematic transition timeline
    const tl = gsap.timeline();

    // Step 1: Elegant chat container zoom out and fade
    tl.to(chatContainer, {
      scale: 0.9,
      opacity: 0.3,
      filter: 'blur(8px)',
      duration: 0.8,
      ease: 'power2.out',
    });

    // Create analysis overlay
    const analysisOverlay = document.createElement('div');
    analysisOverlay.id = 'subscriptionAnalysis';
    analysisOverlay.className =
      'fixed inset-0 bg-gradient-to-br from-white via-gray-50/80 to-white flex flex-col items-center justify-center z-50';
    analysisOverlay.style.opacity = '0';

    analysisOverlay.innerHTML = `
      <div class="w-[340px] bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center">
          <div id="planDisplay" class="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-1000">
            <span id="planText" class="text-lg font-semibold text-gray-700">Basic</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div id="loadingBar" class="bg-cyan-500 h-2 rounded-full transition-all duration-2000 ease-out" style="width: 0%"></div>
          </div>
          <p class="text-gray-600">Upgrading to Premium</p>
        </div>
      </div>
    `;

    document.body.appendChild(analysisOverlay);

    // Step 2: Dramatic overlay entrance
    tl.to(
      analysisOverlay,
      {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      },
      '-=0.4'
    );

    // Step 3: Card dramatic entrance
    const card = analysisOverlay?.querySelector?.('.w-\\[500px\\]');
    if (card && card.nodeType === Node.ELEMENT_NODE) {
      gsap.set(card, { scale: 0.7, rotationY: 15, opacity: 0 });

      tl.to(
        card,
        {
          scale: 1,
          rotationY: 0,
          opacity: 1,
          duration: 1,
          ease: 'elastic.out(1, 0.6)',
        },
        '-=0.2'
      );

      // Step 4: Sequential info card animations
      try {
        const infoCards = card.querySelectorAll('.space-y-4 > div');
        if (infoCards && infoCards.length > 0) {
          Array.from(infoCards).forEach((infoCard, i) => {
            if (infoCard && infoCard.nodeType === Node.ELEMENT_NODE) {
              gsap.set(infoCard, { x: 50, opacity: 0 });
              tl.to(
                infoCard,
                {
                  x: 0,
                  opacity: 1,
                  duration: 0.5,
                  ease: 'power2.out',
                },
                `-=${0.8 - i * 0.1}`
              );
            }
          });
        }
      } catch (error) {
        console.warn('Error animating info cards:', error);
      }

      // Step 5: Button dramatic entrance
      const button = card.querySelector('#extendButton');
      if (button && button.nodeType === Node.ELEMENT_NODE) {
        gsap.set(button, { y: 30, opacity: 0, scale: 0.9 });
        tl.to(
          button,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'back.out(1.7)',
          },
          '-=0.3'
        );
      }
    }

    // Start loading bar animation
    addTimeout(() => {
      const loadingBar = document.getElementById('loadingBar');
      if (loadingBar) {
        loadingBar.style.width = '100%';
      }
    }, 600);

    // Upgrade the plan display
    addTimeout(() => {
      const planDisplay = document.getElementById('planDisplay');
      const planText = document.getElementById('planText');

      if (planDisplay && planText) {
        planDisplay.style.backgroundColor = '#0891b2';
        planText.style.color = 'white';
        planText.textContent = 'Premium';
      }
    }, 1800);

    // Auto-close overlay after animation completes
    addTimeout(() => {
      // Professional exit sequence
      const exitTl = gsap.timeline();

      // Step 1: Card transforms and exits
      const card = analysisOverlay?.querySelector?.('.w-\\[500px\\]');
      if (card) {
        exitTl.to(card, {
          scale: 0.85,
          rotationY: -15,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.in',
        });
      }

      // Step 2: Overlay fades with blur effect
      exitTl.to(
        analysisOverlay,
        {
          opacity: 0,
          filter: 'blur(10px)',
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            document.body.removeChild(analysisOverlay);
            returnToChatWithSuccess();
          },
        },
        '-=0.3'
      );
    }, 3500); // 3.5 seconds display time
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
        ease: 'power2.inOut',
      });

      // Update button text
      extendButton.textContent = 'Processing...';
      extendButton.disabled = true;

      addTimeout(() => {
        // Update plan information dynamically
        const planTypeElement = analysisOverlay?.querySelector?.(
          '.space-y-4 > div:nth-child(2) span:last-child'
        );
        const featuresElement = analysisOverlay?.querySelector?.(
          '.space-y-4 > div:nth-child(3) span:last-child'
        );

        if (planTypeElement) {
          planTypeElement.textContent = 'Premium Plan';
        }
        if (featuresElement) {
          featuresElement.textContent = 'Full Access';
        }

        // Show success state with timestamp
        const now = new Date();
        const timestamp = now.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        extendButton.innerHTML = `Upgraded Successfully!<br><small style="font-size: 14px; opacity: 0.9;">${timestamp}</small>`;
        extendButton.className =
          'w-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-200 py-4 rounded-xl font-semibold text-lg';

        addTimeout(() => {
          // Professional exit sequence
          const exitTl = gsap.timeline();

          // Step 1: Card transforms and exits
          const card = analysisOverlay?.querySelector?.('.w-\\[500px\\]');
          if (card) {
            exitTl.to(card, {
              scale: 0.85,
              rotationY: -15,
              opacity: 0,
              duration: 0.8,
              ease: 'power2.in',
            });
          }

          // Step 2: Overlay fades with blur effect
          exitTl.to(
            analysisOverlay,
            {
              opacity: 0,
              filter: 'blur(10px)',
              duration: 0.5,
              ease: 'power2.in',
              onComplete: () => {
                document.body.removeChild(analysisOverlay);
                returnToChatWithSuccess();
              },
            },
            '-=0.3'
          );
        }, 1500);
      }, 1000);
    }
  };

  const returnToChatWithSuccess = () => {
    const chatContainer = document.getElementById('chatContainer');
    const processingBubble = document.getElementById('processingBubble');

    // Step 1: Immediately remove processing bubble before restoring chat
    if (processingBubble) {
      processingBubble.remove();
    }

    // Step 2: Restore chat container
    if (chatContainer) {
      gsap.to(chatContainer, {
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power3.out',
      });
    }

    // Step 3: Add typing indicator then success message
    addTimeout(() => {
      setVideoState((prev) => ({ ...prev, currentPhase: 'result' }));

      // First show typing indicator
      addBotMessageToChat(`
        <div class="flex items-center space-x-3">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      `);

      // Remove typing indicator and show success message after delay
      addTimeout(() => {
        // Remove the typing indicator (last message)
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
          const messages = chatMessages.querySelectorAll('.chat-message');
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage) {
              lastMessage.remove();
            }
          }
        }

        // Add the actual success message
        addBotMessageToChat(
          "Perfect! I've successfully upgraded your account to the Premium tier. Enjoy all the new features!"
        );
      }, 1500);
    }, 500);

    addTimeout(() => {
      showFinale();
    }, 4000);
  };

  const showFinale = () => {
    console.log('=== SHOWING FINALE ===');
    setVideoState((prev) => ({ ...prev, currentPhase: 'finale' }));

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
            duration: 0.8,
          });

          animateFinaleElements();
        },
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
          className="h-full bg-gradient-to-r from-cyan-400/20 to-secondary transition-all duration-300 ease-out"
          style={{
            width:
              videoState.currentPhase === 'chat'
                ? '22%'
                : videoState.currentPhase === 'processing'
                  ? '31%'
                  : videoState.currentPhase === 'result'
                    ? '88%'
                    : videoState.currentPhase === 'finale'
                      ? '100%'
                      : '22%',
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
            <div
              id="initialState"
              className="flex-1 flex items-center justify-center px-6"
            >
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <svg
                      className="w-10 h-10 text-white transform translate-x-[-1px] translate-y-[1px]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-bold text-muted-foreground mb-2">
                    MusicStream
                    <br />
                    Customer Support
                  </h2>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative overflow-visible">
                    <textarea
                      id="userInput"
                      placeholder="Tell me what you need..."
                      className="w-full px-6 py-4 pr-16 text-base bg-muted rounded-full focus:outline-none transition-all duration-300 resize-none min-h-[60px] max-h-[120px] leading-normal overflow-hidden"
                      spellCheck={false}
                      disabled
                      rows={1}
                      onInput={(e) => {
                        const textarea = e.target as HTMLTextAreaElement;
                        textarea.style.height = '60px'; // Reset to minimum height
                        textarea.style.height =
                          Math.min(textarea.scrollHeight, 120) + 'px'; // Expand up to max
                      }}
                    />
                    <button
                      id="sendButton"
                      className="group absolute right-3 top-1/2 transform -translate-y-[60%] p-2 hover:scale-110 transition-all duration-300"
                    >
                      <div className="transform -rotate-12 group-hover:-rotate-6 transition-transform duration-300">
                        <svg
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300 text-cyan-600 dark:text-cyan-400"
                        >
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation State: Messages */}
            <div
              id="conversationState"
              className="flex-1 flex items-center justify-center overflow-y-auto"
              style={{ display: 'none' }}
            >
              <div
                id="chatMessages"
                className="w-full max-w-2xl px-6 flex flex-col gap-4 py-8"
              >
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
          videoState.currentPhase === 'finale'
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
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
            <div
              className="absolute inset-0 w-48 h-48 border-2 border-brand/40 rounded-3xl"
              style={{ animation: 'ringPulse 3s infinite ease-out' }}
            ></div>
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
