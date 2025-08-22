'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import Image from 'next/image';
import { LabelList, RadialBar, RadialBarChart } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/app/(frontend)/components/ui/chart';

// Register GSAP plugins
gsap.registerPlugin(TextPlugin);

// Configuration Constants
const CONFIG = {
  QUERIES: {
    NORTH_AMERICA: 'Show me revenue numbers for North America',
    SUPPORT_TICKETS: 'How many support tickets did we have today?',
  },
  TIMINGS: {
    SCENE_DURATION: 48000,
    TYPING_SPEED: 50,
    AIRPLANE_DURATION: 250,
    DASHBOARD_DISPLAY: 5000,
    TICKETS_DISPLAY: 5000,
    SCENE4_TOTAL: 6800,
  },
  ANIMATION: {
    FADE_DURATION: 0.6,
    SCALE_DURATION: 0.8,
    SLIDE_DURATION: 0.5,
  },
  CHART: {
    DATA: [
      { month: 'Jun', revenue: 650, fill: '#BFDBFE' },
      { month: 'Jul', revenue: 720, fill: '#93C5FD' },
      { month: 'Aug', revenue: 580, fill: '#60A5FA' },
      { month: 'Sep', revenue: 847, fill: '#3B82F6' },
      { month: 'Oct', revenue: 620, fill: '#1E40AF' },
      { month: 'Nov', revenue: 750, fill: '#1E3A8A' },
    ],
  },
};

interface DemoState {
  currentScene: number;
  totalScenes: number;
  animationSpeed: number;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number;
  totalDuration: number;
}

