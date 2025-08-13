"use client";

import { useEffect, useRef, useState } from 'react';
import { Inter } from 'next/font/google';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import Chart from 'chart.js/auto';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

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
  const typeText = (element: HTMLInputElement | null, text: string, speed = 80) => {
    if (!element) return;
    element.value = '';
    let i = 0;
    const type = () => {
      if (i < text.length) {
        element.value += text.charAt(i);
        i++;
        addTimeout(type, speed);
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
      type: 'line',
      data: {
        labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        datasets: [{
          label: 'Revenue (North America)',
          data: [120, 135, 142, 156, 148, 141], // Show full data immediately
          borderColor: '#F43F5E',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#F43F5E',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
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
            max: 200,
            grid: { color: 'rgba(244, 63, 94, 0.1)' },
            ticks: {
              color: '#64748b',
              font: { family: 'Inter', size: 12 }
            }
          },
          x: {
            grid: { color: 'rgba(244, 63, 94, 0.1)' },
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

    // Phase 1: Loading (1.5 seconds - faster)
    tl.addLabel("loadingStart")
      .to("#loader", { 
        opacity: 0, 
        scale: 1.1, 
        filter: "blur(10px)", 
        duration: 0.8, 
        ease: "power2.inOut" 
      }, 0.5)
      .call(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
        setControlsVisible(true);
      }, undefined, 1.5);

    // Phase 2: Scene 1 - Create Action (8 seconds)
    tl.addLabel("scene1Start", 1.8)
      .call(() => showScene('scene1'), undefined, "scene1Start")
      .call(() => {
        // Start Scene 1 animations
        scene1Sequence();
      }, undefined, "scene1Start+=0.5")
      .call(() => hideScene('scene1'), undefined, "scene1Start+=7.5");

    // Scene 2 is now triggered directly from Scene 1 button click
    // Keeping timeline structure for scene management
    tl.addLabel("scene2Start", "scene1Start+=8")
      .call(() => showScene('scene2'), undefined, "scene2Start")
      .call(() => {
        // Scene2Sequence is now called directly from Scene1 - no duplicate call needed
      }, undefined, "scene2Start+=0.5")
      .call(() => {
        hideScene('scene2');
      }, undefined, "scene2Start+=44");

    // Scene 4 is now triggered directly from hideTicketsDashboard()

    masterTimelineRef.current = tl;
    return tl;
  };

  // Scene 1: Create Action - exact recreation of original
  const scene1Sequence = () => {
    const cursor = document.getElementById('mouseCursor');
    const actionInput = document.getElementById('actionInput') as HTMLInputElement;
    const createBtn = document.getElementById('createBtn');
    
    if (!cursor || !actionInput || !createBtn) return;

    setDemoState(prev => ({ ...prev, currentScene: 1 }));

    // Show cursor and move to input
    addTimeout(() => {
      cursor.style.opacity = '1';
      gsap.to(cursor, {
        left: '50%',
        top: '52%',
        duration: 0.8,
        ease: "power2.inOut"
      });
    }, 500);

    // Click on input and start typing
    addTimeout(() => {
      showClickEffect();
      actionInput.classList.add('focused');
      
      addTimeout(() => {
        typeText(actionInput, "Show Revenue Numbers", 80);
      }, 800);
    }, 1300);

    // Move cursor to button
    addTimeout(() => {
      gsap.to(cursor, {
        left: '50%',
        top: '63%',
        duration: 1,
        ease: "power2.inOut"
      });
    }, 4000);

    // Hover effect on button
    addTimeout(() => {
      createBtn.classList.add('hover');
    }, 5000);

    // Click button and animate out elements
    addTimeout(() => {
      showClickEffect();
      createBtn.classList.add('clicked');
      
      // Hide cursor immediately
      const cursor = document.getElementById('mouseCursor');
      if (cursor) {
        gsap.to(cursor, {
          opacity: 0,
          scale: 0.8,
          duration: 0.3,
          ease: "power2.inOut"
        });
      }
      
      // Animate out create action elements first
      addTimeout(() => {
        const createActionSection = document.querySelector('#scene1 .relative.text-center');
        if (createActionSection) {
          gsap.to(createActionSection, {
            opacity: 0,
            scale: 0.9,
            y: -30,
            duration: 0.6,
            ease: "power2.inOut"
          });
        }
        
        // Then hide entire scene 1 second later
        addTimeout(() => {
          const scene1 = document.getElementById('scene1');
          if (scene1) {
            gsap.to(scene1, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.inOut",
              onComplete: () => {
                scene1.style.display = 'none';
                // Start scene 2
                scene2Sequence();
              }
            });
          }
        }, 1000);
      }, 200);
    }, 5300);
  };

  // Scene 2: AI Processing & Dashboard - exact recreation
  const scene2Sequence = () => {
    setDemoState(prev => ({ ...prev, currentScene: 2 }));

    // Start chat conversation
    addTimeout(() => {
      startChatConversation();
    }, 500);

    // AI architecture is now triggered directly from analyzing bubble's onComplete callback

    // Dashboard is now triggered directly from AI analysis completion

    // Hide dashboard and return to chat (2 seconds longer timing)
    addTimeout(() => {
      console.log('=== HIDING DASHBOARD, RETURNING TO CHAT ===');
      const dashboardScene = document.getElementById('dashboardScene');
      const chatWindow = document.getElementById('chatWindow');
      
      if (dashboardScene) {
        gsap.to(dashboardScene, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            dashboardScene.style.display = 'none';
          }
        });
      }
      
      // Show chat window again
      if (chatWindow) {
        chatWindow.style.display = 'flex';
        gsap.fromTo(chatWindow,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
        );
      }
      
      showScene('scene2');
      continueConversationAfterDashboard();
    }, 16500);  // Extended - dashboard shows for ~10.5 seconds total (2s longer)
  };

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

    // Add the first message with immediate fade-in
    addTimeout(() => {
      const chatMessages = document.getElementById('chatMessages');
      if (!chatMessages) return;

      messages.forEach((message, index) => {
        addTimeout(() => {
          addMessage(message, index);
        }, index * 200); // Faster message appearance
      });
    }, 200); // Much faster start

    const addMessage = (message: { type: string; text: string }, messageIndex: number) => {
      const chatMessages = document.getElementById('chatMessages');
      if (!chatMessages) return;

      const messageDiv = document.createElement('div');
      messageDiv.className = `flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} chat-message`;
      
      // For the sent message with North America, initially show without highlighting
      let messageText = message.text;
      if (message.type === 'sent' && message.text.includes('North America')) {
        messageText = 'Show me revenue numbers for North America.'; // Plain text first
      }
      
      messageDiv.innerHTML = `
        <div class="max-w-md px-5 py-3 rounded-3xl ${
          message.type === 'sent' 
            ? 'bg-rose-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }">
          <div class="text-base leading-relaxed" id="messageText-${messageIndex}">${messageText}</div>
        </div>
      `;
      
      // Append to end (new messages at bottom)
      chatMessages.appendChild(messageDiv);
      
      // Trigger callbacks after animation
      setTimeout(() => {
        if (message.type === 'sent' && message.text.includes('North America')) {
          showInitialAnalyzingBubble();
        }
      }, 300); // After animation completes
    };
  };

  let initialAnalyzingBubbleDiv: HTMLElement | null = null;

  const showInitialAnalyzingBubble = () => {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Show analyzing bubble first
    addTimeout(() => {
      initialAnalyzingBubbleDiv = document.createElement('div');
      initialAnalyzingBubbleDiv.className = 'flex justify-start chat-message';
      initialAnalyzingBubbleDiv.innerHTML = `
        <div class="bg-gray-100 px-5 py-3 rounded-3xl max-w-md">
          <div class="flex items-center space-x-3">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <div class="text-base text-gray-900">Analyzing...</div>
          </div>
        </div>
      `;
      
      // Append to end (new messages at bottom)
      chatMessages.appendChild(initialAnalyzingBubbleDiv);

      // THEN highlight North America when analyzing bubble appears
      highlightNorthAmericaInChat();

      // Start AI analysis after chat with analyzing bubble is visible for 1 more second
      addTimeout(() => {
        // Trigger AI analysis after giving more time to see the chat
        startAIArchitecture();
      }, 1200); // 1 second longer - let user see chat with "Analyzing..." bubble
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
            duration: 0.8, // Faster counting
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
    
    if (!chatWindow || !aiArchitecture) {
      console.error('Missing chat or analysis elements');
      return;
    }

    // Step 1: Elegant chat disappearance with scale down + fade out
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
          y: -20,
          scale: 0.95,
          duration: 0.6,
          ease: "power2.in",
          onComplete: () => {
            // Smooth analysis exit
            gsap.to(aiArchitecture, { 
              opacity: 0,
              scale: 0.9,
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
      completeAnalysisStep('step1', '✓ Complete');
      startAnalysisStep('step2');
    }, 800);
    
    // Step 2: Complete second step (Analysis)
    addTimeout(() => {
      completeAnalysisStep('step2', '✓ Complete');
      startAnalysisStep('step3');
    }, 2000);
    
    // Step 3: Complete final step (Dashboard)
    addTimeout(() => {
      completeAnalysisStep('step3', '✓ Ready');
      // Update main title for completion
      const title = document.getElementById('analysisTitle');
      const subtitle = document.getElementById('analysisSubtitle');
      if (title && subtitle) {
        gsap.to([title, subtitle], {
          opacity: 0,
          y: -10,
          duration: 0.3,
          stagger: 0.1,
          onComplete: () => {
            title.textContent = 'Analysis Complete';
            subtitle.textContent = 'Revenue dashboard is ready to view';
            gsap.to([title, subtitle], {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.1
            });
          }
        });
      }
    }, 3200);
  };
  
  const startAnalysisStep = (stepId: string) => {
    const step = document.getElementById(stepId);
    if (!step) return;
    
    // Activate step - remove opacity and start animation
    gsap.to(step, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    });
    
    // Start loader animation
    const loader = step.querySelector('.step-loader');
    if (loader) {
      gsap.to(loader, {
        scale: 1.5,
        duration: 0.8,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });
    }
    
    // Update status
    const status = step.querySelector('.step-status');
    if (status) {
      status.textContent = 'Processing...';
    }
  };
  
  const completeAnalysisStep = (stepId: string, completionText: string) => {
    const step = document.getElementById(stepId);
    if (!step) return;
    
    const icon = step.querySelector('.step-icon');
    const loader = step.querySelector('.step-loader');
    const status = step.querySelector('.step-status');
    
    if (icon && loader && status) {
      // Stop loader animation
      gsap.killTweensOf(loader);
      
      // Transform to checkmark
      gsap.to(loader, {
        scale: 0,
        duration: 0.2,
        onComplete: () => {
          loader.classList.remove('animate-pulse');
          loader.innerHTML = '✓';
          loader.className = 'text-white text-xs font-bold';
          gsap.to(loader, {
            scale: 1,
            duration: 0.3,
            ease: "back.out(1.7)"
          });
        }
      });
      
      // Update status with success
      gsap.to(status, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          status.textContent = completionText;
          status.className = 'step-status text-xs text-emerald-600 font-medium';
          gsap.to(status, {
            opacity: 1,
            duration: 0.3
          });
        }
      });
      
      // Success pulse effect
      gsap.to(step, {
        scale: 1.02,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
      });
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

    // Clear previous messages
    chatMessages.innerHTML = '';
    
    // Show initial state, hide conversation state
    conversationState.style.display = 'none';
    conversationState.style.opacity = '0';
    initialState.style.display = 'flex';
    initialState.style.opacity = '1';

    // Start typing animation in the centered input
    addTimeout(() => {
      showUserTypingAnimation('Show me today\'s support tickets');
    }, 500);

    // Transition to conversation mode after typing (wait 1 second longer)
    addTimeout(() => {
      transitionToChatConversation();
    }, 3200); // Extended delay after typing completes

    // User message appears in chat after transition
    addTimeout(() => {
      addChatMessage({
        type: 'sent',
        text: 'Show me today\'s support tickets'
      }, false);
    }, 3700); // After transition completes

    // Show analyzing bubble (brief)
    addTimeout(() => {
      showAnalyzingBubble();
    }, 4200); // After user message appears

    // Agent responds with ticket summary (smooth transition)
    addTimeout(() => {
      hideAnalyzingBubble();
      // Wait for hide animation to complete before showing response
      addTimeout(() => {
        addChatMessage({
          type: 'received',
          text: 'We have 5 tickets today:\n\n• 3 Resolved (billing & features)\n• 2 Open (1 high-priority bug, 1 pending)\n\nWant to see the full details?'
        }, true);
      }, 300); // Wait for hide animation to complete
    }, 5400); // Shorter analyzing duration

    // User responds YES (key moment - make it prominent)
    addTimeout(() => {
      console.log('=== SENDING YES MESSAGE ===');
      addChatMessage({
        type: 'sent',
        text: 'Yes'
      }, false);
      
      // Show tickets dashboard after YES (immediate but smooth)
      addTimeout(() => {
        showTicketsDashboard();
      }, 1200); // Faster transition
    }, 7000);  // Adjusted to match new AI response timing
  };

  // New streamlined tickets dashboard
  const showTicketsDashboard = () => {
    console.log('=== SHOWING TICKETS DASHBOARD ===');
    const chatWindow = document.getElementById('chatWindow');
    
    if (!chatWindow) {
      console.error('Chat window not found!');
      return;
    }

    // Step 1: Fade out chat smoothly
    gsap.to(chatWindow, {
      opacity: 0,
      scale: 0.95,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        chatWindow.style.display = 'none';
        
        // Step 2: Create and show tickets dashboard
        createTicketsDashboard();
      }
    });
  };

  const createTicketsDashboard = () => {
    console.log('=== CREATING TICKETS DASHBOARD ===');
    
    // Create dashboard container
    const dashboardDiv = document.createElement('div');
    dashboardDiv.id = 'ticketsDashboard';
    dashboardDiv.className = 'fixed inset-0 flex items-center justify-center z-50';
    dashboardDiv.style.opacity = '1'; // Set to visible immediately
    
    dashboardDiv.innerHTML = `
      <div class="w-[600px] h-[680px] bg-white overflow-y-auto p-4">
        <!-- Header - All elements initially hidden -->
        <div class="text-center mb-4">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl mb-3 shadow-lg" id="header-icon" style="opacity: 0; transform: translateY(-40px) scale(0.5);">
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
            </svg>
          </div>
          <h1 class="text-xl font-bold text-gray-900 mb-1" id="header-title" style="opacity: 0; transform: translateY(-20px);">Support Tickets</h1>
          <p class="text-xs text-gray-600" id="header-subtitle" style="opacity: 0; transform: translateY(-15px);">Today's Overview</p>
        </div>

        <!-- Quick Stats - All elements initially hidden -->
        <div class="grid grid-cols-3 gap-2 mb-4" id="stats-grid">
          <div class="bg-gray-50 rounded-lg p-3 text-center stats-card" style="opacity: 0; transform: translateY(30px) scale(0.9);">
            <div class="text-2xl font-bold mb-1 ticket-stat text-blue-600" data-target="5" style="opacity: 0;">0</div>
            <div class="text-xs text-gray-600" style="opacity: 0;">Total</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center stats-card" style="opacity: 0; transform: translateY(30px) scale(0.9);">
            <div class="text-2xl font-bold mb-1 ticket-stat text-emerald-600" data-target="3" style="opacity: 0;">0</div>
            <div class="text-xs text-gray-600" style="opacity: 0;">Resolved</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center stats-card" style="opacity: 0; transform: translateY(30px) scale(0.9);">
            <div class="text-2xl font-bold mb-1 ticket-stat text-rose-600" data-target="2" style="opacity: 0;">0</div>
            <div class="text-xs text-gray-600" style="opacity: 0;">Open</div>
          </div>
        </div>

        <!-- Tickets List - All elements initially hidden -->
        <div class="bg-gray-50 rounded-lg p-3" id="tickets-section" style="opacity: 0; transform: translateY(20px);">
          <h3 class="text-sm font-bold text-gray-900 mb-3" style="opacity: 0;">Recent Tickets</h3>
          <div class="space-y-2">
            <div class="ticket-row bg-white rounded-lg p-3" style="opacity: 0; transform: translateX(-50px);">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div class="text-xs font-medium text-gray-900">#12847</div>
                </div>
                <span class="px-2 py-1 bg-red-500/10 text-red-600 text-xs rounded-full">Open</span>
              </div>
              <div class="text-xs text-gray-700 mb-1">Payment Processing Error</div>
              <div class="text-xs text-gray-500">High Priority</div>
            </div>
            
            <div class="ticket-row bg-white rounded-lg p-3" style="opacity: 0; transform: translateX(-50px);">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div class="text-xs font-medium text-gray-900">#12846</div>
                </div>
                <span class="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-xs rounded-full">Resolved</span>
              </div>
              <div class="text-xs text-gray-700 mb-1">Billing Question</div>
              <div class="text-xs text-gray-500">Low Priority</div>
            </div>
            
            <div class="ticket-row bg-white rounded-lg p-3" style="opacity: 0; transform: translateX(-50px);">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div class="text-xs font-medium text-gray-900">#12845</div>
                </div>
                <span class="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-xs rounded-full">Resolved</span>
              </div>
              <div class="text-xs text-gray-700 mb-1">Feature Request</div>
              <div class="text-xs text-gray-500">Low Priority</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add to DOM
    document.body.appendChild(dashboardDiv);
    
    // Start sequential animations immediately
    animateTicketsDashboard();
  };

  const animateTicketsDashboard = () => {
    console.log('=== ANIMATING TICKETS DASHBOARD WITH PERFECT SEQUENCE ===');
    
    // Step 1: Animate header icon first
    addTimeout(() => {
      const headerIcon = document.getElementById('header-icon');
      if (headerIcon) {
        gsap.to(headerIcon, {
          y: 0, 
          opacity: 1, 
          scale: 1,
          duration: 0.8, 
          ease: "back.out(1.7)"
        });
      }
    }, 200);
    
    // Step 2: Animate header text
    addTimeout(() => {
      const headerTitle = document.getElementById('header-title');
      if (headerTitle) {
        gsap.to(headerTitle, {
          y: 0, opacity: 1, duration: 0.6, ease: "power2.out"
        });
      }
    }, 600);
    
    addTimeout(() => {
      const headerSubtitle = document.getElementById('header-subtitle');
      if (headerSubtitle) {
        gsap.to(headerSubtitle, {
          y: 0, opacity: 1, duration: 0.6, ease: "power2.out"
        });
      }
    }, 800);
    
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
                  duration: 0.8,
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
    }, 5000);
  };

  const hideTicketsDashboard = () => {
    console.log('=== HIDING TICKETS DASHBOARD ===');
    const dashboard = document.getElementById('ticketsDashboard');
    
    if (dashboard) {
      gsap.to(dashboard, {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          dashboard.remove();
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

    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} chat-message`;
    
    // Format text for multiline with bullet points
    let formattedText = message.text;
    if (isMultiline) {
      formattedText = message.text
        .split('\n')
        .map(line => line.trim())
        .join('<br>');
    }
    
    messageDiv.innerHTML = `
      <div class="max-w-md px-5 py-3 rounded-3xl ${
        message.type === 'sent' 
          ? 'bg-rose-500 text-white' 
          : 'bg-gray-100 text-gray-900'
      }">
        <div class="text-base leading-relaxed">${formattedText}</div>
      </div>
    `;
    
    // Append to end (new messages at bottom)
    chatMessages.appendChild(messageDiv);
  };

  let analyzingBubbleDiv: HTMLElement | null = null;

  const showAnalyzingBubble = () => {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    analyzingBubbleDiv = document.createElement('div');
    analyzingBubbleDiv.className = 'flex justify-start chat-message';
    analyzingBubbleDiv.style.opacity = '0';
    analyzingBubbleDiv.style.transform = 'translateY(20px)';
    analyzingBubbleDiv.style.transition = 'all 250ms ease-out';
    
    analyzingBubbleDiv.innerHTML = `
      <div class="bg-gray-100 px-5 py-3 rounded-3xl max-w-md">
        <div class="flex items-center space-x-3">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
          <div class="text-base text-gray-900">Analyzing support logs...</div>
        </div>
      </div>
    `;
    
    // Append to end (new messages at bottom)
    chatMessages.appendChild(analyzingBubbleDiv);
    
    // Trigger smooth slide-up animation
    setTimeout(() => {
      analyzingBubbleDiv.style.opacity = '1';
      analyzingBubbleDiv.style.transform = 'translateY(0)';
    }, 10);
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
        addTimeout(typeChar, 60); // Realistic typing speed
      } else {
        // Typing completed, blur input after brief pause
        addTimeout(() => {
          inputField.blur();
          inputField.classList.remove('bg-gray-100');
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
        gsap.fromTo(dashboardScene,
          { opacity: 0, scale: 0.95 },
          { 
            opacity: 1,
            scale: 1, 
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
              console.log('Dashboard scene appeared');
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
        duration: 2,
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

    // 1. Logo appears first (0.5s delay)
    addTimeout(() => {
      console.log('=== SCENE 4: Showing logo ===');
      if (logo) {
        gsap.to(logo, {
          scale: 1, 
          opacity: 1, 
          duration: 1.5, 
          ease: "elastic.out(1, 0.3)"
        });
      }
    }, 500);

    // 2. Brand text appears (2.5s total)
    addTimeout(() => {
      console.log('=== SCENE 4: Showing brand text ===');
      if (brand) {
        gsap.to(brand, {
          y: 0, 
          opacity: 1, 
          duration: 1, 
          ease: "power3.out"
        });
      }
    }, 2500);

    // 3. Tagline appears (4s total)
    addTimeout(() => {
      console.log('=== SCENE 4: Showing tagline ===');
      if (tagline) {
        gsap.to(tagline, {
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: "power2.out"
        });
      }
    }, 4000);

    // 4. Final message appears (5.5s total)
    addTimeout(() => {
      console.log('=== SCENE 4: Showing final message ===');
      if (finalMessage) {
        gsap.to(finalMessage, {
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          ease: "power2.out"
        });
      }
    }, 5500);

    // 5. Auto-restart after 5 seconds (10.5s total)
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
    }, 10500); // 5.5s + 5s = 10.5s total
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
      
      // Start after loader - faster startup
      setTimeout(() => {
        setIsLoaded(true);
        timeline.play();
        setDemoState(prev => ({ ...prev, isRunning: true, startTime: Date.now() }));
      }, 2000);
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
    <div className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-50 via-rose-50 to-pink-50 overflow-hidden relative`}>
      <style>{`
        /* Custom CSS for complex animations that need CSS */
        @keyframes logoBreathing {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(244, 63, 94, 0.3); }
          50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(244, 63, 94, 0.5); }
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
          border-color: #F43F5E !important;
          box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1) !important;
        }
        
        .hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(244, 63, 94, 0.25) !important;
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
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
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
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.6s;
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
          background: linear-gradient(45deg, #F43F5E, #3B82F6, #10B981, #F43F5E);
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
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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

      {/* Modern Loader */}
      <div id="loader" className="fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-gray-800 flex items-center justify-center z-50">
        <div className="relative flex items-center justify-center">
          {/* Logo in center */}
          <div className="relative z-10" style={{ animation: 'logoPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)' }}>
            <Image src="/image/logo.png" alt="BlizzardBerry Logo" width={104} height={104} className="rounded-lg" priority unoptimized />
          </div>
          
          {/* Animated rings */}
          <div className="absolute w-40 h-40 border-4 border-transparent border-t-rose-500 rounded-full animate-spin"></div>
          <div className="absolute w-36 h-36 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDelay: '-0.3s' }}></div>
          <div className="absolute w-32 h-32 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" style={{ animationDelay: '-0.6s' }}></div>
          <div className="absolute w-28 h-28 border-4 border-transparent border-t-rose-600 rounded-full animate-spin" style={{ animationDelay: '-0.9s' }}></div>
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
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-40">
        <div id="progressBar" className="h-full bg-gradient-to-r from-rose-500 to-blue-500 transition-all duration-300 ease-out" style={{ width: '0%' }}></div>
      </div>


      {/* Realistic Mouse Cursor Simulation */}
      <div id="mouseCursor" className="fixed pointer-events-none z-40 opacity-0" style={{ left: '20%', top: '20%' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
          {/* Realistic Windows/Mac cursor */}
          <path d="M3 3L10.07 19.97L12.58 12.58L20 10.07L3 3Z" fill="white" stroke="black" strokeWidth="1"/>
          <path d="M4.5 4.5L8.93 17.43L10.64 11.64L16.5 9.93L4.5 4.5Z" fill="black"/>
        </svg>
      </div>

      {/* Scene 1: Create Action - Modern Design */}
      <div id="scene1" className="fixed inset-0 opacity-0" style={{ display: 'none' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 w-full max-w-lg overflow-hidden z-10">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-50 to-blue-50 rounded-full transform translate-x-16 -translate-y-16 opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-50 to-rose-50 rounded-full transform -translate-x-12 translate-y-12 opacity-20"></div>
          
          <div className="relative text-center">
            {/* Just Logo in Center */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                {/* Logo with subtle animation rings */}
                <div className="relative z-10 w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100">
                  <Image src="/image/logo.png" alt="BlizzardBerry Logo" width={50} height={50} className="rounded-lg" priority unoptimized />
                </div>
                {/* Subtle animated ring */}
                <div className="absolute inset-0 w-20 h-20 border-2 border-rose-200 rounded-2xl animate-ping opacity-20"></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Action</h2>
                <input
                  id="actionInput"
                  type="text"
                  placeholder="Enter action name..."
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all duration-300 bg-white text-center shadow-sm hover:shadow-md"
                />
              </div>
              
              <button
                id="createBtn"
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xl font-semibold py-4 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl interactive-hover button-shimmer"
                tabIndex={0}
                aria-label="Create new AI action"
              >
                Create Action
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 2: AI Processing & Dashboard */}
      <div id="scene2" className="fixed inset-0 opacity-0" style={{ display: 'none' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        {/* Fixed Size Chat Widget */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div id="chatWindow" className="w-[600px] h-[680px] bg-white flex flex-col transition-all duration-800 relative">
            
            {/* Initial State: Centered Input (hidden for first chat) */}
            <div id="chatInitialState" className="flex-1 flex items-center justify-center px-6" style={{ display: 'none' }}>
              <div className="w-full max-w-md">
                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative">
                    <input
                      id="chatInitialInput"
                      type="text"
                      placeholder="Ask a question..."
                      className="w-full px-6 py-4 text-base bg-gray-50 rounded-full focus:outline-none focus:bg-gray-100 transition-all duration-300"
                      disabled
                    />
                  </div>
                  <button className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center hover:bg-rose-600 transition-all duration-300">
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Conversation State: Just Messages in Center (shown for first chat) */}
            <div id="chatConversationState" className="flex-1 flex items-center justify-center">
              {/* Messages Container - centered vertically and horizontally */}
              <div id="chatMessages" className="w-full max-w-2xl px-6 flex flex-col space-y-4">
                {/* Messages will be dynamically added here */}
              </div>
            </div>
          </div>
        </div>

        {/* Modern AI Analysis - Single Progressive Screen */}
        <div id="aiArchitecture" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0" style={{ display: 'none' }}>
          <div className="w-[500px] h-[400px] bg-white flex items-center justify-center relative overflow-hidden rounded-3xl shadow-2xl border border-gray-100">
            
            {/* Modern gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-blue-50"></div>
            
            {/* Single Progressive Analysis View */}
            <div id="analysisStep1" className="relative z-10 text-center px-10 py-6 opacity-0">
              
              {/* AI Processing Center */}
              <div className="mb-5">
                <div className="relative mx-auto w-16 h-16">
                  {/* Clean AI Core */}
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-teal-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-teal-400 animate-pulse opacity-30 rounded-2xl"></div>
                    
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
                <h2 id="analysisTitle" className="text-xl font-bold text-gray-900 mb-2">Analyzing Revenue Data</h2>
                <p id="analysisSubtitle" className="text-sm text-gray-600">BlizzardBerry AI is processing your request...</p>
              </div>
              
              {/* Progress System */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200">
                <div className="space-y-3">
                  
                  {/* Step 1: Data Fetching */}
                  <div className="progress-step flex items-center justify-between p-2 rounded-xl bg-cyan-50 border border-cyan-200/50 transition-all duration-300" id="step1">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center step-icon shadow-md">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse step-loader"></div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Data Collection</span>
                        <div className="text-xs text-gray-600">North America revenue streams</div>
                      </div>
                    </div>
                    <div className="step-status text-xs font-medium text-cyan-600 bg-cyan-100 px-2 py-1 rounded-lg">Processing...</div>
                  </div>
                  
                  {/* Step 2: AI Analysis */}
                  <div className="progress-step flex items-center justify-between p-2 rounded-xl bg-teal-50 border border-teal-200/50 opacity-50 transition-all duration-300" id="step2">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center step-icon shadow-md">
                        <div className="w-2 h-2 bg-white rounded-full step-loader"></div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">AI Analytics</span>
                        <div className="text-xs text-gray-600">Pattern recognition & insights</div>
                      </div>
                    </div>
                    <div className="step-status text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">Waiting...</div>
                  </div>
                  
                  {/* Step 3: Dashboard */}
                  <div className="progress-step flex items-center justify-between p-2 rounded-xl bg-indigo-50 border border-indigo-200/50 opacity-50 transition-all duration-300" id="step3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center step-icon shadow-md">
                        <div className="w-2 h-2 bg-white rounded-full step-loader"></div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Dashboard</span>
                        <div className="text-xs text-gray-600">Interactive visualizations</div>
                      </div>
                    </div>
                    <div className="step-status text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">Waiting...</div>
                  </div>
                  
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Modern Revenue Dashboard */}
      <div id="dashboardScene" className="fixed inset-0 z-50 opacity-0" style={{ display: 'none' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        
        {/* Fixed Size Dashboard Widget */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div id="dashboardWindow" className="w-[600px] h-[680px] bg-white overflow-y-auto rounded-2xl shadow-xl border border-gray-200">
            <div className="p-6">
            
            {/* Minimalist Header */}
            <div className="text-center mb-12" id="dashboardHeader">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Revenue</h1>
              <p className="text-sm text-gray-500 uppercase tracking-wider">North America</p>
            </div>

            {/* Hero Metrics - Prominent Display */}
            <div className="grid grid-cols-2 gap-8 mb-12" id="statsGrid">
              <div className="text-center">
                <div className="metric-number text-6xl font-bold text-gray-900 mb-2" data-target="847">0</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Revenue (K)</div>
                <div className="h-0.5 w-16 bg-rose-500 mx-auto mt-3"></div>
              </div>
              
              <div className="text-center">
                <div className="metric-number text-6xl font-bold text-gray-900 mb-2" data-target="18">0</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Growth %</div>
                <div className="h-0.5 w-16 bg-blue-500 mx-auto mt-3"></div>
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

      {/* Scene 4: Brand Finale - Professional Design */}
      <div id="scene4" className="fixed inset-0 opacity-0 flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100" style={{ display: 'none' }}>
        {/* Subtle decorative elements */}
        <div className="absolute">
          <div className="w-96 h-96 border border-rose-100 rounded-full animate-ping opacity-30"></div>
          <div className="absolute top-8 left-8 w-80 h-80 border border-blue-100 rounded-full animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-16 left-16 w-64 h-64 border border-rose-50 rounded-full animate-ping opacity-15" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Logo with modern styling */}
        <div id="finalLogo" className="relative z-10 mb-12 opacity-0">
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl border border-gray-200" style={{ animation: 'logoPulse 3s infinite' }}>
              <Image src="/image/logo.png" alt="BlizzardBerry Logo" width={80} height={80} priority unoptimized />
            </div>
            {/* Subtle animated ring */}
            <div className="absolute inset-0 w-32 h-32 border-2 border-rose-200 rounded-3xl animate-ping opacity-30"></div>
          </div>
        </div>
        
        {/* Brand text with modern styling */}
        <div id="finalBrand" className="text-center mb-12 opacity-0">
          <h1 className="text-7xl font-bold text-gray-900 mb-4">
            BlizzardBerry
          </h1>
          <div className="h-2 w-48 bg-gradient-to-r from-rose-500 to-blue-500 rounded-full mx-auto mb-6"></div>
          <div id="finalTagline" className="text-2xl text-gray-600 font-medium opacity-0 tracking-wide">
            POWERFUL AI ACTIONS
          </div>
        </div>
        
        {/* Final message with better contrast */}
        <div id="finalMessage" className="text-center opacity-0 max-w-3xl mx-auto">
          <p className="text-xl text-gray-700 leading-relaxed">
            Your Business Has Countless Actions. <br />
            <span className="text-rose-600 font-semibold">Your AI Should Too.</span>
          </p>
        </div>
      </div>
    </div>
  );
}