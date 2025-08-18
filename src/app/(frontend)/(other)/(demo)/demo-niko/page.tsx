"use client";

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import Chart from 'chart.js/auto';
import Image from 'next/image';

// Register GSAP plugins
gsap.registerPlugin(TextPlugin);

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
    totalDuration: 48000  // Extended total duration to 48 seconds (+3s for Scene 4)
  });

  const [controlsVisible, setControlsVisible] = useState(false);
  const [, setIsLoaded] = useState(false);

  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);
  const animationSpeedRef = useRef<number>(1);

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
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    intervalsRef.current.forEach(interval => clearInterval(interval));
    timeoutsRef.current = [];
    intervalsRef.current = [];
  };

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

  // Mouse cursor simulation - click effect without blue circle
  const showClickEffect = () => {
    const cursor = document.getElementById('mouseCursor');
    
    if (cursor) {
      // Realistic cursor press animation only
      gsap.to(cursor, {
        scale: 0.9,
        duration: 0.08,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
  };

  // Enhanced scene transition functions with smooth animations
  const showScene = (sceneId: string) => {
    console.log('=== SHOWING SCENE:', sceneId);
    const scene = document.getElementById(sceneId);
    if (scene) {
      scene.style.display = sceneId.includes('scene4') ? 'flex' : 'block';
      scene.style.visibility = 'visible';
      
      // Smooth fade in with scale - faster
      gsap.fromTo(scene, 
        { opacity: 0, scale: 0.95 },
        { 
          opacity: 1, 
          scale: 1,
          duration: 0.5, 
          ease: "power2.out"
        }
      );
      console.log('Scene', sceneId, 'is now smoothly transitioning in');
    } else {
      console.error('Scene not found:', sceneId);
    }
  };

  const hideScene = (sceneId: string) => {
    const scene = document.getElementById(sceneId);
    if (scene) {
      // Smooth fade out with scale
      gsap.to(scene, {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: "power2.in",
        onComplete: () => {
          if (scene) scene.style.display = 'none';
        }
      });
    }
  };

  // Typing animation function
  const typeText = (element: HTMLInputElement | null, text: string, speed = 50, callback?: () => void) => {
    if (!element) return;
    element.value = '';
    let i = 0;
    const type = () => {
      if (i < text.length) {
        element.value += text.charAt(i);
        i++;
        addTimeout(type, speed);
      } else if (callback) {
        // Typing completed, call the callback
        callback();
      }
    };
    type();
  };


  // Chart creation function
  const createChart = () => {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Start with full data immediately visible
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        datasets: [{
          label: 'Peak Revenue ($K)',
          data: [650, 720, 580, 847, 620, 750], // Higher numbers to match the scale up to 1000K
          backgroundColor: '#3B82F6',  // Blue-500 like landing page
          borderColor: '#2563EB',      // Blue-600 for border
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1000,  // Increased to show up to 1000K
            grid: { color: 'rgba(59, 130, 246, 0.1)' },  // Blue grid color
            ticks: {
              color: '#64748b',
              font: { family: 'Inter', size: 12 },
              stepSize: 100,  // Steps of 100 for round numbers
              callback: function(value) {
                // Show round numbers: 100K, 200K, 300K, etc.
                if (value === 0) return '0';
                if (value % 100 === 0) return value + 'K';
                return '';  // Hide non-round numbers
              }
            }
          },
          x: {
            grid: { color: 'rgba(59, 130, 246, 0.1)' },  // Blue grid color
            ticks: {
              color: '#64748b',
              font: { family: 'Inter', size: 12 }
            }
          }
        }
      }
    });

    // Chart appears with full data immediately - no animation delay needed
  };

  // Master Timeline using GSAP - recreating original timing but with GSAP control
  const buildMasterTimeline = () => {
    const tl = gsap.timeline({ 
      repeat: -1,
      onComplete: () => {
        // Auto-restart: reset timing and restart
        setDemoState(prev => ({ 
          ...prev, 
          startTime: Date.now(),
          currentScene: 0,
          isRunning: true,
          isPaused: false
        }));
        // Small delay before restart for smooth transition
        setTimeout(() => {
          clearAllTimers();
        }, 500);
      }
    });

    // Start directly with Scene 2 - Chat (reduced initial delay)
    tl.addLabel("scene2Start", 0.2)
      .call(() => {
        setControlsVisible(true);
      }, undefined, 0)
      .call(() => showScene('scene2'), undefined, "scene2Start")
      .call(() => {
        // Start Scene 2 animations - direct chat conversation
        scene2Sequence();
      }, undefined, "scene2Start+=0.3")
      .call(() => {
        hideScene('scene2');
      }, undefined, "scene2Start+=45");  // Extended to cover full flow including tickets

    // Scene 4 is now triggered directly from hideTicketsDashboard()

    masterTimelineRef.current = tl;
    return tl;
  };


  // Scene 2: AI Processing & Dashboard - exact recreation
  const scene2Sequence = () => {
    setDemoState(prev => ({ ...prev, currentScene: 2 }));

    // Start chat conversation immediately - no delay
    startChatConversation();

    // Transition is now handled directly by airplane boundary detection - no waiting needed

    // AI architecture is now triggered directly from analyzing bubble's onComplete callback

    // Dashboard is now triggered directly from AI analysis completion

    // Dashboard hiding is now handled directly in showDashboard() function
  };

  // Transition is now handled directly by airplane boundary detection

  const startChatConversation = () => {
    // Show chat window immediately with fade-in effect
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) {
      chatWindow.style.display = 'flex';
      gsap.fromTo(chatWindow,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
      );
    }

    const messages = [
      { type: 'sent', text: 'Show me revenue numbers for North America.' }
    ];

    // Start typing simulation after chat window appears
    addTimeout(() => {
      simulateTypingAndSend();
    }, 800);

    const addMessage = (message: { type: string; text: string }, messageIndex: number) => {
      const chatMessages = document.getElementById('chatMessages');
      if (!chatMessages) return;

      const messageDiv = document.createElement('div');
      messageDiv.className = `flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} chat-message`;
      
      // Start with hidden state for smooth animation - less bouncy for stability
      messageDiv.style.opacity = '0';
      messageDiv.style.transform = 'translateY(20px)';
      messageDiv.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
      
      // For the sent message with North America, initially show without highlighting
      let messageText = message.text;
      if (message.type === 'sent' && message.text.includes('North America')) {
        messageText = 'Show me revenue numbers for North America.'; // Plain text first
      }
      
      messageDiv.innerHTML = `
        <div class="max-w-md px-5 py-3 rounded-2xl transition-all duration-300 ${
          message.type === 'sent' 
            ? 'bg-brand text-primary-foreground hover:scale-105' 
            : 'bg-muted text-foreground hover:scale-[1.02] transition-all duration-300'
        }">
          <div class="text-base leading-relaxed" id="messageText-${messageIndex}">${messageText}</div>
        </div>
      `;
      
      // Append to end (new messages at bottom)
      chatMessages.appendChild(messageDiv);
      
      // Trigger smooth entrance animation with slight delay for stability
      setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
      }, 50);
      
      // Trigger callbacks after animation
      setTimeout(() => {
        if (message.type === 'sent' && message.text.includes('North America')) {
          showInitialAnalyzingBubble();
        }
      }, 300); // After animation completes
    };

    const simulateTypingAndSend = () => {
      const chatInitialInput = document.getElementById('chatInitialInput') as HTMLInputElement;
      const cursor = document.getElementById('mouseCursor');
      
      if (!chatInitialInput || !cursor) return;

      // Show the initial state for typing
      const initialState = document.getElementById('chatInitialState');
      const conversationState = document.getElementById('chatConversationState');
      
      if (initialState && conversationState) {
        initialState.style.display = 'flex';
        conversationState.style.display = 'none';
      }

      // Enable input
      chatInitialInput.disabled = false;
      
      // Show cursor and move to input (faster)
      addTimeout(() => {
        cursor.style.opacity = '1';
        gsap.to(cursor, {
          left: '50%',
          top: '50%',
          duration: 0.6,
          ease: "power2.inOut"
        });
      }, 100);

      // Click on input and start typing (faster)
      addTimeout(() => {
        showClickEffect();
        chatInitialInput.focus();
        
        addTimeout(() => {
          typeText(chatInitialInput, "Show me revenue numbers for North America.", 50, () => {
            // Callback when typing is completely finished (after the dot is added)
            console.log('Typing completed, moving mouse to send button');
            moveMouseToSendButton();
          });
        }, 300);
      }, 1000);

      // Function to move mouse to send button (called from typing callback)
      const moveMouseToSendButton = () => {
        // Get precise send button position dynamically
        const sendButton = document.getElementById('sendButton');
        if (sendButton) {
          const rect = sendButton.getBoundingClientRect();
          const buttonCenterX = rect.left + rect.width / 2;
          const buttonCenterY = rect.top + rect.height / 2;
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          gsap.to(cursor, {
            left: `${(buttonCenterX / viewportWidth) * 100}%`,
            top: `${(buttonCenterY / viewportHeight) * 100}%`,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
              // Click the button after mouse reaches it
              addTimeout(() => {
                clickSendButton();
              }, 600); // Wait 600ms after reaching the button
            }
          });
          
          console.log(`Send button positioned at: ${(buttonCenterX / viewportWidth) * 100}% x ${(buttonCenterY / viewportHeight) * 100}%`);
        }
      };

      // Function to click send button and trigger airplane animation
      const clickSendButton = () => {
        showClickEffect();
        console.log('Mouse clicked send button - triggering airplane');
        
        // Hide cursor after brief pause to see click effect
        addTimeout(() => {
          cursor.style.opacity = '0';
        }, 100);
        
        // Trigger fast airplane animation after click effect
        addTimeout(() => {
          const sendButton = document.getElementById('sendButton');
          if (sendButton) {
            // Set higher z-index so airplane flies over everything
            sendButton.style.zIndex = '1000';
            
            let transitionTriggered = false; // Flag to prevent multiple transitions
            
            gsap.to(sendButton, {
              x: 500,           // Even further distance to exit screen
              y: -20,           // Slight upward trajectory
              rotation: -6,     // Rotate to match flight direction
              scale: 1.1,       // Slight grow
              duration: 0.25,   // Ultra fast - 250ms
              ease: "power1.out", // Fast exit curve
              onUpdate: function() {
                // Check if airplane has completely exited the screen
                if (sendButton && !transitionTriggered) {
                  const buttonRect = sendButton.getBoundingClientRect();
                  const viewportWidth = window.innerWidth;
                  
                  // If button has moved completely past the right edge of the screen
                  if (buttonRect.left > viewportWidth) {
                    console.log('First chat airplane has completely exited screen - triggering transition');
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
                  console.log('First chat airplane animation complete - fallback trigger');
                  triggerFirstChatTransition();
                }
              }
          });
          } else {
            // No fallback - only airplane animation should trigger transition
            console.error('Send button not found for airplane animation');
          }
        }, 150); // Brief pause to see click effect before airplane starts
        
        // Function to handle immediate first chat transition when airplane exits
        function triggerFirstChatTransition() {
          console.log('=== TRIGGERING FIRST CHAT TRANSITION IMMEDIATELY ===');
          console.trace('Call stack for first chat transition:');
          
          const initialState = document.getElementById('chatInitialState');
          const conversationState = document.getElementById('chatConversationState');
          
          if (initialState && conversationState) {
            initialState.style.display = 'none';
            conversationState.style.display = 'flex';
          }
          
          // Add the message immediately
          const message = { type: 'sent', text: 'Show me revenue numbers for North America.' };
          addChatMessage(message);
          
          // Show analyzing bubble quickly after message appears
          addTimeout(() => {
            showInitialAnalyzingBubble();
          }, 300);
        }
      };
    };
  };

  let initialAnalyzingBubbleDiv: HTMLElement | null = null;

  const showInitialAnalyzingBubble = () => {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Show analyzing bubble first
    addTimeout(() => {
      // Get existing messages for elegant sliding animation
      const existingMessages = Array.from(chatMessages.querySelectorAll('.chat-message'));
      
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
          y: 60,  // Start from below its final position
          opacity: 0
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
            y: isNewBubble ? 0 : -totalMove,  // New bubble goes to 0, others move up
            opacity: 1,
            duration: 0.8,
            delay: i * 0.02,  // Very subtle stagger for smooth wave effect
            ease: "power2.out",
            clearProps: "all"
          });
        });
        
      }, chatMessages);

      // Start AI analysis after chat with analyzing bubble is visible
      addTimeout(() => {
        startAIArchitecture();
      }, 1800); // Time to see chat + analyzing bubble before analysis
    }, 300);
  };

  const highlightNorthAmericaInChat = () => {
    // Find the sent message containing North America
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const sentMessages = chatMessages.querySelectorAll('.flex.justify-end');
    sentMessages.forEach((messageDiv) => {
      const textDiv = messageDiv.querySelector('div:last-child div');
      if (textDiv && textDiv.textContent?.includes('North America')) {
        // Replace text with bold version (no yellow highlight)
        textDiv.innerHTML = 'Show me revenue numbers for <span style="font-weight: bold;">North America</span>.';
      }
    });
  };

  // Animate Step 2 processing cards with counters - faster
  const animateProcessingCards = () => {
    const cards = document.querySelectorAll('.processing-card');
    
    cards.forEach((card, index) => {
      const delay = parseInt(card.getAttribute('data-delay') || '0') / 2; // Half the delay
      
      // Animate card appearance - quicker
      addTimeout(() => {
        gsap.fromTo(card,
          { opacity: 0, y: 20, scale: 0.95 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.4, 
            ease: "back.out(1.7)"
          }
        );
        
        // Animate counter - faster
        const counterElement = card.querySelector('.counter-number');
        if (counterElement) {
          const target = parseInt(counterElement.getAttribute('data-target') || '0');
          const obj = { value: 0 };
          
          gsap.to(obj, {
            value: target,
            duration: 1.8, // Slower counting for better visibility
            ease: "power2.out",
            onUpdate: () => {
              if (target >= 1000) {
                counterElement.textContent = (obj.value / 1000).toFixed(1) + 'K';
              } else {
                counterElement.textContent = Math.ceil(obj.value).toString() + (target === 15 ? '%' : '');
              }
            }
          });
        }
      }, delay);
    });
  };

  // Animate Step 3 completion sequence - much faster
  const animateCompletionSequence = () => {
    const completionItems = document.querySelectorAll('.completion-item');
    
    completionItems.forEach((item, index) => {
      const order = parseInt(item.getAttribute('data-order') || '1');
      const delay = (order - 1) * 300; // Much faster - 300ms between each completion
      
      addTimeout(() => {
        const checkmark = item.querySelector('.checkmark');
        const pingEffect = item.querySelector('.ping-effect');
        
        if (pingEffect) {
          (pingEffect as HTMLElement).style.opacity = '0.6';
          addTimeout(() => {
            (pingEffect as HTMLElement).style.opacity = '0';
          }, 200); // Faster ping effect
        }
        
        if (checkmark) {
          gsap.fromTo(checkmark,
            { opacity: 0, scale: 0, rotation: -90 },
            { 
              opacity: 1, 
              scale: 1, 
              rotation: 0,
              duration: 0.3, // Faster checkmark
              ease: "back.out(2.7)"
            }
          );
        }
        
        // Quick completion celebration
        gsap.fromTo(item,
          { scale: 1 },
          { 
            scale: 1.05, // Smaller scale
            duration: 0.15, // Faster celebration
            yoyo: true,
            repeat: 1,
            ease: "power2.out"
          }
        );
      }, delay);
    });
  };

  const startAIArchitecture = () => {
    console.log('=== STARTING PROFESSIONAL AI ANALYSIS TRANSITION ===');
    const chatWindow = document.getElementById('chatWindow');
    const aiArchitecture = document.getElementById('aiArchitecture');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatWindow || !aiArchitecture || !chatMessages) {
      console.error('Missing chat or analysis elements');
      return;
    }

    // Step 1: Clear chat animation - animate entire message container
    const allChatMessages = chatMessages.querySelectorAll('.chat-message');
    if (allChatMessages.length > 0) {
      // Animate the entire chat messages container with transform and opacity simultaneously  
      chatMessages.style.transition = 'transform 500ms ease-in-out, opacity 500ms ease-in-out';
      chatMessages.style.transform = 'translateY(-100%)';
      chatMessages.style.opacity = '0';
      
      // Wait for clear chat animation to complete, then animate chat window
      setTimeout(() => {
        // Reset chat messages container for next conversation
        chatMessages.innerHTML = '';
        chatMessages.style.transform = 'translateY(0)';
        chatMessages.style.opacity = '1';
        chatMessages.style.transition = '';
        
        animateChatWindow();
      }, 500); // Wait for clear chat animation to complete
    } else {
      // No messages to animate, proceed directly to chat window animation
      animateChatWindow();
    }
    
    function animateChatWindow() {
      // Step 2: Elegant chat window disappearance with scale down + fade out
      gsap.to(chatWindow, {
        scale: 0.85,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
      onComplete: () => {
        chatWindow.style.display = 'none';
        console.log('Chat elegantly scaled down and hidden');
        
        // Step 2: Immediate professional analysis card appearance
        aiArchitecture.style.display = 'block';
        gsap.fromTo(aiArchitecture,
          { 
            scale: 0.8, 
            opacity: 0,
            rotationY: -10 
          },
          { 
            scale: 1, 
            opacity: 1, 
            rotationY: 0,
            duration: 0.8,
            ease: "back.out(1.4)",
            onComplete: () => {
              console.log('Professional analysis card appeared, starting enhanced 3-step sequence');
            }
          }
        );
      }
    });
    } // Close animateChatWindow function

    // Modern Analysis - Single Progressive Screen
    addTimeout(() => {
      const analysisView = document.getElementById('analysisStep1');
      if (analysisView) {
        // Show main analysis view
        gsap.fromTo(analysisView,
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
              // Start progressive step animations
              startProgressiveAnalysis();
            }
          }
        );
      }
    }, 300);

    // Exit to Dashboard after all steps complete
    addTimeout(() => {
      const analysisView = document.getElementById('analysisStep1');
      
      if (analysisView) {
        gsap.to(analysisView, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.in",
          onComplete: () => {
            // Smooth analysis exit without scaling
            gsap.to(aiArchitecture, { 
              opacity: 0,
              duration: 0.5,
              ease: "power2.in",
              onComplete: () => {
                aiArchitecture.style.display = 'none';
                console.log('=== ANALYSIS COMPLETE: Showing dashboard ===');
                startDashboardTransition();
              }
            });
          }
        });
      }
    }, 6500); // Total analysis time: 6.5 seconds (1 second longer than before)
  };

  // New Progressive Analysis Animation System
  const startProgressiveAnalysis = () => {
    console.log('=== STARTING PROGRESSIVE ANALYSIS ANIMATIONS ===');
    
    // Step 1: Complete first step (Data Fetching)
    addTimeout(() => {
      completeAnalysisStep('step1', 'Complete');
      startAnalysisStep('step2');
    }, 800);
    
    // Step 2: Complete second step (Analysis)
    addTimeout(() => {
      completeAnalysisStep('step2', 'Complete');
      startAnalysisStep('step3');
    }, 2000);
    
    // Step 3: Complete final step (Dashboard)
    addTimeout(() => {
      completeAnalysisStep('step3', 'Ready');
      // Update main title for completion instantly to avoid layout shifts
      const title = document.getElementById('analysisTitle');
      const subtitle = document.getElementById('analysisSubtitle');
      if (title && subtitle) {
        title.textContent = 'Analysis Complete';
        subtitle.textContent = 'Revenue dashboard is ready to view';
      }
    }, 3200);
  };
  
  const startAnalysisStep = (stepId: string) => {
    const step = document.getElementById(stepId);
    if (!step) return;
    
    // Activate step - instantly set opacity to avoid layout shift
    step.style.opacity = '1';
    
    // Update status
    const status = step.querySelector('.step-status');
    if (status) {
      status.textContent = 'Processing...';
    }
  };
  
  const completeAnalysisStep = (stepId: string, completionText: string) => {
    const step = document.getElementById(stepId);
    if (!step) return;
    
    const status = step.querySelector('.step-status');
    
    if (status) {
      // Update status instantly to avoid any layout shifts
      status.textContent = completionText;
      status.className = 'step-status text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg w-[90px] text-center';
    }
  };

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
    const existingMessages = Array.from(chatMessages.querySelectorAll('.chat-message'));
    const hasMessages = existingMessages.length > 0;
    const slideOutDelay = hasMessages ? 650 : 0;
    
    if (hasMessages) {
      // Animate all messages sliding up and fading out
      existingMessages.forEach((msg, index) => {
        msg.style.transition = 'transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 600ms ease-out';
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
      showUserTypingAnimation('Show me today\'s support tickets.');
    }, slideOutDelay + 200); // Start typing immediately after input appears

    // Transition is now handled by airplane animation in showUserTypingAnimation

    // User message appears in chat after transition
    addTimeout(() => {
      addChatMessage({
        type: 'sent',
        text: 'Show me today\'s support tickets.'
      }, false);
    }, slideOutDelay + 4000); // Adjusted timing

    // Agent responds directly and smoothly
    addTimeout(() => {
      addChatMessage({
        type: 'received',
        text: 'We have 3 tickets today:\n\n• 2 Resolved (billing & features)\n• 1 Open (high-priority bug)\n\nWant to see the full details?'
      }, true);
    }, slideOutDelay + 5500); // Adjusted to slideOutDelay + timing

    // User responds YES (key moment - make it prominent)
    addTimeout(() => {
      console.log('=== SENDING YES MESSAGE ===');
      addChatMessage({
        type: 'sent',
        text: 'Yes.'
      }, false);
      
      // Show tickets dashboard after YES
      addTimeout(() => {
        showTicketsDashboard();
      }, 1800); // Normal timing
    }, slideOutDelay + 8500);  // Adjusted to slideOutDelay + timing
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
      chatMessages.style.transition = 'transform 500ms ease-in-out, opacity 500ms ease-in-out';
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
    chatWindow.className = "w-[600px] h-[680px] bg-white flex flex-col transition-all duration-300 ease-out relative overflow-hidden";
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
            <div class="text-2xl font-bold mb-1 ticket-stat text-secondary" data-target="3" style="opacity: 0;">0</div>
            <div class="text-xs text-muted-foreground font-medium" style="opacity: 0;">Total</div>
          </div>
          <div class="bg-white rounded-lg p-3 text-center stats-card hover:scale-105 hover:-translate-y-1 transition-all duration-300" style="opacity: 0; transform: translateY(30px) scale(0.9);">
            <div class="text-2xl font-bold mb-1 ticket-stat text-emerald-600" data-target="2" style="opacity: 0;">0</div>
            <div class="text-xs text-muted-foreground font-medium" style="opacity: 0;">Resolved</div>
          </div>
          <div class="bg-white rounded-lg p-3 text-center stats-card hover:scale-105 hover:-translate-y-1 transition-all duration-300" style="opacity: 0; transform: translateY(30px) scale(0.9);">
            <div class="text-2xl font-bold mb-1 ticket-stat text-brand" data-target="1" style="opacity: 0;">0</div>
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
                  <div class="w-2 h-2 bg-brand rounded-full"></div>
                  <div class="text-sm font-semibold text-foreground">#12847</div>
                </div>
                <span class="px-2 py-1 bg-brand/10 text-brand text-xs rounded-full font-medium">Open</span>
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
                  <div class="w-2 h-2 bg-secondary rounded-full"></div>
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
          y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)"
        });
      }
    }, 300);
    
    addTimeout(() => {
      const headerSubtitle = document.getElementById('header-subtitle');
      if (headerSubtitle) {
        gsap.to(headerSubtitle, {
          y: 0, opacity: 1, duration: 0.6, ease: "power2.out"
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
            ease: "power2.out",
            onComplete: () => {
              // Then animate the content inside
              const counter = card.querySelector('.ticket-stat');
              const label = card.querySelector('.text-xs');
              
              if (counter && label) {
                // Show the text elements
                gsap.to([counter, label], {
                  opacity: 1,
                  duration: 0.3,
                  stagger: 0.1
                });
                
                // Animate the counter
                const target = parseInt(counter.getAttribute('data-target') || '0');
                const obj = { value: 0 };
                gsap.to(obj, {
                  value: target,
                  duration: 1.8,
                  ease: "power2.out",
                  onUpdate: () => {
                    counter.textContent = Math.ceil(obj.value).toString();
                  }
                });
              }
            }
          });
        }, index * 200);
      });
    }, 1100);
    
    // Step 4: Animate tickets section
    addTimeout(() => {
      const ticketsSection = document.getElementById('tickets-section');
      if (ticketsSection) {
        gsap.to(ticketsSection, {
          y: 0, opacity: 1, duration: 0.7, ease: "power2.out",
          onComplete: () => {
            // Animate section header
            const sectionHeader = ticketsSection.querySelector('h3');
            if (sectionHeader) {
              gsap.to(sectionHeader, {
                opacity: 1, duration: 0.4
              });
            }
          }
        });
      }
    }, 1800);
    
    // Step 5: Animate individual ticket rows
    addTimeout(() => {
      const rows = document.querySelectorAll('.ticket-row');
      rows.forEach((row, index) => {
        addTimeout(() => {
          gsap.to(row, {
            x: 0, opacity: 1, duration: 0.5, ease: "power2.out"
          });
        }, index * 150);
      });
    }, 2100);
    
    // Hide dashboard after 5 seconds (2 seconds longer for viewing)
    addTimeout(() => {
      hideTicketsDashboard();
    }, 5000); // Tickets dashboard shows for 5 seconds
  };

  const hideTicketsDashboard = () => {
    console.log('=== HIDING TICKETS DASHBOARD ===');
    const chatWindow = document.getElementById('chatWindow');
    
    if (chatWindow) {
      gsap.to(chatWindow, {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          chatWindow.style.display = 'none';
          console.log('Tickets dashboard removed, showing Scene 4');
          // Immediately show Scene 4 and start its sequence
          showScene('scene4');
          scene4Sequence();
        }
      });
    }
  };

  const addChatMessage = (message: { type: string; text: string }, isMultiline = false) => {
    console.log('=== ADDING CHAT MESSAGE ===', message.text);
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
      console.error('Chat messages container not found!');
      return;
    }

    // Format text for multiline with bullet points
    let formattedText = message.text;
    if (isMultiline) {
      formattedText = message.text
        .split('\n')
        .map(line => line.trim())
        .join('<br>');
    }
    
    // Clean FLIP Animation - works with gap instead of space-y
    const existingMessages = Array.from(chatMessages.querySelectorAll('.chat-message'));
    
    // Capture initial positions using getBoundingClientRect for accuracy
    const initialPositions = existingMessages.map((el) => {
      const rect = el.getBoundingClientRect();
      const containerRect = chatMessages.getBoundingClientRect();
      return {
        el,
        y: rect.top - containerRect.top
      };
    });

    // Create the new message
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

    // Add to DOM - this causes layout shift with gap (not margin)
    chatMessages.appendChild(messageDiv);

    // Smooth sliding animation - everything slides up naturally
    gsap.context(() => {
      // Start new message below its final position
      gsap.set(messageDiv, { 
        y: 60,  // Start from below its final position
        opacity: 0
      });
      
      // Calculate how much everything needs to move up
      const messageHeight = messageDiv.offsetHeight;
      const gap = 16; // gap-4 = 1rem = 16px
      const totalMove = messageHeight + gap;
      
      // Animate everything up together smoothly
      const allElements = [...existingMessages, messageDiv];
      
      allElements.forEach((el, i) => {
        const isNewMessage = el === messageDiv;
        
        gsap.to(el, {
          y: isNewMessage ? 0 : -totalMove,  // New message goes to 0, others move up by message height + gap
          opacity: 1,
          duration: 0.8,
          delay: i * 0.02,  // Very subtle stagger for smooth wave effect
          ease: "power2.out",
          clearProps: "all"
        });
      });
      
    }, chatMessages);
  };

  let analyzingBubbleDiv: HTMLElement | null = null;

  const showAnalyzingBubble = () => {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Get existing messages for elegant sliding animation
    const existingMessages = Array.from(chatMessages.querySelectorAll('.chat-message'));

    analyzingBubbleDiv = document.createElement('div');
    analyzingBubbleDiv.className = 'flex justify-start chat-message';
    
    analyzingBubbleDiv.innerHTML = `
      <div class="bg-muted px-5 py-3 rounded-3xl max-w-md border-[2px] border-border shadow-md hover:shadow-lg transition-all duration-300">
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
    chatMessages.appendChild(analyzingBubbleDiv);
    
    // Smooth sliding animation matching the updated chat message style
    gsap.context(() => {
      // Start analyzing bubble below its final position
      gsap.set(analyzingBubbleDiv, { 
        y: 60,  // Start from below its final position
        opacity: 0
      });
      
      // Calculate how much everything needs to move up
      const bubbleHeight = analyzingBubbleDiv.offsetHeight;
      const gap = 16; // gap-4 = 1rem = 16px
      const totalMove = bubbleHeight + gap;
      
      // Animate everything up together smoothly
      const allElements = [...existingMessages, analyzingBubbleDiv];
      
      allElements.forEach((el, i) => {
        const isNewBubble = el === analyzingBubbleDiv;
        
        gsap.to(el, {
          y: isNewBubble ? 0 : -totalMove,  // New bubble goes to 0, others move up
          opacity: 1,
          duration: 0.8,
          delay: i * 0.02,  // Very subtle stagger for smooth wave effect
          ease: "power2.out",
          clearProps: "all"
        });
      });
      
    }, chatMessages);
  };

  const hideAnalyzingBubble = () => {
    if (analyzingBubbleDiv && analyzingBubbleDiv.parentNode) {
      // Smooth slide-down and fade-out
      analyzingBubbleDiv.style.opacity = '0';
      analyzingBubbleDiv.style.transform = 'translateY(-10px) scale(0.95)';
      
      setTimeout(() => {
        if (analyzingBubbleDiv && analyzingBubbleDiv.parentNode) {
          analyzingBubbleDiv.parentNode.removeChild(analyzingBubbleDiv);
        }
      }, 250);
    }
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
      ease: "power2.in",
      onComplete: () => {
        initialState.style.display = 'none';
        
        // Show conversation state
        conversationState.style.display = 'flex';
        gsap.fromTo(conversationState,
          { opacity: 0, scale: 0.95 },
          { 
            opacity: 1, 
            scale: 1,
            duration: 0.5, 
            ease: "power2.out"
          }
        );
      }
    });
  };

  // User typing animation in input field
  const showUserTypingAnimation = (text: string) => {
    const inputField = document.querySelector('#chatInitialInput') as HTMLInputElement;
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
              x: 500,           // Even further distance to exit screen
              y: -20,           // Slight upward trajectory
              rotation: -6,     // Rotate to match flight direction
              scale: 1.1,       // Slight grow
              duration: 0.25,   // Ultra fast - 250ms
              ease: "power1.out", // Fast exit curve
              onUpdate: function() {
                // Check if airplane has completely exited the screen
                if (sendButton) {
                  const buttonRect = sendButton.getBoundingClientRect();
                  const viewportWidth = window.innerWidth;
                  
                  // If button has moved completely past the right edge of the screen
                  if (buttonRect.left > viewportWidth) {
                    console.log('Tickets airplane has completely exited screen - triggering transition');
                    // Trigger immediate transition to conversation
                    this.kill(); // Stop the animation
                    triggerTicketsTransition();
                  }
                }
              },
              onComplete: () => {
                console.log('Tickets airplane animation complete');
                triggerTicketsTransition();
              }
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
    
    // Start counters and chart immediately when dashboard appears
    console.log('Starting counter animation and chart immediately');
    animateCounters();
    createChart();
    
    // Hide dashboard after it has been displayed for 5 seconds
    addTimeout(() => {
      console.log('=== HIDING DASHBOARD, RETURNING TO CHAT ===');
      const dashboardScene = document.getElementById('dashboardScene');
      const chatWindow = document.getElementById('chatWindow');
      
      if (dashboardScene) {
        // Slide Away Effect - kartica klizi lijevo i nestaje
        gsap.to(dashboardScene, {
          x: '-100vw',  // Klizi lijevo van ekrana
          opacity: 0.3,  // Blago fade tijekom klizanja
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            dashboardScene.style.display = 'none';
            dashboardScene.style.visibility = 'hidden';
            // Reset position za sljedeći put
            gsap.set(dashboardScene, { x: 0, opacity: 1 });
            console.log('Revenue dashboard completely hidden');
          }
        });
      }
      
      // Slide In Effect - nova kartica klizi s desne strane
      if (chatWindow) {
        // Reset chat window to original dimensions and styles
        chatWindow.className = "w-[600px] h-[680px] bg-white flex flex-col transition-all duration-300 ease-out relative overflow-hidden";
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
        
        gsap.fromTo(chatWindow,
          { opacity: 0 },  // Start invisible but in correct position
          { 
            opacity: 1, 
            duration: 0.6, 
            delay: 0.3,  // Kratka pauza nakon što prethodna kartica izađe
            ease: "power2.out"  // Smooth deceleration
          }
        );
      }
      
      showScene('scene2');
      
      // Wait for dashboard hide animation to complete before starting tickets
      addTimeout(() => {
        continueConversationAfterDashboard();
      }, 1200); // Wait for slide-away animation to complete
    }, 5000); // Dashboard shows for 5 seconds
  };

  const startDashboardTransition = () => {
    console.log('=== STARTING DASHBOARD TRANSITION ===');
    const aiArchitecture = document.getElementById('aiArchitecture');
    const dashboardScene = document.getElementById('dashboardScene');
    
    if (!aiArchitecture || !dashboardScene) {
      console.error('Missing elements for transition');
      return;
    }
    
    // Step 1: Fade out analysis
    gsap.to(aiArchitecture, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        aiArchitecture.style.display = 'none';
        console.log('Analysis faded out');
        
        // Step 2: Show dashboard immediately with content
        dashboardScene.style.display = 'block';
        dashboardScene.style.visibility = 'visible';
        console.log('Dashboard scene display set to block and visible');
        gsap.fromTo(dashboardScene,
          { opacity: 0, scale: 0.95 },
          { 
            opacity: 1,
            scale: 1, 
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
              console.log('Dashboard scene appeared and animation complete');
              // Start animations immediately while dashboard is fully visible
              showDashboard();
            }
          }
        );
      }
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
        ease: "power2.out",
        onUpdate: () => {
          counter.textContent = Math.ceil(obj.value).toLocaleString();
        }
      });
    });
  };

  // Scene 4: Brand Finale - Sequential animation with proper timing
  const scene4Sequence = () => {
    setDemoState(prev => ({ ...prev, currentScene: 4 }));

    const logo = document.getElementById('finalLogo');
    const brand = document.getElementById('finalBrand');
    const tagline = document.getElementById('finalTagline');
    const finalMessage = document.getElementById('finalMessage');

    // Ensure all elements start hidden
    if (logo) gsap.set(logo, { scale: 0, opacity: 0 });
    if (brand) gsap.set(brand, { y: 50, opacity: 0 });
    if (tagline) gsap.set(tagline, { y: 30, opacity: 0 });
    if (finalMessage) gsap.set(finalMessage, { y: 20, opacity: 0 });

    // 1. Logo appears first (reduced delay)
    addTimeout(() => {
      console.log('=== SCENE 4: Showing logo ===');
      if (logo) {
        gsap.to(logo, {
          scale: 1, 
          opacity: 1, 
          duration: 1.2, 
          ease: "elastic.out(1, 0.3)"
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
          duration: 0.8, 
          ease: "power3.out"
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
          duration: 0.6, 
          ease: "power2.out"
        });
      }
    }, 2800);

    // 4. Final message appears (faster)
    addTimeout(() => {
      console.log('=== SCENE 4: Showing final message ===');
      if (finalMessage) {
        gsap.to(finalMessage, {
          y: 0, 
          opacity: 1, 
          duration: 0.5, 
          ease: "power2.out"
        });
      }
    }, 3800);

    // 5. Auto-restart after 3 seconds (optimized total timing)
    addTimeout(() => {
      console.log('=== SCENE 4: Auto-restarting demo ===');
      // Reset and restart the demo
      setDemoState(prev => ({ 
        ...prev, 
        startTime: Date.now(),
        currentScene: 0,
        isRunning: true,
        isPaused: false
      }));
      // Clear all timers and restart
      clearAllTimers();
      // Small delay before restart for smooth transition
      setTimeout(() => {
        console.log('Demo automatically restarting...');
      }, 100);
    }, 6800); // Optimized total timing: 3.8s + 3s = 6.8s total
  };


  // Handle tab visibility change for auto-pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - pause demo
        if (masterTimelineRef.current && demoState.isRunning && !demoState.isPaused) {
          masterTimelineRef.current.pause();
          setDemoState(prev => ({ ...prev, isPaused: true }));
          console.log('=== DEMO AUTO-PAUSED: Tab hidden ===');
        }
      } else {
        // Tab is visible - resume demo if it was auto-paused
        if (masterTimelineRef.current && demoState.isRunning && demoState.isPaused) {
          masterTimelineRef.current.play();
          setDemoState(prev => ({ ...prev, isPaused: false }));
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
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Build master timeline
      const timeline = buildMasterTimeline();
      
      // Start immediately - no loader
      setTimeout(() => {
        setIsLoaded(true);
        timeline.play();
        setDemoState(prev => ({ ...prev, isRunning: true, startTime: Date.now() }));
      }, 1000);  // Just 1 second delay
    };

    initDemo();

    // Cleanup
    return () => {
      clearAllTimers();
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
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
      <div id="loader" className="fixed inset-0 bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center z-50" style={{ display: 'none' }}>
        <div className="relative flex items-center justify-center">
          {/* Logo in center */}
          <div className="relative z-10" style={{ animation: 'logoPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)' }}>
            <Image src="/image/logo.png" alt="BlizzardBerry Logo" width={104} height={104} className="rounded-lg" priority unoptimized />
          </div>
          
          {/* Animated rings */}
          <div className="absolute w-40 h-40 border-4 border-transparent border-t-brand rounded-full animate-spin"></div>
          <div className="absolute w-36 h-36 border-4 border-transparent border-t-secondary rounded-full animate-spin" style={{ animationDelay: '-0.3s' }}></div>
          <div className="absolute w-32 h-32 border-4 border-transparent border-t-primary rounded-full animate-spin" style={{ animationDelay: '-0.6s' }}></div>
          <div className="absolute w-28 h-28 border-4 border-transparent border-t-brand/60 rounded-full animate-spin" style={{ animationDelay: '-0.9s' }}></div>
        </div>
        
        {/* Brand text below */}
        <div className="absolute bottom-1/3">
          <div className="text-white text-3xl font-bold mb-2 text-center" style={{ animation: 'logoPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)' }}>
            BlizzardBerry
          </div>
          <div className="text-gray-400 text-lg text-center">Loading...</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-40">
        <div id="progressBar" className="h-full bg-gradient-to-r from-brand to-secondary transition-all duration-300 ease-out" style={{ width: '0%' }}></div>
      </div>


      {/* Realistic Mouse Cursor Simulation */}
      <div id="mouseCursor" className="fixed pointer-events-none z-40 opacity-0" style={{ left: '20%', top: '20%' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
          {/* Realistic Windows/Mac cursor */}
          <path d="M3 3L10.07 19.97L12.58 12.58L20 10.07L3 3Z" fill="white" stroke="black" strokeWidth="1"/>
          <path d="M4.5 4.5L8.93 17.43L10.64 11.64L16.5 9.93L4.5 4.5Z" fill="black"/>
        </svg>
      </div>

      {/* Scene 1: Create Action - BlizzardBerry Style */}

      {/* Scene 2: AI Processing & Dashboard */}
      <div id="scene2" className="fixed inset-0 opacity-0" style={{ display: 'none' }}>
        <div className="absolute inset-0 bg-white"></div>
        {/* Fixed Size Chat Widget */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div id="chatWindow" className="w-[600px] h-[680px] bg-white flex flex-col transition-all duration-300 ease-out relative overflow-hidden">
            
            {/* Initial State: Centered Input (hidden for first chat) */}
            <div id="chatInitialState" className="flex-1 flex items-center justify-center px-6" style={{ display: 'none' }}>
              <div className="w-full max-w-md">
                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative overflow-visible">
                    <input
                      id="chatInitialInput"
                      type="text"
                      placeholder="Ask a question..."
                      className="w-full px-6 py-4 pr-16 text-base bg-muted rounded-full focus:outline-none transition-all duration-300"
                      disabled
                    />
                    {/* Send button inside input field */}
                    <button id="sendButton" className="group absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:scale-110 transition-all duration-300">
                      {/* Airplane icon - pointing upward and to the right */}
                      <div className="transform -rotate-12 group-hover:-rotate-6 transition-transform duration-300">
                        <svg width="20" height="20" fill="#ef4444" viewBox="0 0 24 24" className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation State: Just Messages in Center (shown for first chat) */}
            <div id="chatConversationState" className="flex-1 flex items-center justify-center">
              {/* Messages Container - centered vertically and horizontally */}
              <div id="chatMessages" className="w-full max-w-2xl px-6 flex flex-col gap-4">
                {/* Messages will be dynamically added here */}
              </div>
            </div>
          </div>
        </div>

        {/* Modern AI Analysis - Single Progressive Screen */}
        <div id="aiArchitecture" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0" style={{ display: 'none' }}>
          <div className="w-[500px] h-[480px] bg-white flex items-center justify-center relative overflow-hidden rounded-3xl transition-all duration-300 ease-out">
            
            {/* White background */}
            <div className="absolute inset-0 bg-white"></div>
            
            {/* Single Progressive Analysis View */}
            <div id="analysisStep1" className="relative z-10 text-center px-16 py-16 opacity-0">
              
              {/* AI Processing Center */}
              <div className="mb-6">
                <div className="relative mx-auto w-16 h-16">
                  {/* Clean AI Core */}
                  <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand/80 rounded-2xl flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/60 to-brand/80 animate-pulse opacity-30 rounded-2xl"></div>
                    
                    {/* Simple AI Icon */}
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24" className="relative z-10">
                      <path d="M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1M12,7C9.24,7 7,9.24 7,12S9.24,17 12,17S17,14.76 17,12S14.76,7 12,7M12,9C13.66,9 15,10.34 15,12S13.66,15 12,15S9,13.66 9,12S10.34,9 12,9Z"/>
                    </svg>
                    
                    {/* Simple rotating ring */}
                    <div className="absolute inset-0 w-16 h-16 border-2 border-white/25 rounded-2xl animate-spin opacity-50" style={{ animationDuration: '6s' }}></div>
                    
                    {/* Subtle pulse */}
                    <div className="absolute inset-0 w-16 h-16 border border-white/20 rounded-2xl animate-ping opacity-30"></div>
                  </div>
                </div>
              </div>
              
              {/* Dynamic Status Text */}
              <div className="mb-6">
                <h2 id="analysisTitle" className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tighter leading-tight">Analyzing Revenue Data</h2>
                <p id="analysisSubtitle" className="text-sm sm:text-base text-muted-foreground leading-relaxed">BlizzardBerry AI is processing your request...</p>
              </div>
              
              {/* Progress System */}
              <div className="bg-white rounded-2xl p-4">
                <div className="space-y-3">
                  
                  {/* Step 1: Data Fetching */}
                  <div className="progress-step flex items-center justify-between p-2 rounded-xl bg-cyan-50 border border-cyan-200/50" id="step1">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Data Collection</span>
                      <div className="text-xs text-gray-600">North America revenue streams</div>
                    </div>
                    <div className="step-status text-xs font-medium text-cyan-600 bg-cyan-100 px-2 py-1 rounded-lg w-[90px] text-center">Processing...</div>
                  </div>
                  
                  {/* Step 2: AI Analysis */}
                  <div className="progress-step flex items-center justify-between p-2 rounded-xl bg-teal-50 border border-teal-200/50 opacity-50" id="step2">
                    <div>
                      <span className="text-sm font-medium text-gray-900">AI Analytics</span>
                      <div className="text-xs text-gray-600">Pattern recognition & insights</div>
                    </div>
                    <div className="step-status text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg w-[90px] text-center">Waiting...</div>
                  </div>
                  
                  {/* Step 3: Dashboard */}
                  <div className="progress-step flex items-center justify-between p-2 rounded-xl bg-indigo-50 border border-indigo-200/50 opacity-50" id="step3">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Dashboard</span>
                      <div className="text-xs text-gray-600">Interactive visualizations</div>
                    </div>
                    <div className="step-status text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg w-[90px] text-center">Waiting...</div>
                  </div>
                  
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Modern Revenue Dashboard */}
      <div id="dashboardScene" className="fixed inset-0 z-50 opacity-0" style={{ display: 'none' }}>
        <div className="absolute inset-0 bg-white"></div>
        
        {/* Fixed Size Dashboard Widget */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div id="dashboardWindow" className="w-[600px] h-[680px] bg-white overflow-hidden rounded-3xl transition-all duration-300 ease-out flex flex-col relative">
            <div className="p-6">
            
            {/* Minimalist Header */}
            <div className="text-center mb-12" id="dashboardHeader">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2 tracking-tighter leading-tight">Revenue</h1>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">North America</p>
            </div>

            {/* Hero Metrics - Prominent Display */}
            <div className="grid grid-cols-2 gap-8 mb-12" id="statsGrid">
              <div className="text-center">
                <div className="text-5xl sm:text-6xl font-bold text-foreground mb-1 flex items-baseline justify-center">
                  <span className="text-3xl sm:text-4xl text-muted-foreground mr-1">$</span>
                  <span className="metric-number" data-target="847">0</span>
                  <span className="text-2xl sm:text-3xl text-muted-foreground ml-1">K</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">Peak Revenue</div>
                <div className="h-0.5 w-16 bg-blue-500 mx-auto mt-3 rounded-full"></div>
              </div>
              
              <div className="text-center">
                <div className="text-5xl sm:text-6xl font-bold text-foreground mb-1">
                  <span className="metric-number" data-target="18">0</span>
                  <span className="text-2xl sm:text-3xl text-muted-foreground">%</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">Growth Rate</div>
                <div className="h-0.5 w-16 bg-secondary mx-auto mt-3 rounded-full"></div>
              </div>
            </div>

            {/* Pure Chart */}
            <div className="h-80 relative" id="chartSection">
              <canvas id="performanceChart" className="w-full h-full"></canvas>
            </div>
            
            </div>
          </div>
        </div>
      </div>

      {/* Scene 4: Brand Finale - BlizzardBerry Style */}
      <div id="scene4" className="fixed inset-0 opacity-0 flex flex-col items-center justify-center bg-white" style={{ display: 'none' }}>
        
        {/* Logo with modern styling */}
        <div id="finalLogo" className="relative z-10 mb-12 opacity-0">
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center" style={{ animation: 'logoPulse 3s infinite' }}>
              <Image src="/image/logo.png" alt="BlizzardBerry Logo" width={80} height={80} priority unoptimized />
            </div>
            
            {/* Pulse ring effects */}
            <div className="absolute inset-0 w-32 h-32 border-2 border-brand/40 rounded-3xl" style={{ animation: 'ringPulse 3s infinite ease-out' }}></div>
          </div>
        </div>
        
        {/* Brand text with modern styling */}
        <div id="finalBrand" className="text-center mb-12 opacity-0">
          <h1 className="text-7xl font-bold text-foreground mb-4 tracking-tight">
            BlizzardBerry
          </h1>
          <div className="h-2 w-48 bg-gradient-to-r from-[#F43F5E] to-[#1D4ED8] rounded-full mx-auto mb-6"></div>
          <div id="finalTagline" className="text-2xl text-muted-foreground font-semibold opacity-0 tracking-wide">
            AN AI AGENT FOR EVERY APP
          </div>
        </div>
        
        {/* Final message removed */}
      </div>
    </div>
  );
}