export default function DemoPage() {
  const [demoState, setDemoState] = useState<DemoState>({
    currentScene: 0,
    totalScenes: 4,
    animationSpeed: 1,
    isRunning: false,
    isPaused: false,
    startTime: Date.now(),
    totalDuration: CONFIG.TIMINGS.SCENE_DURATION,
  });

  const [, setIsLoaded] = useState(false);

  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);
  const animationSpeedRef = useRef<number>(1);

  const updateProgress = () => {
    const elapsed = Date.now() - demoState.startTime;
    const progress = Math.min((elapsed / demoState.totalDuration) * 100, 100);

    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    // Update circular progress
    const progressCircle = document.getElementById('progressCircle');
    if (progressCircle) {
      const circumference = 175.93; // 2π × 28
      const offset = circumference - (progress / 100) * circumference;
      progressCircle.style.strokeDashoffset = offset.toString();
    }
  };

  // Animation helper functions
  const addTimeout = (fn: () => void, delay: number) => {
    const adjustedDelay = delay / animationSpeedRef.current;
    const timeout = setTimeout(() => {
      fn();
      updateProgress();
    }, adjustedDelay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  const clearAllTimers = () => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    intervalsRef.current.forEach((interval) => clearInterval(interval));
    timeoutsRef.current = [];
    intervalsRef.current = [];
  };

  // Animation utilities
  const animationUtils = {
    fadeInScene: (element: HTMLElement, displayType = 'block') => {
      element.style.display = displayType;
      element.style.visibility = 'visible';
      return gsap.fromTo(
        element,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: CONFIG.ANIMATION.FADE_DURATION,
          ease: 'power2.out',
        }
      );
    },

    fadeOutScene: (element: HTMLElement) => {
      return gsap.to(element, {
        opacity: 0,
        scale: 0.95,
        duration: CONFIG.ANIMATION.FADE_DURATION,
        ease: 'power2.in',
        onComplete: () => {
          element.style.display = 'none';
        },
      });
    },

    slideElement: (
      element: HTMLElement,
      direction: 'up' | 'down' | 'left' | 'right',
      distance = 50
    ) => {
      const transforms = {
        up: { y: -distance },
        down: { y: distance },
        left: { x: -distance },
        right: { x: distance },
      };

      return gsap.fromTo(
        element,
        { opacity: 0, ...transforms[direction] },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: CONFIG.ANIMATION.SLIDE_DURATION,
          ease: 'power2.out',
        }
      );
    },
  };

  // Scene transition functions
  const showScene = (sceneId: string) => {
    console.log('=== SHOWING SCENE:', sceneId);
    const scene = document.getElementById(sceneId);
    if (scene) {
      const displayType = sceneId.includes('scene4') ? 'flex' : 'block';
      animationUtils.fadeInScene(scene, displayType);
      console.log('Scene', sceneId, 'is now smoothly transitioning in');
    } else {
      console.error('Scene not found:', sceneId);
    }
  };

  const hideScene = (sceneId: string) => {
    const scene = document.getElementById(sceneId);
    if (scene) {
      animationUtils.fadeOutScene(scene);
    }
  };

  // DOM utility helper
  const getElementById = (id: string) => {
    const element = document.getElementById(id);
    if (!element) console.error(`Element not found: ${id}`);
    return element;
  };

  // Typing animation function
  const typeText = (
    element: HTMLInputElement | null,
    text: string,
    speed = CONFIG.TIMINGS.TYPING_SPEED,
    callback?: () => void
  ) => {
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

  // Chart config for radial chart
  const chartConfig = {
    revenue: {
      label: 'Revenue ($K)',
    },
    Jun: {
      label: 'Jun',
      color: '#BFDBFE',
    },
    Jul: {
      label: 'Jul',
      color: '#93C5FD',
    },
    Aug: {
      label: 'Aug',
      color: '#60A5FA',
    },
    Sep: {
      label: 'Sep',
      color: '#3B82F6',
    },
    Oct: {
      label: 'Oct',
      color: '#1E40AF',
    },
    Nov: {
      label: 'Nov',
      color: '#1E3A8A',
    },
  } satisfies ChartConfig;

  // Master Timeline using GSAP - recreating original timing but with GSAP control
  const buildMasterTimeline = () => {
    const tl = gsap.timeline({
      repeat: -1,
      onComplete: () => {
        // Auto-restart: reset timing and restart
        setDemoState((prev) => ({
          ...prev,
          startTime: Date.now(),
          currentScene: 0,
          isRunning: true,
          isPaused: false,
        }));
        // Small delay before restart for smooth transition
        setTimeout(() => {
          clearAllTimers();
        }, 500);
      },
    });

    // Start directly with Scene 2 - Chat (reduced initial delay)
    tl.addLabel('scene2Start', 0.2)
      .call(() => showScene('scene2'), undefined, 'scene2Start')
      .call(
        () => {
          // Start Scene 2 animations - direct chat conversation
          scene2Sequence();
        },
        undefined,
        'scene2Start+=0.3'
      )
      .call(
        () => {
          hideScene('scene2');
        },
        undefined,
        'scene2Start+=45'
      ); // Extended to cover full flow including tickets

    // Scene 4 is now triggered directly from hideTicketsDashboard()

    masterTimelineRef.current = tl;
    return tl;
  };

  // Scene 2: AI Processing & Dashboard - exact recreation
  const scene2Sequence = () => {
    setDemoState((prev) => ({ ...prev, currentScene: 2 }));

    // Start chat conversation immediately - no delay
    // Timing is now controlled by the chat flow in showInitialAnalyzingBubble
    startChatConversation();
  };

  // Transition is now handled directly by airplane boundary detection

  const startChatConversation = () => {
    // Show chat window immediately with fade-in effect
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) {
      chatWindow.style.display = 'flex';
      gsap.fromTo(
        chatWindow,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
      );
    }

    // Start typing simulation after chat window appears
    addTimeout(() => {
      simulateTypingAndSend();
    }, 800);

    const simulateTypingAndSend = () => {
      const chatInitialInput = document.getElementById(
        'chatInitialInput'
      ) as HTMLInputElement;

      if (!chatInitialInput) return;

      // Show the initial state for typing
      const initialState = document.getElementById('chatInitialState');
      const conversationState = document.getElementById(
        'chatConversationState'
      );

      if (initialState && conversationState) {
        initialState.style.display = 'flex';
        conversationState.style.display = 'none';
      }

      // Enable input
      chatInitialInput.disabled = false;

      // Start typing directly
      addTimeout(() => {
        chatInitialInput.focus();

        addTimeout(() => {
          typeText(
            chatInitialInput,
            CONFIG.QUERIES.NORTH_AMERICA,
            CONFIG.TIMINGS.TYPING_SPEED,
            () => {
              // Callback when typing is completely finished (after the dot is added)
              console.log('Typing completed, triggering send');
              triggerSendDirectly();
            }
          );
        }, 300);
      }, 500);

      // Function to trigger send directly without mouse animation
      const triggerSendDirectly = () => {
        console.log('Triggering send directly - starting airplane animation');

        // Trigger airplane animation immediately
        addTimeout(() => {
          const sendButton = document.getElementById('sendButton');
          if (sendButton) {
            // Set higher z-index so airplane flies over everything
            sendButton.style.zIndex = '1000';

            let transitionTriggered = false; // Flag to prevent multiple transitions

            gsap.to(sendButton, {
              x: 500, // Even further distance to exit screen
              y: -20, // Slight upward trajectory
              rotation: -6, // Rotate to match flight direction
              scale: 1.1, // Slight grow
              duration: CONFIG.TIMINGS.AIRPLANE_DURATION / 1000, // Convert to seconds
              ease: 'power1.out', // Fast exit curve
              onUpdate: function () {
                // Check if airplane has completely exited the screen
                if (sendButton && !transitionTriggered) {
                  const buttonRect = sendButton.getBoundingClientRect();
                  const viewportWidth = window.innerWidth;

                  // If button has moved completely past the right edge of the screen
                  if (buttonRect.left > viewportWidth) {
                    console.log(
                      'First chat airplane has completely exited screen - triggering transition'
                    );
                    transitionTriggered = true;
                    // Stop the animation
                    this.kill();
                    // Small delay to ensure airplane is fully out of view
                    setTimeout(() => {
                      triggerFirstChatTransition();
                    }, 150); // Extra 150ms to ensure smooth transition
                  }
                }
              },
              onComplete: () => {
                if (!transitionTriggered) {
                  console.log(
                    'First chat airplane animation complete - fallback trigger'
                  );
                  triggerFirstChatTransition();
                }
              },
            });
          } else {
            // No fallback - only airplane animation should trigger transition
            console.error('Send button not found for airplane animation');
          }
        }, 150); // Brief pause before airplane starts

        // Function to handle immediate first chat transition when airplane exits
        function triggerFirstChatTransition() {
          console.log('=== TRIGGERING FIRST CHAT TRANSITION IMMEDIATELY ===');
          console.trace('Call stack for first chat transition:');

          const initialState = document.getElementById('chatInitialState');
          const conversationState = document.getElementById(
            'chatConversationState'
          );

          if (initialState && conversationState) {
            initialState.style.display = 'none';
            conversationState.style.display = 'flex';
          }

          // Add the message immediately
          const message = {
            type: 'sent',
            text: CONFIG.QUERIES.NORTH_AMERICA,
          };
          addChatMessage(message);

          // Show analyzing bubble after user can see the sent message
          addTimeout(() => {
            showInitialAnalyzingBubble();
          }, 1200); // Increased delay to let users see the sent message
        }
      };
    };
  };

  let initialAnalyzingBubbleDiv: HTMLElement | null = null;

  const showTypingIndicator = (callback?: () => void, delay = 1500) => {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Get existing messages for elegant sliding animation
    const existingMessages = Array.from(
      chatMessages.querySelectorAll('.chat-message')
    );

    const typingBubbleDiv = document.createElement('div');
    typingBubbleDiv.className =
      'flex justify-start chat-message typing-indicator';

    typingBubbleDiv.innerHTML = `
      <div class="bg-muted px-5 py-3 rounded-3xl max-w-md transition-all duration-300">
        <div class="flex items-center space-x-3">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-brand/60 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-brand/60 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-brand/60 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    `;

    // Append to DOM
    chatMessages.appendChild(typingBubbleDiv);

    // Smooth sliding animation
    gsap.context(() => {
      gsap.set(typingBubbleDiv, {
        y: 60,
        opacity: 0,
      });

      const bubbleHeight = typingBubbleDiv.offsetHeight;
      const gap = 16;
      const totalMove = bubbleHeight + gap;

      const allElements = [...existingMessages, typingBubbleDiv];

      allElements.forEach((el, i) => {
        const isNewBubble = el === typingBubbleDiv;

        gsap.to(el, {
          y: isNewBubble ? 0 : -totalMove,
          opacity: 1,
          duration: 0.8,
          delay: i * 0.02,
          ease: 'power2.out',
          clearProps: 'all',
        });
      });
    }, chatMessages);

    // Remove typing indicator and call callback after delay
    addTimeout(() => {
      if (typingBubbleDiv && typingBubbleDiv.parentNode) {
        typingBubbleDiv.parentNode.removeChild(typingBubbleDiv);
      }
      if (callback) callback();
    }, delay);
  };

  const showInitialAnalyzingBubble = () => {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Show analyzing bubble directly (it has its own typing indicator)
    addTimeout(() => {
      // Get existing messages for elegant sliding animation
      const existingMessages = Array.from(
        chatMessages.querySelectorAll('.chat-message')
      );

      initialAnalyzingBubbleDiv = document.createElement('div');
      initialAnalyzingBubbleDiv.className = 'flex justify-start chat-message';

      initialAnalyzingBubbleDiv.innerHTML = `
        <div class="bg-muted px-5 py-3 rounded-3xl max-w-md transition-all duration-300">
          <div class="flex items-center space-x-3">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-brand/60 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-brand/60 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-brand/60 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <div class="text-base text-muted-foreground">Analyzing...</div>
          </div>
        </div>
      `;

      // Append to DOM
      chatMessages.appendChild(initialAnalyzingBubbleDiv);

      // Smooth sliding animation matching the updated style
      gsap.context(() => {
        // Start initial analyzing bubble below its final position
        gsap.set(initialAnalyzingBubbleDiv, {
          y: 60, // Start from below its final position
          opacity: 0,
        });

        // Calculate how much everything needs to move up
        const bubbleHeight = initialAnalyzingBubbleDiv.offsetHeight;
        const gap = 16; // gap-4 = 1rem = 16px
        const totalMove = bubbleHeight + gap;

        // Animate everything up together smoothly
        const allElements = [...existingMessages, initialAnalyzingBubbleDiv];

        allElements.forEach((el, i) => {
          const isNewBubble = el === initialAnalyzingBubbleDiv;

          gsap.to(el, {
            y: isNewBubble ? 0 : -totalMove, // New bubble goes to 0, others move up
            opacity: 1,
            duration: 0.8,
            delay: i * 0.02, // Very subtle stagger for smooth wave effect
            ease: 'power2.out',
            clearProps: 'all',
          });
        });
      }, chatMessages);

      // Transition smoothly to dashboard after analyzing
      addTimeout(() => {
        startDashboardTransition();
      }, 2500); // Let users see the analyzing bubble, then transition
    }, 300);
  };

  // Removed AI analysis - going directly to dashboard

  const continueConversationAfterDashboard = () => {
    console.log('=== CONTINUING CONVERSATION AFTER DASHBOARD ===');

    // Reset to initial state for new conversation
    const initialState = document.getElementById('chatInitialState');
    const conversationState = document.getElementById('chatConversationState');
    const chatMessages = document.getElementById('chatMessages');

    if (!initialState || !conversationState || !chatMessages) {
      console.error('Chat elements not found!');
      return;
    }

    // Animate out existing messages before clearing
    const existingMessages = Array.from(
      chatMessages.querySelectorAll('.chat-message')
    );
    const hasMessages = existingMessages.length > 0;
    const slideOutDelay = hasMessages ? 650 : 0;

    if (hasMessages) {
      // Animate all messages sliding up and fading out
      existingMessages.forEach((msg) => {
        msg.style.transition =
          'transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 600ms ease-out';
        msg.style.transform = 'translateY(-100px)';
        msg.style.opacity = '0';
      });

      // Wait for animation to complete before clearing
      setTimeout(() => {
        chatMessages.innerHTML = '';

        // Show initial state, hide conversation state
        conversationState.style.display = 'none';
        conversationState.style.opacity = '0';
        initialState.style.display = 'flex';
        initialState.style.opacity = '1';
      }, slideOutDelay); // Wait for slide-up animation to finish
    } else {
      // No messages to animate, proceed immediately
      chatMessages.innerHTML = '';

      // Show initial state, hide conversation state
      conversationState.style.display = 'none';
      conversationState.style.opacity = '0';
      initialState.style.display = 'flex';
      initialState.style.opacity = '1';
    }

    // Start typing animation in the centered input immediately
    addTimeout(() => {
      showUserTypingAnimation(CONFIG.QUERIES.SUPPORT_TICKETS);
    }, slideOutDelay + 200); // Start typing immediately after input appears

    // Transition is now handled by airplane animation in showUserTypingAnimation

    // User message appears in chat after transition
    addTimeout(() => {
      addChatMessage(
        {
          type: 'sent',
          text: CONFIG.QUERIES.SUPPORT_TICKETS,
        },
        false
      );
    }, slideOutDelay + 4000); // Adjusted timing

    // Agent responds with typing indicator first
    addTimeout(() => {
      showTypingIndicator(() => {
        addChatMessage(
          {
            type: 'received',
            text: 'We had 3 tickets today:\n\n• 2 Resolved\n• 1 Open\n\nWould you like to see the full details?',
          },
          true
        );
      }, 1800); // Show typing for 1.8 seconds
    }, slideOutDelay + 5500); // Adjusted to slideOutDelay + timing

    // User responds YES (key moment - make it prominent)
    addTimeout(() => {
      console.log('=== SENDING YES MESSAGE ===');
      addChatMessage(
        {
          type: 'sent',
          text: 'Yes, please!',
        },
        false
      );

      // Show tickets dashboard after YES
      addTimeout(() => {
        showTicketsDashboard();
      }, 1800); // Normal timing
    }, slideOutDelay + 8500); // Adjusted to slideOutDelay + timing
  };

  // New streamlined tickets dashboard
  const showTicketsDashboard = () => {
    console.log('=== SHOWING TICKETS DASHBOARD ===');
    const chatWindow = document.getElementById('chatWindow');
    const chatMessages = document.getElementById('chatMessages');

    if (!chatWindow || !chatMessages) {
      console.error('Chat window or messages not found!');
      return;
    }

    // Step 1: Clear chat animation - animate entire message container
    const allChatMessages = chatMessages.querySelectorAll('.chat-message');
    if (allChatMessages.length > 0) {
      // Animate the entire chat messages container with transform and opacity simultaneously
      chatMessages.style.transition =
        'transform 500ms ease-in-out, opacity 500ms ease-in-out';
      chatMessages.style.transform = 'translateY(-100%)';
      chatMessages.style.opacity = '0';

      // Wait for clear chat animation to complete, then animate chat window
      setTimeout(() => {
        // Reset chat messages container for next conversation
        chatMessages.innerHTML = '';
        chatMessages.style.transform = 'translateY(0)';
        chatMessages.style.opacity = '1';
        chatMessages.style.transition = '';

        animateChatWindowForTickets();
      }, 500); // Wait for clear chat animation to complete
    } else {
      // No messages to animate, proceed directly to chat window animation
      animateChatWindowForTickets();
    }

    function animateChatWindowForTickets() {
      // Step 2: Transform chat window content to tickets dashboard
      // Keep the same chat window, just change content
      replaceWithTicketsDashboard();
    }
  };

  const replaceWithTicketsDashboard = () => {
    console.log('=== REPLACING CHAT WITH TICKETS DASHBOARD ===');
    const chatWindow = document.getElementById('chatWindow');

    if (!chatWindow) {
      console.error('Chat window not found!');
      return;
    }

    // Replace chat window content with tickets dashboard
    // Keep exact same styling as first chat window
    chatWindow.className =
      'w-[600px] h-[680px] bg-white flex flex-col transition-all duration-300 ease-out relative overflow-hidden';
    chatWindow.innerHTML = `
      <div class="w-full h-full bg-gradient-to-br from-muted/30 via-card to-muted/10 overflow-hidden p-5">
        <!-- Header - All elements initially hidden -->
        <div class="text-center mb-4 mt-2">
          <h1 class="text-3xl font-bold text-foreground mb-2 tracking-tight" id="header-title" style="opacity: 0; transform: translateY(-20px);">Support Tickets</h1>
          <p class="text-sm text-muted-foreground font-medium" id="header-subtitle" style="opacity: 0; transform: translateY(-15px);">Today's Overview</p>
        </div>

        <!-- Quick Stats - All elements initially hidden -->
        <div class="grid grid-cols-3 gap-3 mb-8" id="stats-grid">
          <div class="bg-white rounded-lg p-3 text-center stats-card hover:scale-105 hover:-translate-y-1 transition-all duration-300" style="opacity: 0; transform: translateY(30px) scale(0.9);">
            <div class="text-2xl font-bold mb-1 ticket-stat text-indigo-600" data-target="3" style="opacity: 0;">0</div>
            <div class="text-xs text-muted-foreground font-medium" style="opacity: 0;">Total</div>
          </div>
          <div class="bg-white rounded-lg p-3 text-center stats-card hover:scale-105 hover:-translate-y-1 transition-all duration-300" style="opacity: 0; transform: translateY(30px) scale(0.9);">
            <div class="text-2xl font-bold mb-1 ticket-stat text-emerald-600" data-target="2" style="opacity: 0;">0</div>
            <div class="text-xs text-muted-foreground font-medium" style="opacity: 0;">Resolved</div>
          </div>
          <div class="bg-white rounded-lg p-3 text-center stats-card hover:scale-105 hover:-translate-y-1 transition-all duration-300" style="opacity: 0; transform: translateY(30px) scale(0.9);">
            <div class="text-2xl font-bold mb-1 ticket-stat text-orange-600" data-target="1" style="opacity: 0;">0</div>
            <div class="text-xs text-muted-foreground font-medium" style="opacity: 0;">Open</div>
          </div>
        </div>

        <!-- Tickets List - All elements initially hidden -->
        <div class="bg-white rounded-lg p-3 transition-all duration-300" id="tickets-section" style="opacity: 0; transform: translateY(20px);">
          <h3 class="text-lg font-bold text-foreground mb-3 tracking-tight" style="opacity: 0;">Recent Tickets</h3>
          <div class="space-y-2">
            <div class="ticket-row bg-white rounded-lg p-3 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300" style="opacity: 0; transform: translateX(-50px);">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div class="text-sm font-semibold text-foreground">#12847</div>
                </div>
                <span class="px-2 py-1 bg-orange-500/10 text-orange-600 text-xs rounded-full font-medium">Open</span>
              </div>
              <div class="text-sm text-foreground mb-1 font-medium">Payment Processing Error</div>
              <div class="text-xs text-muted-foreground">High Priority</div>
            </div>
            
            <div class="ticket-row bg-white rounded-lg p-3 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300" style="opacity: 0; transform: translateX(-50px);">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div class="text-sm font-semibold text-foreground">#12846</div>
                </div>
                <span class="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-xs rounded-full font-medium">Resolved</span>
              </div>
              <div class="text-sm text-foreground mb-1 font-medium">Billing Question</div>
              <div class="text-xs text-muted-foreground">Low Priority</div>
            </div>
            
            <div class="ticket-row bg-white rounded-lg p-3 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300" style="opacity: 0; transform: translateX(-50px);">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div class="text-sm font-semibold text-foreground">#12845</div>
                </div>
                <span class="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-xs rounded-full font-medium">Resolved</span>
              </div>
              <div class="text-sm text-foreground mb-1 font-medium">Feature Request</div>
              <div class="text-xs text-muted-foreground">Low Priority</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Start sequential animations immediately
    animateTicketsDashboard();
  };

  const animateTicketsDashboard = () => {
    console.log('=== ANIMATING TICKETS DASHBOARD WITH PERFECT SEQUENCE ===');

    // Step 1: Animate header text (no icon)
    addTimeout(() => {
      const headerTitle = document.getElementById('header-title');
      if (headerTitle) {
        gsap.to(headerTitle, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'back.out(1.7)',
        });
      }
    }, 300);

    addTimeout(() => {
      const headerSubtitle = document.getElementById('header-subtitle');
      if (headerSubtitle) {
        gsap.to(headerSubtitle, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        });
      }
    }, 600);

    // Step 3: Animate stats cards one by one
    addTimeout(() => {
      const statsCards = document.querySelectorAll('.stats-card');
      statsCards.forEach((card, index) => {
        addTimeout(() => {
          // First animate the card container
          gsap.to(card, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
              // Then animate the content inside
              const counter = card.querySelector('.ticket-stat');
              const label = card.querySelector('.text-xs');

              if (counter && label) {
                // Show the text elements
                gsap.to([counter, label], {
                  opacity: 1,
                  duration: 0.3,
                  stagger: 0.1,
                });

                // Animate the counter
                const target = parseInt(
                  counter.getAttribute('data-target') || '0'
                );
                const obj = { value: 0 };
                gsap.to(obj, {
                  value: target,
                  duration: 1.8,
                  ease: 'power2.out',
                  onUpdate: () => {
                    counter.textContent = Math.ceil(obj.value).toString();
                  },
                });
              }
            },
          });
        }, index * 200);
      });
    }, 1100);

    // Step 4: Animate tickets section
    addTimeout(() => {
      const ticketsSection = document.getElementById('tickets-section');
      if (ticketsSection) {
        gsap.to(ticketsSection, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          onComplete: () => {
            // Animate section header
            const sectionHeader = ticketsSection.querySelector('h3');
            if (sectionHeader) {
              gsap.to(sectionHeader, {
                opacity: 1,
                duration: 0.4,
              });
            }
          },
        });
      }
    }, 1800);

    // Step 5: Animate individual ticket rows
    addTimeout(() => {
      const rows = document.querySelectorAll('.ticket-row');
      rows.forEach((row, index) => {
        addTimeout(() => {
          gsap.to(row, {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
          });
        }, index * 150);
      });
    }, 2100);

    // Hide dashboard after 5 seconds (2 seconds longer for viewing)
    addTimeout(() => {
      hideTicketsDashboard();
    }, CONFIG.TIMINGS.TICKETS_DISPLAY);
  };

  const hideTicketsDashboard = () => {
    console.log('=== HIDING TICKETS DASHBOARD ===');
    const chatWindow = document.getElementById('chatWindow');

    if (chatWindow) {
      gsap.to(chatWindow, {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          chatWindow.style.display = 'none';
          console.log('Tickets dashboard removed, showing Scene 4');
          // Immediately show Scene 4 and start its sequence
          showScene('scene4');
          scene4Sequence();
        },
      });
    }
  };

  // Chat utilities
  const chatUtils = {
    formatText: (text: string, isMultiline = false) => {
      return isMultiline
        ? text
            .split('\n')
            .map((line) => line.trim())
            .join('<br>')
        : text;
    },

    createMessageElement: (
      message: { type: string; text: string },
      formattedText: string
    ) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} chat-message`;
      messageDiv.innerHTML = `
        <div class="max-w-md px-5 py-3 rounded-2xl ${
          message.type === 'sent'
            ? 'bg-brand text-primary-foreground'
            : 'bg-muted text-foreground transition-shadow duration-200'
        }">
          <div class="text-base leading-relaxed">${formattedText}</div>
        </div>
      `;
      return messageDiv;
    },

    animateMessageSlide: (
      chatMessages: HTMLElement,
      messageDiv: HTMLElement,
      existingMessages: Element[]
    ) => {
      gsap.context(() => {
        gsap.set(messageDiv, { y: 60, opacity: 0 });

        const messageHeight = messageDiv.offsetHeight;
        const gap = 16;
        const totalMove = messageHeight + gap;
        const allElements = [...existingMessages, messageDiv];

        allElements.forEach((el, i) => {
          const isNewMessage = el === messageDiv;
          gsap.to(el, {
            y: isNewMessage ? 0 : -totalMove,
            opacity: 1,
            duration: CONFIG.ANIMATION.SCALE_DURATION,
            delay: i * 0.02,
            ease: 'power2.out',
            clearProps: 'all',
          });
        });
      }, chatMessages);
    },
  };

  const addChatMessage = (
    message: { type: string; text: string },
    isMultiline = false
  ) => {
    console.log('=== ADDING CHAT MESSAGE ===', message.text);
    const chatMessages = getElementById('chatMessages');
    if (!chatMessages) return;

    const formattedText = chatUtils.formatText(message.text, isMultiline);
    const existingMessages = Array.from(
      chatMessages.querySelectorAll('.chat-message')
    );
    const messageDiv = chatUtils.createMessageElement(message, formattedText);

    chatMessages.appendChild(messageDiv);
    chatUtils.animateMessageSlide(chatMessages, messageDiv, existingMessages);
  };

  // Transition from initial state to conversation state
  const transitionToChatConversation = () => {
    const initialState = document.getElementById('chatInitialState');
    const conversationState = document.getElementById('chatConversationState');

    if (!initialState || !conversationState) return;

    // Animate out initial state
    gsap.to(initialState, {
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        initialState.style.display = 'none';

        // Show conversation state
        conversationState.style.display = 'flex';
        gsap.fromTo(
          conversationState,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
          }
        );
      },
    });
  };

  // User typing animation in input field
  const showUserTypingAnimation = (text: string) => {
    const inputField = document.querySelector(
      '#chatInitialInput'
    ) as HTMLInputElement;
    if (!inputField) return;

    // Clear input and show cursor focus
    inputField.value = '';
    inputField.focus();
    inputField.classList.add('bg-gray-100');

    let i = 0;
    const typeChar = () => {
      if (i < text.length) {
        inputField.value += text.charAt(i);
        i++;
        addTimeout(typeChar, 40); // Faster typing speed
      } else {
        // Typing completed, trigger airplane animation and transition
        addTimeout(() => {
          inputField.blur();
          inputField.classList.remove('bg-gray-100');

          // Trigger fast airplane animation like first chat
          const sendButton = document.getElementById('sendButton');
          if (sendButton) {
            // Set higher z-index so airplane flies over everything
            sendButton.style.zIndex = '1000';

            gsap.to(sendButton, {
              x: 500, // Even further distance to exit screen
              y: -20, // Slight upward trajectory
              rotation: -6, // Rotate to match flight direction
              scale: 1.1, // Slight grow
              duration: CONFIG.TIMINGS.AIRPLANE_DURATION / 1000, // Convert to seconds
              ease: 'power1.out', // Fast exit curve
              onUpdate: function () {
                // Check if airplane has completely exited the screen
                if (sendButton) {
                  const buttonRect = sendButton.getBoundingClientRect();
                  const viewportWidth = window.innerWidth;

                  // If button has moved completely past the right edge of the screen
                  if (buttonRect.left > viewportWidth) {
                    console.log(
                      'Tickets airplane has completely exited screen - triggering transition'
                    );
                    // Trigger immediate transition to conversation
                    this.kill(); // Stop the animation
                    triggerTicketsTransition();
                  }
                }
              },
              onComplete: () => {
                console.log('Tickets airplane animation complete');
                triggerTicketsTransition();
              },
            });
          } else {
            // Fallback if button not found
            triggerTicketsTransition();
          }

          // Function to handle immediate tickets transition
          function triggerTicketsTransition() {
            console.log('=== TRIGGERING TICKETS CHAT TRANSITION ===');
            // Call the original transition function
            transitionToChatConversation();
          }
        }, 300);
      }
    };

    // Start typing after brief delay
    addTimeout(typeChar, 200);
  };

  const showDashboard = () => {
    console.log('=== DASHBOARD SHOWING ===');

    // Start counters immediately when dashboard appears
    console.log('Starting counter animation immediately');
    animateCounters();

    // Hide dashboard after it has been displayed for 5 seconds
    addTimeout(() => {
      console.log('=== HIDING DASHBOARD, RETURNING TO CHAT ===');
      const dashboardScene = document.getElementById('dashboardScene');
      const chatWindow = document.getElementById('chatWindow');

      if (dashboardScene) {
        // Slide Away Effect - kartica klizi lijevo i nestaje
        gsap.to(dashboardScene, {
          x: '-100vw', // Klizi lijevo van ekrana
          opacity: 0.3, // Blago fade tijekom klizanja
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            dashboardScene.style.display = 'none';
            dashboardScene.style.visibility = 'hidden';
            // Reset position za sljedeći put
            gsap.set(dashboardScene, { x: 0, opacity: 1 });
            console.log('Revenue dashboard completely hidden');
          },
        });
      }

      // Slide In Effect - nova kartica klizi s desne strane
      if (chatWindow) {
        // Reset chat window to original dimensions and styles
        chatWindow.className =
          'w-[600px] h-[680px] bg-white flex flex-col transition-all duration-300 ease-out relative overflow-hidden';
        chatWindow.style.display = 'flex';
        // Ensure proper positioning - clear any transforms that might interfere
        chatWindow.style.transform = '';
        chatWindow.style.left = '';
        chatWindow.style.top = '';
        chatWindow.style.position = 'static';

        // Reset content to original chat layout (complete structure)
        chatWindow.innerHTML = `
          <div id="chatInitialState" class="flex-1 flex items-center justify-center px-6" style="display: none;">
            <div class="w-full max-w-md">
              <div class="flex gap-3 items-center">
                <div class="flex-1 relative overflow-visible">
                  <input
                    id="chatInitialInput"
                    type="text"
                    placeholder="Ask a question..."
                    class="w-full px-6 py-4 pr-16 text-base bg-muted rounded-full focus:outline-none transition-all duration-300"
                    spellcheck="false"
                    disabled
                  />
                  <!-- Send button inside input field -->
                  <button id="sendButton" class="group absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:scale-110 transition-all duration-300">
                    <!-- Airplane icon - pointing upward and to the right -->
                    <div class="transform -rotate-12 group-hover:-rotate-6 transition-transform duration-300">
                      <svg width="20" height="20" fill="#ef4444" viewBox="0 0 24 24" class="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div id="chatConversationState" class="flex-1 flex items-center justify-center">
            <div id="chatMessages" class="w-full max-w-2xl px-6 flex flex-col gap-4"></div>
          </div>
        `;

        gsap.fromTo(
          chatWindow,
          { opacity: 0 }, // Start invisible but in correct position
          {
            opacity: 1,
            duration: 0.6,
            delay: 0.3, // Kratka pauza nakon što prethodna kartica izađe
            ease: 'power2.out', // Smooth deceleration
          }
        );
      }

      showScene('scene2');

      // Wait for dashboard hide animation to complete before starting tickets
      addTimeout(() => {
        continueConversationAfterDashboard();
      }, 1200); // Wait for slide-away animation to complete
    }, CONFIG.TIMINGS.DASHBOARD_DISPLAY);
  };

  const startDashboardTransition = () => {
    console.log('=== STARTING DASHBOARD TRANSITION ===');
    const chatWindow = document.getElementById('chatWindow');
    const dashboardScene = document.getElementById('dashboardScene');

    if (!chatWindow || !dashboardScene) {
      console.error('Missing elements for transition');
      return;
    }

    // Step 1: Fade out chat
    gsap.to(chatWindow, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        chatWindow.style.display = 'none';
        console.log('Chat faded out');

        // Step 2: Show dashboard immediately with content
        dashboardScene.style.display = 'block';
        dashboardScene.style.visibility = 'visible';
        console.log('Dashboard scene display set to block and visible');
        gsap.fromTo(
          dashboardScene,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
              console.log('Dashboard scene appeared and animation complete');
              // Start animations immediately while dashboard is fully visible
              showDashboard();
            },
          }
        );
      },
    });
  };

  const animateCounters = () => {
    const counters = document.querySelectorAll('.metric-number');
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target') || '0');
      const obj = { value: 0 };

      gsap.to(obj, {
        value: target,
        duration: 2.5,
        ease: 'power2.out',
        onUpdate: () => {
          counter.textContent = Math.ceil(obj.value).toLocaleString();
        },
      });
    });
  };

  // Scene 4: Brand Finale - Sequential animation with proper timing
  const scene4Sequence = () => {
    setDemoState((prev) => ({ ...prev, currentScene: 4 }));

    const logo = getElementById('finalLogo');
    const brand = getElementById('finalBrand');
    const tagline = getElementById('finalTagline');
    // Note: finalMessage element was removed from JSX, so we don't try to animate it

    // Ensure all elements start hidden
    if (logo) gsap.set(logo, { scale: 0, opacity: 0 });
    if (brand) gsap.set(brand, { y: 50, opacity: 0 });
    if (tagline) gsap.set(tagline, { y: 30, opacity: 0 });

    // 1. Logo appears first (reduced delay)
    addTimeout(() => {
      console.log('=== SCENE 4: Showing logo ===');
      if (logo) {
        gsap.to(logo, {
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
      if (brand) {
        gsap.to(brand, {
          y: 0,
          opacity: 1,
          duration: CONFIG.ANIMATION.SCALE_DURATION,
          ease: 'power3.out',
        });
      }
    }, 1800);

    // 3. Tagline appears (faster)
    addTimeout(() => {
      console.log('=== SCENE 4: Showing tagline ===');
      if (tagline) {
        gsap.to(tagline, {
          y: 0,
          opacity: 1,
          duration: CONFIG.ANIMATION.FADE_DURATION,
          ease: 'power2.out',
        });
      }
    }, 2800);

    // 4. Auto-restart after showing tagline (adjusted timing since no final message)
    addTimeout(() => {
      console.log('=== SCENE 4: Auto-restarting demo ===');
      // Reset and restart the demo
      setDemoState((prev) => ({
        ...prev,
        startTime: Date.now(),
        currentScene: 0,
        isRunning: true,
        isPaused: false,
      }));
      // Clear all timers and restart
      clearAllTimers();
      // Small delay before restart for smooth transition
      setTimeout(() => {
        console.log('Demo automatically restarting...');
      }, 100);
    }, CONFIG.TIMINGS.SCENE4_TOTAL);
  };

  // Handle tab visibility change for auto-pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - pause demo
        if (
          masterTimelineRef.current &&
          demoState.isRunning &&
          !demoState.isPaused
        ) {
          masterTimelineRef.current.pause();
          setDemoState((prev) => ({ ...prev, isPaused: true }));
          console.log('=== DEMO AUTO-PAUSED: Tab hidden ===');
        }
      } else {
        // Tab is visible - resume demo if it was auto-paused
        if (
          masterTimelineRef.current &&
          demoState.isRunning &&
          demoState.isPaused
        ) {
          masterTimelineRef.current.play();
          setDemoState((prev) => ({ ...prev, isPaused: false }));
          console.log('=== DEMO AUTO-RESUMED: Tab visible ===');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [demoState.isRunning, demoState.isPaused]);

  // Initialize demo
  useEffect(() => {
    const initDemo = async () => {
      // Wait for components to mount
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Build master timeline
      const timeline = buildMasterTimeline();

      // Start immediately - no loader
      setTimeout(() => {
        setIsLoaded(true);
        timeline.play();
        setDemoState((prev) => ({
          ...prev,
          isRunning: true,
          startTime: Date.now(),
        }));
      }, 1000); // Just 1 second delay
    };

    initDemo();

    // Cleanup
    return () => {
      clearAllTimers();
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-muted/30 overflow-hidden relative">
      <style>{`
        /* Custom CSS for complex animations that need CSS */
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
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        
        .analyzing {
          opacity: 0.3 !important;
          transform: scale(0.95) !important;
          filter: blur(1px) !important;
        }
        
        .layer {
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .layer.active {
          opacity: 1;
          transform: scale(1);
        }
        
        .data-particle {
          width: 8px;
          height: 8px;
          background: linear-gradient(45deg, #F43F5E, #E11D48);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }
        
        .data-particle.traveling {
          animation: dataFlow 3s ease-in-out;
        }
        
        @keyframes dataFlow {
          0% { left: 0; }
          100% { left: 100%; }
        }
        
        .metric-card.animated {
          animation: slideUpFromBottom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        @keyframes slideUpFromBottom {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .focused {
          border-color: var(--color-brand) !important;
          box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.2) !important;
        }
        
        .hover {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 8px 25px rgba(244, 63, 94, 0.3) !important;
        }
        
        .success {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
        }
        
        .highlight {
          background: linear-gradient(135deg, #F43F5E, #E11D48);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: bold;
          animation: highlightPulse 2s ease-in-out;
        }
        
        .highlight-north-america {
          color: white !important;
          font-weight: bold;
          padding: 2px 4px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        @keyframes highlightPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        
        .data-dot {
          animation: dataPulse 2s ease-in-out infinite;
        }
        
        @keyframes dataPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        /* Micro-interactions for hover effects */
        .interactive-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .interactive-hover:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .interactive-hover:active {
          transform: translateY(0);
          transition-duration: 0.1s;
        }
        
        .button-shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .button-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }
        
        .button-shimmer:hover::before {
          left: 100%;
        }
        
        .card-glow {
          transition: all 0.3s ease;
          position: relative;
        }
        
        .card-glow::after {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, var(--color-brand), var(--color-secondary), var(--color-primary), var(--color-brand));
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .card-glow:hover::after {
          opacity: 0.3;
        }
        
        .metric-card-hover {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .metric-card-hover:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 20px 40px rgba(244, 63, 94, 0.15);
        }
        
        /* Focus management styles */
        .focus-visible {
          outline: 2px solid #F43F5E;
          outline-offset: 2px;
          border-radius: 4px;
        }
        
        button:focus-visible,
        .interactive-element:focus-visible {
          outline: 2px solid #F43F5E;
          outline-offset: 2px;
          box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.1);
        }
        
        /* Remove default focus for mouse users */
        button:focus:not(:focus-visible),
        .interactive-element:focus:not(:focus-visible) {
          outline: none;
          box-shadow: none;
        }
        
        /* Chat Message Animations */
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
        
        /* Smooth push-up animation for existing messages */
        .chat-message-push-up {
          transition: transform 250ms ease-out;
        }
      `}</style>

      {/* Modern Loader - Hidden by default */}
      <div
        id="loader"
        className="fixed inset-0 bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center z-50"
        style={{ display: 'none' }}
      >
        <div className="relative flex items-center justify-center">
          {/* Logo in center */}
          <div
            className="relative z-10"
            style={{
              animation: 'logoPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)',
            }}
          >
            <Image
              src="/image/logo.png"
              alt="BlizzardBerry Logo"
              width={104}
              height={104}
              className="rounded-lg"
              priority
              unoptimized
            />
          </div>

          {/* Animated rings */}
          <div className="absolute w-40 h-40 border-4 border-transparent border-t-brand rounded-full animate-spin"></div>
          <div
            className="absolute w-36 h-36 border-4 border-transparent border-t-secondary rounded-full animate-spin"
            style={{ animationDelay: '-0.3s' }}
          ></div>
          <div
            className="absolute w-32 h-32 border-4 border-transparent border-t-primary rounded-full animate-spin"
            style={{ animationDelay: '-0.6s' }}
          ></div>
          <div
            className="absolute w-28 h-28 border-4 border-transparent border-t-brand/60 rounded-full animate-spin"
            style={{ animationDelay: '-0.9s' }}
          ></div>
        </div>

        {/* Brand text below */}
        <div className="absolute bottom-1/3">
          <div
            className="text-white text-3xl font-bold mb-2 text-center"
            style={{
              animation: 'logoPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)',
            }}
          >
            BlizzardBerry
          </div>
          <div className="text-gray-400 text-lg text-center">Loading...</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-40">
        <div
          id="progressBar"
          className="h-full bg-gradient-to-r from-brand to-secondary transition-all duration-300 ease-out"
          style={{ width: '0%' }}
        ></div>
      </div>

      {/* Scene 1: Create Action - BlizzardBerry Style */}

      {/* Scene 2: AI Processing & Dashboard */}
      <div
        id="scene2"
        className="fixed inset-0 opacity-0"
        style={{ display: 'none' }}
      >
        <div className="absolute inset-0 bg-white"></div>
        {/* Fixed Size Chat Widget */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div
            id="chatWindow"
            className="w-[600px] h-[680px] bg-white flex flex-col transition-all duration-300 ease-out relative overflow-hidden"
          >
            {/* Initial State: Centered Input (hidden for first chat) */}
            <div
              id="chatInitialState"
              className="flex-1 flex items-center justify-center px-6"
              style={{ display: 'none' }}
            >
              <div className="w-full max-w-md">
                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative overflow-visible">
                    <input
                      id="chatInitialInput"
                      type="text"
                      placeholder="Ask a question..."
                      className="w-full px-6 py-4 pr-16 text-base bg-muted rounded-full focus:outline-none transition-all duration-300"
                      spellCheck="false"
                      disabled
                    />
                    {/* Send button inside input field */}
                    <button
                      id="sendButton"
                      className="group absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:scale-110 transition-all duration-300"
                    >
                      {/* Airplane icon - pointing upward and to the right */}
                      <div className="transform -rotate-12 group-hover:-rotate-6 transition-transform duration-300">
                        <svg
                          width="20"
                          height="20"
                          fill="#ef4444"
                          viewBox="0 0 24 24"
                          className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300"
                        >
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation State: Just Messages in Center (shown for first chat) */}
            <div
              id="chatConversationState"
              className="flex-1 flex items-center justify-center"
            >
              {/* Messages Container - centered vertically and horizontally */}
              <div
                id="chatMessages"
                className="w-full max-w-2xl px-6 flex flex-col gap-4"
              >
                {/* Messages will be dynamically added here */}
              </div>
            </div>
          </div>
        </div>

        {/* Removed AI Analysis screen */}
      </div>

      {/* Modern Revenue Dashboard */}
      <div
        id="dashboardScene"
        className="fixed inset-0 z-50 opacity-0"
        style={{ display: 'none' }}
      >
        <div className="absolute inset-0 bg-white"></div>

        {/* Fixed Size Dashboard Widget */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div
            id="dashboardWindow"
            className="w-[600px] h-[680px] bg-white overflow-hidden rounded-3xl transition-all duration-300 ease-out flex flex-col relative"
          >
            <div className="p-6">
              {/* Minimalist Header */}
              <div className="text-center mb-12" id="dashboardHeader">
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2 tracking-tighter leading-tight">
                  Revenue
                </h1>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  North America
                </p>
              </div>

              {/* Hero Metrics - Prominent Display */}
              <div className="grid grid-cols-2 gap-8 mb-12" id="statsGrid">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl font-bold text-foreground mb-1 flex items-baseline justify-center">
                    <span className="text-3xl sm:text-4xl text-muted-foreground mr-1">
                      $
                    </span>
                    <span className="metric-number" data-target="847">
                      0
                    </span>
                    <span className="text-2xl sm:text-3xl text-muted-foreground ml-1">
                      K
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                    Peak Revenue
                  </div>
                  <div className="h-0.5 w-16 bg-indigo-500 mx-auto mt-3 rounded-full"></div>
                </div>

                <div className="text-center">
                  <div className="text-5xl sm:text-6xl font-bold text-foreground mb-1">
                    <span className="metric-number" data-target="18">
                      0
                    </span>
                    <span className="text-2xl sm:text-3xl text-muted-foreground">
                      %
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                    Growth Rate
                  </div>
                  <div className="h-0.5 w-16 bg-secondary mx-auto mt-3 rounded-full"></div>
                </div>
              </div>

              {/* Radial Chart */}
              <div className="h-80 relative" id="chartSection">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[280px]"
                >
                  <RadialBarChart
                    data={CONFIG.CHART.DATA}
                    startAngle={-90}
                    endAngle={380}
                    innerRadius={40}
                    outerRadius={120}
                  >
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent hideLabel nameKey="month" />
                      }
                    />
                    <RadialBar dataKey="revenue" background>
                      <LabelList
                        position="insideStart"
                        dataKey="month"
                        className="fill-white capitalize mix-blend-luminosity"
                        fontSize={11}
                      />
                    </RadialBar>
                  </RadialBarChart>
                </ChartContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 4: Brand Finale - BlizzardBerry Style */}
      <div
        id="scene4"
        className="fixed inset-0 opacity-0 flex flex-col items-center justify-center bg-white"
        style={{ display: 'none' }}
      >
        {/* Logo with modern styling */}
        <div id="finalLogo" className="relative z-10 mb-12 opacity-0">
          <div className="relative">
            <div
              className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center"
              style={{ animation: 'logoPulse 3s infinite' }}
            >
              <Image
                src="/image/logo.png"
                alt="BlizzardBerry Logo"
                width={80}
                height={80}
                priority
                unoptimized
              />
            </div>

            {/* Pulse ring effects */}
            <div
              className="absolute inset-0 w-32 h-32 border-2 border-brand/40 rounded-3xl"
              style={{ animation: 'ringPulse 3s infinite ease-out' }}
            ></div>
          </div>
        </div>

        {/* Brand text with modern styling */}
        <div id="finalBrand" className="text-center mb-12 opacity-0">
          <h1 className="text-7xl font-bold text-foreground mb-4 tracking-tight">
            BlizzardBerry
          </h1>
          <div className="h-2 w-48 bg-gradient-to-r from-[#F43F5E] to-[#1D4ED8] rounded-full mx-auto mb-6"></div>
          <div
            id="finalTagline"
            className="text-2xl text-muted-foreground font-semibold opacity-0 tracking-wide"
          >
            An AI-powered natural language interface for every app
          </div>
        </div>

        {/* Final message removed */}
      </div>
    </div>
  );
}
