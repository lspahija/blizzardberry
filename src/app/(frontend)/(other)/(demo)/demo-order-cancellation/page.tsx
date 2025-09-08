'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import Image from 'next/image';

gsap.registerPlugin(TextPlugin);

interface VideoState {
  isRunning: boolean;
  currentPhase:
    | 'intro'
    | 'chat'
    | 'processing'
    | 'result'
    | 'finale'
    | 'complete';
}

export default function CustomerSupportVideo() {
  const [videoState, setVideoState] = useState<VideoState>({
    isRunning: false,
    currentPhase: 'intro',
  });

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const addTimeout = (fn: () => void, delay: number) => {
    const timeout = setTimeout(fn, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  const clearAllTimers = () => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
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
    clearAllTimers();
    setVideoState({ isRunning: true, currentPhase: 'chat' });

    const timeline = gsap.timeline({
      repeat: -1,
      onComplete: () => {
        // Auto-restart
        setVideoState((prev) => ({ ...prev, currentPhase: 'chat' }));
        clearAllTimers();
      },
    });

    // Phase 1: Start directly with Chat Interface
    timeline
      .call(() => {
        setVideoState((prev) => ({ ...prev, currentPhase: 'chat' }));
        showChatInterface();
      })

      // Phase 2: Processing phase (extended for conversation)
      .call(
        () => {
          setVideoState((prev) => ({ ...prev, currentPhase: 'processing' }));
          showProcessing();
        },
        [],
        5 // Extended to allow for agent question + user response + processing
      )

      // Phase 3: Beautiful Result Display (3s for full celebration)
      .call(
        () => {
          setVideoState((prev) => ({ ...prev, currentPhase: 'result' }));
          showResult();
        },
        [],
        8
      )

      // Phase 4: Demo-Niko Finale (4s)
      .call(
        () => {
          setVideoState((prev) => ({ ...prev, currentPhase: 'finale' }));
          showFinale();
        },
        [],
        11
      )

      // Phase 5: Complete and restart (1s pause)
      .call(
        () => {
          setVideoState((prev) => ({ ...prev, currentPhase: 'complete' }));
        },
        [],
        15
      );

    masterTimelineRef.current = timeline;
    timeline.play();
  };

  const showChatInterface = () => {
    // Show chat interface directly without intro animation
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput') as HTMLTextAreaElement;

    if (chatContainer) {
      // Show chat container immediately
      chatContainer.style.display = 'flex';
      chatContainer.style.opacity = '1';
      gsap.set(chatContainer, { y: 0 }); // Position at center

      // Start typing user message immediately
      addTimeout(() => {
        if (userInput) {
          userInput.disabled = false;
          userInput.focus();
          typeTextWithScroll(userInput, 'I need to cancel my order', 60, () => {
            // Show airplane animation and send with natural pause
            addTimeout(() => {
              triggerAirplane();
            }, 500);
          });
        }
      }, 300); // Small delay to ensure everything is ready
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
        duration: 0.3,
        ease: 'power1.out',
        onComplete: () => {
          transitionToProcessing();
        },
      });
    }
  };

  const transitionToProcessing = () => {
    const chatContainer = document.getElementById('chatContainer');
    const conversationState = document.getElementById('conversationState');
    const chatMessages = document.getElementById('chatMessages');

    // Hide input, show conversation with message
    const initialState = document.getElementById('initialState');
    if (initialState && conversationState) {
      initialState.style.display = 'none';
      conversationState.style.display = 'flex';
    }

    // Add user message first
    if (chatMessages) {
      // Clear any existing messages to ensure proper order
      chatMessages.innerHTML = '';

      addChatMessageWithSlide({
        type: 'sent',
        text: 'I need to cancel my order',
      });

      // Add agent's question for order number
      addTimeout(() => {
        addAgentQuestion();
      }, 1000); // Wait for user message animation to complete
    }
  };

  const addChatMessageWithSlide = (
    message: { type: string; text: string },
    isMultiline = false
  ) => {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Get existing messages for smooth sliding animation
    const existingMessages = Array.from(
      chatMessages.querySelectorAll('.chat-message')
    );

    // Format text for multiline with bullet points
    let formattedText = message.text;
    if (isMultiline) {
      formattedText = message.text
        .split('\n')
        .map((line) => line.trim())
        .join('<br>');
    }

    // Create the new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} chat-message`;
    messageDiv.innerHTML = `
      <div class="max-w-md px-5 py-3 rounded-2xl transition-all duration-300 ${
        message.type === 'sent'
          ? 'bg-blue-500/15 text-blue-800 hover:scale-[1.02]'
          : 'bg-muted text-foreground hover:scale-[1.01] hover:shadow-md'
      }">
        <div class="text-base leading-relaxed">${formattedText}</div>
      </div>
    `;

    // Add to DOM
    chatMessages.appendChild(messageDiv);

    // Calculate the space needed for the new message
    const messageHeight = messageDiv.offsetHeight;
    const gap = 16; // gap-4 = 1rem = 16px
    const totalMove = messageHeight + gap;

    // Smooth sliding animation - all messages move up, new message slides in from bottom
    gsap.context(() => {
      // Start new message below its final position
      gsap.set(messageDiv, {
        y: 60,
        opacity: 0,
        scale: 0.95,
      });

      // Animate existing messages up
      existingMessages.forEach((el, i) => {
        gsap.to(el, {
          y: -totalMove,
          duration: 0.8,
          delay: i * 0.02, // Subtle stagger for wave effect
          ease: 'power2.out',
        });
      });

      // Animate new message into position
      gsap.to(messageDiv, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: 0.1, // Slight delay for better effect
        ease: 'back.out(1.7)',
        clearProps: 'all',
      });
    }, chatMessages);
  };

  const addAgentQuestion = () => {
    addChatMessageWithSlide({
      type: 'received',
      text: 'I can help you cancel your order. Could you please provide your order number?',
    });

    // Add user's response with order number after agent question
    addTimeout(() => {
      addUserOrderNumber();
    }, 1500);
  };

  const addUserOrderNumber = () => {
    addChatMessageWithSlide({
      type: 'sent',
      text: '#9373',
    });

    // Add processing bubble after user provides order number
    addTimeout(() => {
      addProcessingBubble();
    }, 1000);
  };

  const addProcessingBubble = () => {
    addChatMessageWithSlide({
      type: 'received',
      text: `
        <div class="flex items-center space-x-3">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-blue-500/15 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-blue-500/15 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-blue-500/15 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
          <div class="text-base text-muted-foreground">Processing cancellation...</div>
        </div>
      `,
    });

    // Store reference for later removal
    const allMessages = document.querySelectorAll('.chat-message');
    const processingBubble = allMessages[allMessages.length - 1];
    if (processingBubble) {
      processingBubble.id = 'analyzingBubble';
    }
  };

  const showProcessing = () => {
    // Processing bubble is now added directly in transitionToProcessing
    // This function is kept for timeline compatibility but doesn't need to do anything
    console.log('Processing phase started - bubble already added');
  };

  const showResult = () => {
    // Remove analyzing bubble with smooth fade and slide up
    const analyzingBubble = document.getElementById('analyzingBubble');
    if (analyzingBubble) {
      gsap.to(analyzingBubble, {
        opacity: 0,
        y: -30,
        scale: 0.8,
        duration: 0.6,
        ease: 'power2.in',
        onComplete: () => {
          if (analyzingBubble.parentNode) {
            analyzingBubble.parentNode.removeChild(analyzingBubble);
          }

          // Add success response after processing bubble is removed
          addSuccessResponse();
        },
      });
    } else {
      // Fallback if bubble not found
      addSuccessResponse();
    }
  };

  const addSuccessResponse = () => {
    const successMessage = {
      type: 'received',
      text: `
        <div class="bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500 text-foreground px-6 py-4 rounded-2xl max-w-lg shadow-lg">
          <div class="text-base leading-relaxed">
            <div class="flex items-center mb-3">
              <div class="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center mr-3 shadow-sm celebration-checkmark">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="font-bold text-teal-600 dark:text-teal-400 text-lg">Order Canceled!</span>
            </div>
            <div class="bg-white/70 rounded-lg p-3 mb-3">
              <p class="font-semibold text-gray-800">Order #9373</p>
              <p class="text-sm text-gray-600">Premium headphones - $127.99</p>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Refund:</span>
              <span class="font-bold text-teal-600 dark:text-teal-400">$127.99</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">Processing time: 3-5 business days</p>
          </div>
        </div>
      `,
    };

    addChatMessageWithSlide(successMessage);

    // Add celebration effects after the message slides in
    addTimeout(() => {
      const lastMessage = document.querySelector('.chat-message:last-child');
      if (lastMessage) {
        // Create celebration particles
        for (let i = 0; i < 6; i++) {
          createCelebrationParticle(lastMessage as HTMLElement);
        }

        // Gentle pulse on the checkmark
        const checkmark = lastMessage.querySelector('.celebration-checkmark');
        if (checkmark) {
          gsap.to(checkmark, {
            scale: 1.3,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
          });
        }
      }
    }, 1000); // After slide animation completes
  };

  const createCelebrationParticle = (container: HTMLElement) => {
    const particle = document.createElement('div');
    particle.className = 'absolute w-2 h-2 rounded-full pointer-events-none';
    particle.style.background = ['#10B981', '#F43F5E', '#1D4ED8'][
      Math.floor(Math.random() * 3)
    ];

    const rect = container.getBoundingClientRect();
    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top + rect.height / 2}px`;
    particle.style.position = 'fixed';
    particle.style.zIndex = '1000';

    document.body.appendChild(particle);

    // Animate particle
    gsap.to(particle, {
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      scale: 0,
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out',
      onComplete: () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      },
    });
  };

  const showFinale = () => {
    // Beautiful scroll-up animation from chat to finale
    const chatContainer = document.getElementById('chatContainer');
    const finaleContainer = document.getElementById('finaleContainer');

    if (chatContainer && finaleContainer) {
      // Prepare finale container positioned below chat
      finaleContainer.style.display = 'flex';
      finaleContainer.style.opacity = '1';
      gsap.set(finaleContainer, { y: '100vh' }); // Start below screen

      // Animate both containers: chat scrolls up, finale scrolls up into view
      const timeline = gsap.timeline();

      timeline
        // Scroll chat up and out of view
        .to(chatContainer, {
          y: '-100vh',
          duration: 1.2,
          ease: 'power2.inOut',
        })
        // Simultaneously scroll finale up into view
        .to(
          finaleContainer,
          {
            y: 0,
            duration: 1.2,
            ease: 'power2.inOut',
          },
          0
        ); // Start at same time as chat animation

      // Start finale animations after scroll completes
      addTimeout(() => {
        animateFinaleElements();
      }, 1400); // After scroll animation completes
    }
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
  };

  const startTypingIntro = () => {
    // Beautiful reveal animation - elements are already positioned and hidden
    const mainTextElement = document.getElementById(
      'typingMainText'
    ) as HTMLElement;
    const subtextElement = document.getElementById(
      'typingSubtext'
    ) as HTMLElement;

    // Animate first line in with beautiful entrance
    addTimeout(() => {
      if (mainTextElement) {
        gsap.to(mainTextElement, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: 'elastic.out(1, 0.5)',
        });
      }
    }, 300);

    // Animate second line in after first line starts
    addTimeout(() => {
      if (subtextElement) {
        gsap.to(subtextElement, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.0,
          ease: 'back.out(1.7)',
        });
      }
    }, 1500);
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
        @keyframes logoBreathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
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
        
        @keyframes floatingParticles {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        
        .interactive-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .interactive-hover:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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
            width:
              videoState.currentPhase === 'chat'
                ? '25%'
                : videoState.currentPhase === 'processing'
                  ? '50%'
                  : videoState.currentPhase === 'result'
                    ? '75%'
                    : videoState.currentPhase === 'finale'
                      ? '100%'
                      : '0%',
          }}
        />
      </div>

      {/* Clean Intro Phase - White Background with BlizzardBerry Colors */}
      <div
        data-phase="intro"
        className={`fixed inset-0 bg-white flex flex-col items-center justify-center text-center px-8 transition-opacity duration-500 ${
          videoState.currentPhase === 'intro'
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>

        {/* Main reveal text - Properly stacked */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-4">
            <h1
              id="typingMainText"
              className="text-7xl font-bold tracking-tight opacity-0"
              style={{
                background: 'linear-gradient(135deg, #F43F5E, #1D4ED8)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                transform: 'translateY(50px) scale(0.9)',
              }}
            >
              Discover the New Way
            </h1>
          </div>

          <div className="relative">
            <p
              id="typingSubtext"
              className="text-3xl font-medium tracking-wide opacity-0 text-muted-foreground"
              style={{
                background: 'linear-gradient(135deg, #1D4ED8, #10B981)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                transform: 'translateY(40px) scale(0.95)',
              }}
            >
              to interact with the web!
            </p>

            {/* Animated cursor - hidden */}
            <span
              className="inline-block w-1 h-8 bg-brand ml-1 typing-cursor align-middle"
              id="typingCursor"
              style={{ display: 'none' }}
            ></span>
          </div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-brand/20 rounded-full animate-pulse"></div>
        <div
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-secondary/20 rounded-full animate-bounce"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-primary/20 rounded-full animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-brand/30 rounded-full animate-bounce"
          style={{ animationDelay: '0.5s' }}
        ></div>
      </div>

      {/* Chat Interface - Demo-Niko Style */}
      <div
        id="chatContainer"
        className={`fixed inset-0 bg-white transition-opacity duration-300 ${
          videoState.currentPhase === 'chat' ||
          videoState.currentPhase === 'processing' ||
          videoState.currentPhase === 'result'
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
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
                  <h2 className="text-4xl font-bold text-foreground mb-2">
                    Customer Support
                  </h2>
                  <p className="text-muted-foreground">
                    How can we help you today?
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative overflow-visible">
                    <textarea
                      id="userInput"
                      placeholder="Describe your issue..."
                      className="w-full px-6 py-4 pr-16 text-base bg-muted rounded-full focus:outline-none transition-all duration-300 resize-none min-h-[60px] max-h-[120px] leading-normal overflow-hidden"
                      disabled
                      rows={1}
                      onInput={(e) => {
                        const textarea = e.target as HTMLTextAreaElement;
                        textarea.style.height = '60px'; // Reset to minimum height
                        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'; // Expand up to max
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
                          className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300 text-blue-600 dark:text-blue-400"
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
              className="flex-1 flex items-center justify-center"
              style={{ display: 'none' }}
            >
              <div
                id="chatMessages"
                className="w-full max-w-2xl px-6 flex flex-col gap-4"
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

      {/* Phase indicator dots */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-50">
        {['chat', 'processing', 'result', 'finale'].map((phase) => (
          <div
            key={phase}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              videoState.currentPhase === phase ? 'bg-brand' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
