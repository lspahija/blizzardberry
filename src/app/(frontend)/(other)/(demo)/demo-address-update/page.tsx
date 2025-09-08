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

export default function AddressUpdateVideo() {
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
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  const typeText = (
    element: HTMLInputElement | HTMLTextAreaElement | null,
    text: string,
    speed = 50,
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

    // Phase 1: Skip intro, go directly to chat
    timeline
      .call(() => {
        setVideoState((prev) => ({ ...prev, currentPhase: 'chat' }));
        showChatInterface();
      })

      // Phase 2: Processing phase (3s for processing bubble)
      .call(
        () => {
          setVideoState((prev) => ({ ...prev, currentPhase: 'processing' }));
          showProcessing();
        },
        [],
        3
      )

      // Phase 3: Result Display (18s for conversation + success message)
      .call(
        () => {
          setVideoState((prev) => ({ ...prev, currentPhase: 'result' }));
        },
        [],
        6
      )

      // Phase 4: Demo-Niko Finale (4s) - comes earlier
      .call(
        () => {
          setVideoState((prev) => ({ ...prev, currentPhase: 'finale' }));
          showFinale();
        },
        [],
        21
      )

      // Phase 5: Complete and restart (2s pause)
      .call(
        () => {
          setVideoState((prev) => ({ ...prev, currentPhase: 'complete' }));
        },
        [],
        25
      );

    masterTimelineRef.current = timeline;
    timeline.play();
  };

  const showChatInterface = () => {
    // Show chat interface directly without intro transition
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById(
      'userInput'
    ) as HTMLTextAreaElement;

    if (chatContainer) {
      // Show chat container immediately
      chatContainer.style.display = 'flex';
      chatContainer.style.opacity = '1';
      gsap.set(chatContainer, { y: 0, opacity: 1 });

      // Start typing user message immediately
      addTimeout(() => {
        if (userInput) {
          userInput.disabled = false;
          userInput.focus();
          typeTextWithScroll(
            userInput,
            'I recently moved to San Francisco\nand need to update my address',
            60,
            () => {
              // Show airplane animation and send with natural pause
              addTimeout(() => {
                triggerAirplane();
              }, 800); // Longer pause before airplane
            }
          );
        }
      }, 500); // Quick delay to let interface settle
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
        text: 'I recently moved to San Francisco and need to update my address',
      });

      // Add processing bubble and then continue directly to AI response
      addTimeout(() => {
        addProcessingBubble();

        // Continue directly to AI response after processing bubble
        addTimeout(() => {
          console.log(
            'Processing complete, transforming bubble to AI response'
          );
          // Transform processing bubble to AI response instead of removing
          const processingBubble = document.getElementById('processingBubble');
          if (processingBubble) {
            const messageContent =
              processingBubble.querySelector('.max-w-md > div');
            if (messageContent) {
              // Smoothly transform the processing bubble to first AI message
              gsap.to(messageContent, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => {
                  messageContent.innerHTML = `<div class="text-base leading-relaxed">I can see you recently moved from New York to San Francisco! What's your new address?</div>`;
                  gsap.to(messageContent, {
                    opacity: 1,
                    duration: 0.4,
                    ease: 'power2.out',
                  });
                },
              });
              // Remove ID so it's treated as normal message
              processingBubble.removeAttribute('id');
            }
          }

          // Continue with rest of conversation
          addTimeout(() => {
            continueWithRestOfConversation();
          }, 1000);
        }, 2000); // Wait 2 seconds after processing bubble appears
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
          ? 'bg-teal-500/15 text-teal-800 hover:scale-[1.02]'
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

    // Ultra-smooth sliding animation with enhanced easing
    gsap.context(() => {
      // Start new message below its final position with subtle scale
      gsap.set(messageDiv, {
        y: 80,
        opacity: 0,
        scale: 0.92,
        rotationX: 15,
      });

      // Animate existing messages up with smooth stagger
      existingMessages.forEach((el, i) => {
        gsap.to(el, {
          y: -totalMove,
          duration: 1.0,
          delay: i * 0.04, // More pronounced stagger for elegant wave
          ease: 'power3.out',
        });
      });

      // Animate new message into position with elegant entrance
      gsap.to(messageDiv, {
        y: 0,
        opacity: 1,
        scale: 1,
        rotationX: 0,
        duration: 1.0,
        delay: 0.15, // Slightly longer delay for better choreography
        ease: 'power3.out',
        clearProps: 'all',
      });
    }, chatMessages);
  };

  const addProcessingBubble = () => {
    addChatMessageWithSlide({
      type: 'received',
      text: `
        <div class="flex items-center space-x-3">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-teal-500/15 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-teal-500/15 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-teal-500/15 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
          <div class="text-base text-muted-foreground">Checking your details...</div>
        </div>
      `,
    });

    // Store reference for later removal
    const allMessages = document.querySelectorAll('.chat-message');
    const processingBubble = allMessages[allMessages.length - 1];
    if (processingBubble) {
      processingBubble.id = 'processingBubble';
    }
  };

  const showProcessing = () => {
    // Processing phase - simplified flow without analysis overlay
    console.log(
      'Processing phase started - will continue directly to AI response'
    );
  };

  const showAnalysisAnimation = () => {
    // ULTRA-SMOOTH cinematic transition to analysis
    console.log('=== Starting CINEMATIC analysis transition ===');
    const processingBubble = document.getElementById('processingBubble');
    const chatContainer = document.getElementById('chatContainer');
    const chatMessages = document.getElementById('chatMessages');

    // Create timeline for synchronized animations
    const tl = gsap.timeline();

    // Step 1: Elegant processing bubble transformation
    if (processingBubble) {
      tl.to(processingBubble, {
        scale: 1.1,
        duration: 0.2,
        ease: 'power2.out',
      }).to(
        processingBubble,
        {
          opacity: 0,
          scale: 0.8,
          y: -20,
          duration: 0.4,
          ease: 'power3.inOut',
          onComplete: () => {
            if (processingBubble.parentNode) {
              processingBubble.parentNode.removeChild(processingBubble);
            }
          },
        },
        '-=0.1'
      );
    }

    // Step 2: Chat messages elegant fade and slide
    if (chatMessages) {
      const messages = chatMessages.querySelectorAll('.chat-message');
      tl.to(
        messages,
        {
          y: -15,
          opacity: 0.3,
          scale: 0.98,
          duration: 0.6,
          stagger: -0.03, // Reverse stagger for wave effect
          ease: 'power2.inOut',
        },
        '-=0.3'
      );
    }

    // Step 3: Chat container cinematic zoom and blur
    if (chatContainer) {
      tl.to(
        chatContainer,
        {
          scale: 0.96,
          opacity: 0.2,
          filter: 'blur(8px)',
          duration: 0.8,
          ease: 'power3.inOut',
        },
        '-=0.5'
      );
    }

    // Step 4: Analysis overlay grand entrance
    tl.call(
      () => {
        console.log('Starting CINEMATIC analysis entrance');
        addAnalysisVisualization();
      },
      [],
      '-=0.2'
    );
  };

  const addAnalysisVisualization = () => {
    console.log('=== Adding analysis visualization as OVERLAY ===');
    const chatContainer = document.getElementById('chatContainer');
    console.log('Chat container found:', !!chatContainer);
    if (!chatContainer) {
      console.error('Chat container not found!');
      return;
    }

    // Clear any existing analysis
    const existingAnalysis = document.getElementById('analysisOverlay');
    if (existingAnalysis) {
      console.log('Removing existing analysis overlay');
      existingAnalysis.remove();
    }

    // Create FULL SCREEN analysis overlay
    const analysisOverlay = document.createElement('div');
    analysisOverlay.className =
      'fixed inset-0 bg-white z-50 flex items-center justify-center';
    analysisOverlay.id = 'analysisOverlay';
    analysisOverlay.innerHTML = `
      <div class="max-w-2xl mx-auto px-8">
        <div class="bg-white rounded-3xl p-10 shadow-2xl border border-gray-200">
          <div class="text-center">
            <div class="text-3xl font-bold text-gray-800 mb-2">Profile Analysis</div>
            <div class="text-lg text-gray-600 mb-8">Processing your relocation request...</div>
            
            <div class="space-y-4">
              <!-- Current Location -->
              <div id="currentLocation" class="flex items-center justify-between bg-gray-50 rounded-2xl p-6 opacity-0 border border-gray-100">
                <div class="flex items-center space-x-4">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span class="text-lg font-medium text-gray-700">Previous Address</span>
                </div>
                <span class="text-lg font-bold text-gray-900">New York, NY</span>
              </div>
              
              <!-- Arrow Animation -->
              <div class="flex justify-center py-4">
                <div id="moveArrow" class="text-5xl opacity-0 transform scale-75 text-gray-400">→</div>
              </div>
              
              <!-- New Location -->
              <div id="newLocation" class="flex items-center justify-between bg-green-50 rounded-2xl p-6 opacity-0 border border-green-100">
                <div class="flex items-center space-x-4">
                  <div class="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                  <span class="text-lg font-medium text-gray-700">New Address</span>
                </div>
                <span class="text-lg font-bold text-green-700">San Francisco, CA</span>
              </div>
              
              <!-- Services to Update -->
              <div id="servicesToUpdate" class="bg-blue-50 rounded-2xl p-6 opacity-0 border border-blue-100">
                <div class="text-center mb-4">
                  <div class="text-lg font-semibold text-gray-800 mb-2">Accounts to Update</div>
                  <div class="text-sm text-gray-600">The following services will be automatically updated</div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add overlay with ULTRA-SMOOTH cinematic entrance
    console.log('Adding CINEMATIC analysis overlay');
    document.body.appendChild(analysisOverlay);

    // Create sophisticated entrance timeline
    const entranceTl = gsap.timeline();

    // Initial state: completely invisible and scaled
    gsap.set(analysisOverlay, {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      background: 'rgba(255, 255, 255, 0)',
    });

    const innerContent = analysisOverlay.querySelector('.bg-white');
    if (innerContent) {
      gsap.set(innerContent, {
        scale: 0.85,
        y: 60,
        opacity: 0,
        rotationY: 5,
        transformPerspective: 1000,
      });
    }

    // Step 1: Elegant backdrop emergence
    entranceTl
      .to(analysisOverlay, {
        opacity: 1,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        duration: 0.8,
        ease: 'power3.out',
      })

      // Step 2: Content grand entrance with perspective
      .to(
        innerContent,
        {
          scale: 1,
          y: 0,
          opacity: 1,
          rotationY: 0,
          duration: 1.0,
          ease: 'power4.out',
          onComplete: () => {
            console.log('CINEMATIC content entrance complete');

            // Step 3: Subtle breathing animation
            gsap.to(innerContent, {
              scale: 1.01,
              duration: 2,
              yoyo: true,
              repeat: -1,
              ease: 'sine.inOut',
            });
          },
        },
        '-=0.4'
      );

    // Step 3: Background final polish
    entranceTl.to(
      analysisOverlay,
      {
        background: 'rgba(255, 255, 255, 1)',
        duration: 0.4,
        ease: 'power2.out',
      },
      '-=0.6'
    );

    // Animate analysis steps (faster)
    addTimeout(() => {
      // Show current location
      const currentLoc = document.getElementById('currentLocation');
      if (currentLoc) {
        gsap.to(currentLoc, { opacity: 1, duration: 0.3 });
      }
    }, 400);

    addTimeout(() => {
      // Show arrow
      const arrow = document.getElementById('moveArrow');
      if (arrow) {
        gsap.to(arrow, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)',
        });
      }
    }, 700);

    addTimeout(() => {
      // Show new location
      const newLoc = document.getElementById('newLocation');
      if (newLoc) {
        gsap.to(newLoc, { opacity: 1, duration: 0.3 });
      }
    }, 1000);

    addTimeout(() => {
      // Show services
      const services = document.getElementById('servicesToUpdate');
      if (services) {
        gsap.to(services, { opacity: 1, duration: 0.3 });

        // Animate service tags (faster)
        const tags = services.querySelectorAll('span');
        tags.forEach((tag, i) => {
          gsap.set(tag, { opacity: 0, x: -10 });
          gsap.to(tag, {
            opacity: 1,
            x: 0,
            duration: 0.2,
            delay: i * 0.05,
            ease: 'power2.out',
          });
        });
      }
    }, 1300);

    // ULTRA-SMOOTH CINEMATIC exit and chat restoration
    addTimeout(() => {
      console.log(
        'Starting CINEMATIC analysis exit with perfect chat restoration'
      );

      // Create master timeline for perfect synchronization
      const exitTl = gsap.timeline();
      const innerContent = analysisOverlay.querySelector('.bg-white');
      const chatContainer = document.getElementById('chatContainer');
      const chatMessages = document.getElementById('chatMessages');

      // Step 1: Content elegant exit with 3D perspective
      if (innerContent) {
        exitTl.to(innerContent, {
          scale: 0.9,
          y: -40,
          opacity: 0,
          rotationY: -5,
          duration: 0.6,
          ease: 'power3.inOut',
        });
      }

      // Step 2: Overlay sophisticated fade with backdrop
      exitTl.to(
        analysisOverlay,
        {
          opacity: 0,
          background: 'rgba(255, 255, 255, 0)',
          backdropFilter: 'blur(0px)',
          duration: 0.7,
          ease: 'power3.inOut',
          onComplete: () => {
            if (analysisOverlay.parentNode) {
              analysisOverlay.parentNode.removeChild(analysisOverlay);
            }
          },
        },
        '-=0.3'
      );

      // Step 3: SIMULTANEOUS chat restoration (starts before overlay fully gone)
      if (chatContainer && chatMessages) {
        // Chat container restoration
        exitTl.to(
          chatContainer,
          {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.5'
        );

        // Messages restoration with cinematic stagger
        const messages = chatMessages.querySelectorAll('.chat-message');
        exitTl.fromTo(
          messages,
          {
            y: 20,
            opacity: 0.3,
            scale: 0.98,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.04,
            ease: 'power4.out',
          },
          '-=0.6'
        );

        // Elegant focus ring
        exitTl
          .to(
            chatContainer,
            {
              boxShadow:
                '0 0 40px rgba(59, 130, 246, 0.08), 0 0 0 1px rgba(59, 130, 246, 0.05)',
              duration: 0.4,
              ease: 'power2.out',
            },
            '-=0.2'
          )
          .to(chatContainer, {
            boxShadow:
              '0 0 0px rgba(59, 130, 246, 0), 0 0 0 0px rgba(59, 130, 246, 0)',
            duration: 0.8,
            delay: 0.4,
            ease: 'power2.out',
            onComplete: () => {
              console.log(
                'CINEMATIC chat restoration complete - BUTTERY SMOOTH!'
              );
              continueWithAIResponse();
            },
          });
      } else {
        // Fallback
        exitTl.call(() => {
          continueWithAIResponse();
        });
      }
    }, 4200); // Show analysis for 4.2 seconds
  };

  const continueWithRestOfConversation = () => {
    console.log('=== Continuing with rest of conversation ===');

    // User response comes earlier for better flow
    addTimeout(() => {
      console.log('Adding user address response');
      addChatMessageWithSlide({
        type: 'sent',
        text: '1847 Union St, San Francisco, CA 94123',
      });

      addTimeout(() => {
        console.log('Adding AI confirmation');
        addChatMessageWithSlide({
          type: 'received',
          text: 'Perfect! Let me update your account with this new address.',
        });

        // Show success animation overlay with smooth chat transition
        addTimeout(() => {
          console.log(
            'Starting smooth transition from chat to success overlay'
          );
          transitionToSuccessOverlay();
        }, 1200); // Slightly faster transition
      }, 2200); // Faster confirmation timing
    }, 1400); // Even faster user response for better flow
  };

  const continueWithAIResponse = () => {
    console.log('=== Starting AI response flow after processing ===');

    // This function is kept for compatibility but now calls the new one
    continueWithRestOfConversation();
  };

  const showResult = () => {
    // This phase is handled by the analysis flow - no action needed
    console.log('Result phase started - chat flow continues from analysis');
  };

  const transitionToSuccessOverlay = () => {
    console.log('=== Starting transition to success dashboard ===');
    const chatContainer = document.getElementById('chatContainer');
    const chatMessages = document.getElementById('chatMessages');

    if (!chatContainer || !chatMessages) return;

    // Step 1: Fade out chat messages
    const messages = chatMessages.querySelectorAll('.chat-message');
    const chatTl = gsap.timeline();

    // Animate messages out
    chatTl
      .to(messages, {
        y: -20,
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        stagger: -0.03,
        ease: 'power2.inOut',
      })

      // Fade out chat container
      .to(
        chatContainer,
        {
          opacity: 0,
          scale: 0.98,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            chatContainer.style.display = 'none';
            showSuccessDashboard();
          },
        },
        '-=0.4'
      );
  };

  const showSuccessDashboard = () => {
    console.log('=== Showing success dashboard ===');

    // Create success dashboard like demo-video style
    const dashboardOverlay = document.createElement('div');
    dashboardOverlay.className =
      'fixed inset-0 bg-white z-50 flex items-center justify-center';
    dashboardOverlay.id = 'successDashboard';

    // Professional success message with modern design
    dashboardOverlay.innerHTML = `
      <div class="max-w-lg mx-auto px-8">
        <div class="bg-white rounded-2xl p-10 shadow-xl border border-gray-200/50 backdrop-blur-sm">
          <!-- Success Icon -->
          <div class="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 success-checkmark">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <!-- Title -->
          <h2 class="text-3xl font-semibold text-gray-900 text-center mb-3">Address Updated</h2>
          <p class="text-gray-600 text-center mb-8">Your account has been successfully updated with your new address.</p>
          
          <!-- Address Card -->
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div class="flex-1">
                <div class="space-y-1">
                  <div class="text-lg font-semibold text-gray-900">1847 Union St</div>
                  <div class="text-base text-gray-600">San Francisco, CA 94123</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add to DOM with clean entrance
    document.body.appendChild(dashboardOverlay);

    // Simple initial state
    gsap.set(dashboardOverlay, {
      opacity: 0,
      scale: 0.9,
    });

    const content = dashboardOverlay.querySelector('.bg-white');
    const icon = dashboardOverlay.querySelector('.success-checkmark');
    const title = dashboardOverlay.querySelector('h2');
    const subtitle = dashboardOverlay.querySelector('p');
    const addressCard = dashboardOverlay.querySelector('.bg-gradient-to-r');

    console.log('Success animation elements:', {
      content: !!content,
      icon: !!icon,
      title: !!title,
      subtitle: !!subtitle,
      addressCard: !!addressCard,
    });

    // Set initial states for staggered animation
    if (content) {
      gsap.set(content, { y: 40, opacity: 0, scale: 0.95 });
    }
    if (icon) {
      gsap.set(icon, { scale: 0, opacity: 0 });
    }
    if (title) {
      gsap.set(title, { y: 20, opacity: 0 });
    }
    if (subtitle) {
      gsap.set(subtitle, { y: 15, opacity: 0 });
    }
    if (addressCard) {
      gsap.set(addressCard, { y: 20, opacity: 0 });
    }

    // Create smooth entrance timeline
    const tl = gsap.timeline();

    // 1. Background fade in - slower and smoother
    tl.to(dashboardOverlay, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'power2.out',
    })

      // 2. Content card entrance - more relaxed
      .to(
        content,
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.0,
          ease: 'power3.out',
        },
        '-=0.4'
      )

      // 3. Success icon appears - gentler bounce
      .to(
        icon,
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'back.out(1.4)',
        },
        '-=0.2'
      )

      // 4. Title appears - slower and elegant
      .to(
        title,
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
        },
        '-=0.4'
      )

      // 5. Subtitle appears - gentle timing
      .to(
        subtitle,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.5'
      )

      // 6. Address card appears - smooth and relaxed
      .to(
        addressCard,
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
        },
        '-=0.4'
      )

      // 7. Celebration effect
      .call(() => {
        addTimeout(() => {
          // Gentle pulse effect on success icon
          if (icon) {
            gsap.to(icon, {
              scale: 1.1,
              duration: 0.3,
              ease: 'power2.out',
              yoyo: true,
              repeat: 1,
            });
          }

          // Subtle particles for celebration
          if (content) {
            for (let i = 0; i < 3; i++) {
              addTimeout(() => {
                createCelebrationParticle(content as HTMLElement);
              }, i * 200);
            }
          }
        }, 400);
      });
  };

  const createCelebrationParticle = (container: HTMLElement) => {
    const particle = document.createElement('div');
    particle.className = 'absolute w-2 h-2 rounded-full pointer-events-none';
    particle.style.background = ['#14B8A6', '#3B82F6', '#1D4ED8'][
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
    // Smooth transition from success dashboard to finale
    const successDashboard = document.getElementById('successDashboard');
    const finaleContainer = document.getElementById('finaleContainer');

    if (finaleContainer) {
      // Prepare finale container
      finaleContainer.style.display = 'flex';
      finaleContainer.style.opacity = '1';
      gsap.set(finaleContainer, { opacity: 0, scale: 0.95 });

      const timeline = gsap.timeline();

      // Cinematic exit of success dashboard
      if (successDashboard) {
        const content = successDashboard.querySelector('.w-\\[600px\\]');
        const statsCards = successDashboard.querySelectorAll('.grid > div');
        const detailsCard = successDashboard.querySelector(
          '.bg-white.rounded-xl.shadow-sm'
        );

        // Create elegant exit sequence
        const exitTl = gsap.timeline();

        // Step 1: Stats cards fade out with stagger
        exitTl
          .to(statsCards, {
            y: -30,
            opacity: 0,
            scale: 0.95,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.in',
          })

          // Step 2: Details card slides down
          .to(
            detailsCard,
            {
              y: 40,
              opacity: 0,
              duration: 0.5,
              ease: 'power2.in',
            },
            '-=0.3'
          )

          // Step 3: Main content scales and rotates out
          .to(
            content,
            {
              scale: 0.85,
              rotationY: -15,
              y: 30,
              opacity: 0,
              duration: 0.6,
              ease: 'power3.in',
            },
            '-=0.4'
          )

          // Step 4: Background fade with perspective
          .to(
            successDashboard,
            {
              opacity: 0,
              scale: 0.9,
              rotationY: -25,
              duration: 0.7,
              ease: 'power3.inOut',
              onComplete: () => {
                if (successDashboard.parentNode) {
                  successDashboard.parentNode.removeChild(successDashboard);
                }
              },
            },
            '-=0.5'
          );
      }

      // Immediately fade in finale container
      timeline.to(
        finaleContainer,
        {
          opacity: 1,
          scale: 1,
          duration: 1.0,
          ease: 'power3.out',
          onComplete: () => {
            animateFinaleElements();
          },
        },
        '-=0.4'
      );
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
          className="h-full bg-gradient-to-r from-blue-500 to-secondary transition-all duration-300 ease-out"
          style={{
            width:
              videoState.currentPhase === 'chat'
                ? '25%'
                : videoState.currentPhase === 'processing'
                  ? '40%'
                  : videoState.currentPhase === 'result'
                    ? '85%'
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
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                transform: 'translateY(50px) scale(0.9)',
              }}
            ></h1>
          </div>

          <div className="relative">
            <p
              id="typingSubtext"
              className="text-3xl font-medium tracking-wide opacity-0 text-muted-foreground"
              style={{
                transform: 'translateY(40px) scale(0.95)',
              }}
            ></p>

            {/* Animated cursor - hidden */}
            <span
              className="inline-block w-1 h-8 bg-blue-500 ml-1 typing-cursor align-middle"
              id="typingCursor"
              style={{ display: 'none' }}
            ></span>
          </div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500/20 rounded-full animate-pulse"></div>
        <div
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-secondary/20 rounded-full animate-bounce"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-primary/20 rounded-full animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-blue-500/30 rounded-full animate-bounce"
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
                  <h2 className="text-4xl font-bold text-muted-foreground mb-2">
                    Pacific Trust Bank
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
                          className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300 text-teal-600 dark:text-teal-400"
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
              videoState.currentPhase === phase ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
