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

  // Enhanced scene transition functions with smooth animations
  const showScene = (sceneId: string) => {
    console.log('=== SHOWING SCENE:', sceneId);
    const scene = document.getElementById(sceneId);
    if (scene) {
      scene.style.display = sceneId.includes('scene4') ? 'flex' : 'block';
      scene.style.visibility = 'visible';
      
      // Smooth fade in with scale
      gsap.fromTo(scene, 
        { opacity: 0, scale: 0.95 },
        { 
          opacity: 1, 
          scale: 1,
          duration: 0.8, 
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

  // Mouse cursor simulation with realistic click effect
  const showClickEffect = () => {
    const clickEffect = document.getElementById('clickEffect');
    const cursor = document.getElementById('mouseCursor');
    
    if (clickEffect && cursor) {
      clickEffect.style.transform = 'scale(0)';
      clickEffect.style.opacity = '1';
      
      gsap.to(clickEffect, {
        scale: 2,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out"
      });
      
      // Realistic cursor press animation
      gsap.to(cursor, {
        scale: 0.9,
        duration: 0.08,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
  };

  // Chart creation function
  const createChart = () => {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        datasets: [{
          label: 'Revenue (North America)',
          data: [120, 135, 142, 156, 148, 141],
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

    // Animate chart appearance
    const chart = chartInstanceRef.current;
    const originalData = chart.data.datasets[0].data;
    chart.data.datasets[0].data = new Array(originalData.length).fill(0);
    chart.update();

    // Animate to final values
    let step = 0;
    const animateData = () => {
      if (step <= 20) {
        chart.data.datasets[0].data = originalData.map(val => 
          typeof val === 'number' ? (val * step) / 20 : 0
        );
        chart.update('none');
        step++;
        addTimeout(animateData, 100);
      }
    };
    addTimeout(animateData, 500);
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

    // Phase 1: Loading (2 seconds)
    tl.addLabel("loadingStart")
      .to("#loader", { 
        opacity: 0, 
        scale: 1.1, 
        filter: "blur(10px)", 
        duration: 1.2, 
        ease: "power2.inOut" 
      }, 1)
      .call(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
        setControlsVisible(true);
      }, undefined, 2.2);

    // Phase 2: Scene 1 - Create Action (8 seconds)
    tl.addLabel("scene1Start", 2.5)
      .call(() => showScene('scene1'), undefined, "scene1Start")
      .call(() => {
        // Start Scene 1 animations
        scene1Sequence();
      }, undefined, "scene1Start+=0.5")
      .call(() => hideScene('scene1'), undefined, "scene1Start+=7.5");

    // Phase 3: Scene 2 - AI Processing & Dashboard & Chat Continuation (44.5 seconds) 
    tl.addLabel("scene2Start", "scene1Start+=8")
      .call(() => showScene('scene2'), undefined, "scene2Start")
      .call(() => {
        scene2Sequence();
      }, undefined, "scene2Start+=0.5")
      .call(() => {
        hideScene('scene2');
      }, undefined, "scene2Start+=44");

    // Phase 3: Scene 4 - Brand Finale (6 seconds) - optimized timing
    tl.addLabel("scene4Start", "scene2Start+=42")  // Much shorter - after tickets dashboard completes
      .call(() => {
        console.log('=== MASTER TIMELINE: STARTING SCENE 4 ===');
        showScene('scene4');
      }, undefined, "scene4Start")
      .call(() => {
        scene4Sequence();
      }, undefined, "scene4Start+=0.5")
      .call(() => hideScene('scene4'), undefined, "scene4Start+=8.5");

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
        top: '47%',
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

    // Show caption text
    addTimeout(() => {
      const captionText = document.getElementById('captionText');
      if (captionText) {
        gsap.to(captionText, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.7)"
        });
      }
    }, 4000);

    // Move cursor to button
    addTimeout(() => {
      gsap.to(cursor, {
        left: '50%',
        top: '58%',
        duration: 1,
        ease: "power2.inOut"
      });
    }, 5000);

    // Hover effect on button
    addTimeout(() => {
      createBtn.classList.add('hover');
    }, 6000);

    // Click button and show success
    addTimeout(() => {
      showClickEffect();
      createBtn.classList.add('clicked');
      createBtn.textContent = 'Action Created ✓';
      createBtn.classList.add('success');
      
      // Hide cursor after successful action creation
      addTimeout(() => {
        const cursor = document.getElementById('mouseCursor');
        if (cursor) {
          gsap.to(cursor, {
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
            ease: "power2.inOut"
          });
        }
      }, 1000);
    }, 6300);
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

    // Hide dashboard and return to chat (extended timing)
    addTimeout(() => {
      console.log('=== HIDING DASHBOARD, RETURNING TO CHAT ===');
      const dashboardScene = document.getElementById('dashboardScene');
      const chatWindow = document.getElementById('chatWindow');
      
      if (dashboardScene) {
        gsap.to(dashboardScene, {
          opacity: 0,
          duration: 1,
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
          { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
        );
      }
      
      showScene('scene2');
      continueConversationAfterDashboard();
    }, 23500);  // Dashboard shows at ~15.5s, with 8s duration (15.5+8=23.5s) - extended by 3s more
  };

  const startChatConversation = () => {
    const messages = [
      { type: 'sent', text: 'Show me revenue numbers for North America.' }
    ];

    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '';

    messages.forEach((message, index) => {
      addTimeout(() => {
        // Show typing indicator first (for received messages)
        if (message.type === 'received' && index > 0) {
          const typingDiv = document.createElement('div');
          typingDiv.className = 'flex justify-start mb-3';
          typingDiv.innerHTML = `
            <div class="bg-gray-100 px-4 py-2 rounded-2xl">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          `;
          chatMessages.appendChild(typingDiv);

          // Remove typing and show actual message after delay
          addTimeout(() => {
            if (typingDiv.parentNode) {
              typingDiv.parentNode.removeChild(typingDiv);
            }
            addMessage(message, index);
          }, 3000);
        } else {
          addMessage(message, index);
        }
      }, index * 4000); // Slowed down from 3000 to 4000
    });

    const addMessage = (message: { type: string; text: string }, messageIndex: number) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} mb-3`;
      
      // For the sent message with North America, initially show without highlighting
      let messageText = message.text;
      if (message.type === 'sent' && message.text.includes('North America')) {
        messageText = 'Show me revenue numbers for North America.'; // Plain text first
      }
      
      messageDiv.innerHTML = `
        <div class="max-w-xs px-4 py-2 rounded-2xl ${
          message.type === 'sent' 
            ? 'bg-rose-500 text-white' 
            : 'bg-gray-100 text-gray-800'
        }">
          <div class="text-sm" id="messageText-${messageIndex}">${messageText}</div>
          <div class="text-xs opacity-70 mt-1">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
      `;
      
      gsap.fromTo(messageDiv, 
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, // Slowed down
          ease: "back.out(1.7)",
          onComplete: () => {
            // After message is shown, show analyzing bubble and highlight
            if (message.type === 'sent' && message.text.includes('North America')) {
              addTimeout(() => {
                showInitialAnalyzingBubble();
              }, 1500);
            }
          }
        }
      );
      
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };
  };

  let initialAnalyzingBubbleDiv: HTMLElement | null = null;

  const showInitialAnalyzingBubble = () => {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // First highlight North America when analyzing starts
    highlightNorthAmericaInChat();

    // Then show analyzing bubble
    addTimeout(() => {
      initialAnalyzingBubbleDiv = document.createElement('div');
      initialAnalyzingBubbleDiv.className = 'flex justify-start mb-3';
      initialAnalyzingBubbleDiv.innerHTML = `
        <div class="bg-gray-100 px-4 py-3 rounded-2xl">
          <div class="flex items-center space-x-2">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <div class="text-sm text-gray-600">Analyzing...</div>
          </div>
        </div>
      `;
      
      gsap.fromTo(initialAnalyzingBubbleDiv, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
      );
      
      chatMessages.appendChild(initialAnalyzingBubbleDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Hide the bubble exactly when AI analysis starts (synchronized)
      addTimeout(() => {
        if (initialAnalyzingBubbleDiv && initialAnalyzingBubbleDiv.parentNode) {
          gsap.to(initialAnalyzingBubbleDiv, {
            opacity: 0,
            y: -10,
            duration: 0.1,
            onComplete: () => {
              if (initialAnalyzingBubbleDiv && initialAnalyzingBubbleDiv.parentNode) {
                initialAnalyzingBubbleDiv.parentNode.removeChild(initialAnalyzingBubbleDiv);
              }
              // Trigger AI analysis immediately after bubble is removed
              startAIArchitecture();
            }
          });
        }
      }, 1000); // Start hiding analyzing bubble after 1s
    }, 500);
  };

  const highlightNorthAmericaInChat = () => {
    // Find the sent message containing North America
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const sentMessages = chatMessages.querySelectorAll('.flex.justify-end');
    sentMessages.forEach((messageDiv) => {
      const textDiv = messageDiv.querySelector('.text-sm');
      if (textDiv && textDiv.textContent?.includes('North America')) {
        // Replace text with highlighted version
        textDiv.innerHTML = 'Show me revenue numbers for <span class="highlight-north-america">North America</span>.';
        
        // Animate the highlight
        const highlightElement = textDiv.querySelector('.highlight-north-america');
        if (highlightElement) {
          gsap.fromTo(highlightElement,
            { backgroundColor: 'transparent', scale: 1 },
            { 
              backgroundColor: '#EAB308',
              scale: 1.05,
              duration: 0.8,
              ease: "power2.out",
              yoyo: true,
              repeat: 1
            }
          );
        }
      }
    });
  };

  // Animate Step 2 processing cards with counters
  const animateProcessingCards = () => {
    const cards = document.querySelectorAll('.processing-card');
    
    cards.forEach((card, index) => {
      const delay = parseInt(card.getAttribute('data-delay') || '0');
      
      // Animate card appearance
      addTimeout(() => {
        gsap.fromTo(card,
          { opacity: 0, y: 30, scale: 0.9 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.6, 
            ease: "back.out(1.7)"
          }
        );
        
        // Animate counter
        const counterElement = card.querySelector('.counter-number');
        if (counterElement) {
          const target = parseInt(counterElement.getAttribute('data-target') || '0');
          const obj = { value: 0 };
          
          gsap.to(obj, {
            value: target,
            duration: 1.5,
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

  // Animate Step 3 completion sequence with staggered checkmarks
  const animateCompletionSequence = () => {
    const completionItems = document.querySelectorAll('.completion-item');
    
    completionItems.forEach((item, index) => {
      const order = parseInt(item.getAttribute('data-order') || '1');
      const delay = (order - 1) * 800; // 800ms between each completion
      
      addTimeout(() => {
        const checkmark = item.querySelector('.checkmark');
        const pingEffect = item.querySelector('.ping-effect');
        
        if (pingEffect) {
          (pingEffect as HTMLElement).style.opacity = '0.6';
          addTimeout(() => {
            (pingEffect as HTMLElement).style.opacity = '0';
          }, 600);
        }
        
        if (checkmark) {
          gsap.fromTo(checkmark,
            { opacity: 0, scale: 0, rotation: -180 },
            { 
              opacity: 1, 
              scale: 1, 
              rotation: 0,
              duration: 0.6, 
              ease: "back.out(2.7)"
            }
          );
        }
        
        // Add completion celebration
        gsap.fromTo(item,
          { scale: 1 },
          { 
            scale: 1.1,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.out"
          }
        );
      }, delay);
    });
  };

  const startAIArchitecture = () => {
    console.log('=== STARTING AI ANALYSIS FADE-IN ===');
    const chatWindow = document.getElementById('chatWindow');
    const aiArchitecture = document.getElementById('aiArchitecture');
    
    if (!chatWindow || !aiArchitecture) {
      console.error('Missing chat or analysis elements');
      return;
    }

    // Step 1: Completely hide chat and fade in analysis
    gsap.to(chatWindow, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        chatWindow.style.display = 'none';
        console.log('Chat completely hidden');
      }
    });

    // Fade in analysis window smoothly
    aiArchitecture.style.display = 'block';
    gsap.fromTo(aiArchitecture,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 1.5,
        ease: "power2.out",
        delay: 0.3,
        onComplete: () => {
          console.log('Analysis window faded in cleanly, starting 3-step sequence');
        }
      }
    );

    // Step 1: Data Collection (1-4s) - Extended by 1s
    addTimeout(() => {
      const step1 = document.getElementById('analysisStep1');
      if (step1) {
        gsap.to(step1, {
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          onComplete: () => {
            // Animate data dots
            const dataDots = step1.querySelectorAll('.data-dot');
            dataDots.forEach((dot, index) => {
              gsap.fromTo(dot,
                { opacity: 0, scale: 0 },
                { 
                  opacity: 1, 
                  scale: 1, 
                  duration: 0.5, 
                  ease: "back.out(1.7)",
                  delay: index * 0.2
                }
              );
            });
          }
        });
      }
    }, 1000);

    // Step 2: Processing (4-7.5s) - Extended by 2s total
    addTimeout(() => {
      const step1 = document.getElementById('analysisStep1');
      const step2 = document.getElementById('analysisStep2');
      
      if (step1) {
        gsap.to(step1, {
          opacity: 0,
          x: -100,
          duration: 0.8,
          ease: "power2.in"
        });
      }
      
      if (step2) {
        gsap.fromTo(step2,
          { opacity: 0, x: 100 },
          { 
            opacity: 1, 
            x: 0,
            duration: 1.2, 
            ease: "power2.out",
            delay: 0.3,
            onComplete: () => {
              // Animate processing cards and counters
              animateProcessingCards();
            }
          }
        );
      }
    }, 4000);

    // Step 3: Results (7.5-11s) - Extended by 2s total
    addTimeout(() => {
      const step2 = document.getElementById('analysisStep2');
      const step3 = document.getElementById('analysisStep3');
      
      if (step2) {
        gsap.to(step2, {
          opacity: 0,
          x: -100,
          duration: 0.8,
          ease: "power2.in"
        });
      }
      
      if (step3) {
        gsap.fromTo(step3,
          { opacity: 0, x: 100 },
          { 
            opacity: 1, 
            x: 0,
            duration: 1.2, 
            ease: "power2.out",
            delay: 0.3,
            onComplete: () => {
              // Animate completion checkmarks in sequence
              animateCompletionSequence();
            }
          }
        );
      }
    }, 7500);

    // Exit to Dashboard after Step 3 completes - Extended by 2s total
    addTimeout(() => {
      const step3 = document.getElementById('analysisStep3');
      
      if (step3) {
        gsap.to(step3, {
          opacity: 0,
          scale: 0.9,
          y: -50,
          duration: 0.8,
          ease: "power2.in",
          onComplete: () => {
            // Immediately transition to dashboard when Step 3 fades out
            gsap.to(aiArchitecture, { 
              opacity: 0, 
              duration: 0.5,
              onComplete: () => {
                aiArchitecture.style.display = 'none';
                // Show dashboard immediately
                console.log('=== DASHBOARD TIME: Analysis complete, showing dashboard immediately ===');
                startDashboardTransition();
              }
            });
          }
        });
      }
    }, 11000);
  };

  const continueConversationAfterDashboard = () => {
    console.log('=== CONTINUING CONVERSATION AFTER DASHBOARD ===');
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
      console.error('Chat messages container not found!');
      return;
    }

    // Agent responds about North America numbers (quicker timing)
    addTimeout(() => {
      addChatMessage({
        type: 'received',
        text: 'Here are the North America numbers. Revenue is up 15% vs rest of world, driven by strong US performance.'
      }, false);
    }, 1000);

    // Agent asks if can help with anything else (shorter gap)
    addTimeout(() => {
      addChatMessage({
        type: 'received', 
        text: 'Can I help with anything else?'
      }, false);
    }, 4000);

    // User asks about support tickets (quicker)
    addTimeout(() => {
      addChatMessage({
        type: 'sent',
        text: 'Show me today\'s support tickets'
      }, false);
    }, 6500);

    // Show analyzing bubble (brief)
    addTimeout(() => {
      showAnalyzingBubble();
    }, 8000);

    // Agent responds with ticket summary (optimized timing)
    addTimeout(() => {
      hideAnalyzingBubble();
      addChatMessage({
        type: 'received',
        text: 'We have 5 tickets today:\n\n• 3 Resolved (billing & features)\n• 2 Open (1 high-priority bug, 1 pending)\n\nWant to see the full details?'
      }, true);
    }, 11000);

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
      }, 1800);
    }, 13000);  // Faster YES response - 2s after question instead of 3.5s
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
    dashboardDiv.className = 'fixed inset-0 bg-white flex items-center justify-center p-6 z-50';
    dashboardDiv.style.opacity = '0';
    
    dashboardDiv.innerHTML = `
      <div class="w-full max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl mb-4 shadow-lg">
            <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
            </svg>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-3">Support Tickets</h1>
          <p class="text-lg text-gray-600">Today's Support Overview</p>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-2xl p-6 text-gray-900 text-center border border-gray-200 shadow-lg">
            <div class="text-4xl font-bold mb-2 ticket-stat text-blue-600" data-target="5">0</div>
            <div class="text-gray-600 text-sm uppercase tracking-wider">Total Tickets</div>
          </div>
          <div class="bg-white rounded-2xl p-6 text-gray-900 text-center border border-gray-200 shadow-lg">
            <div class="text-4xl font-bold mb-2 ticket-stat text-emerald-600" data-target="3">0</div>
            <div class="text-gray-600 text-sm uppercase tracking-wider">Resolved</div>
          </div>
          <div class="bg-white rounded-2xl p-6 text-gray-900 text-center border border-gray-200 shadow-lg">
            <div class="text-4xl font-bold mb-2 ticket-stat text-rose-600" data-target="2">0</div>
            <div class="text-gray-600 text-sm uppercase tracking-wider">Open</div>
          </div>
        </div>

        <!-- Tickets List -->
        <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Recent Tickets</h3>
          <div class="space-y-3">
            <div class="ticket-row bg-gray-50 rounded-xl p-4 flex items-center justify-between opacity-0">
              <div class="flex items-center space-x-4">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <div class="text-gray-900 font-medium">#12847 - Payment Processing Error</div>
                  <div class="text-gray-600 text-sm">High Priority • Credit card transaction failed</div>
                </div>
              </div>
              <span class="px-3 py-1 bg-red-500/10 text-red-600 text-sm rounded-full border border-red-200">Open</span>
            </div>
            
            <div class="ticket-row bg-gray-50 rounded-xl p-4 flex items-center justify-between opacity-0">
              <div class="flex items-center space-x-4">
                <div class="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <div>
                  <div class="text-gray-900 font-medium">#12846 - Billing Question</div>
                  <div class="text-gray-600 text-sm">Low Priority • Monthly subscription inquiry</div>
                </div>
              </div>
              <span class="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-sm rounded-full border border-emerald-200">Resolved</span>
            </div>
            
            <div class="ticket-row bg-gray-50 rounded-xl p-4 flex items-center justify-between opacity-0">
              <div class="flex items-center space-x-4">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <div class="text-gray-900 font-medium">#12845 - Feature Request</div>
                  <div class="text-gray-600 text-sm">Low Priority • Dark mode implementation</div>
                </div>
              </div>
              <span class="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-sm rounded-full border border-emerald-200">Resolved</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add to DOM
    document.body.appendChild(dashboardDiv);
    
    // Step 3: Animate dashboard in
    gsap.fromTo(dashboardDiv,
      { opacity: 0, scale: 0.9 },
      { 
        opacity: 1, 
        scale: 1,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          // Animate dashboard content
          animateTicketsDashboard();
        }
      }
    );
  };

  const animateTicketsDashboard = () => {
    console.log('=== ANIMATING TICKETS DASHBOARD ===');
    
    // Animate header
    addTimeout(() => {
      const header = document.querySelector('#ticketsDashboard .text-center');
      if (header) {
        gsap.fromTo(header,
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
        );
      }
    }, 200);
    
    // Animate stats with counters
    addTimeout(() => {
      const stats = document.querySelectorAll('.ticket-stat');
      stats.forEach((stat, index) => {
        const target = parseInt(stat.getAttribute('data-target') || '0');
        
        // Animate container
        const container = stat.closest('.rounded-2xl');
        if (container) {
          gsap.fromTo(container,
            { scale: 0, rotation: 5 },
            { 
              scale: 1, 
              rotation: 0,
              duration: 0.8, 
              ease: "elastic.out(1, 0.6)",
              delay: index * 0.15
            }
          );
        }
        
        // Animate counter
        addTimeout(() => {
          const obj = { value: 0 };
          gsap.to(obj, {
            value: target,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              stat.textContent = Math.ceil(obj.value).toString();
            }
          });
        }, (index * 150) + 300);
      });
    }, 400);
    
    // Animate ticket rows
    addTimeout(() => {
      const rows = document.querySelectorAll('.ticket-row');
      rows.forEach((row, index) => {
        addTimeout(() => {
          gsap.fromTo(row,
            { x: -100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
          );
        }, index * 200);
      });
    }, 1200);
    
    // Hide dashboard after 5 seconds (optimal timing)
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
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          dashboard.remove();
          console.log('Tickets dashboard removed');
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
    messageDiv.className = `flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} mb-3`;
    
    // Format text for multiline with bullet points
    let formattedText = message.text;
    if (isMultiline) {
      formattedText = message.text
        .split('\n')
        .map(line => line.trim())
        .join('<br>');
    }
    
    messageDiv.innerHTML = `
      <div class="max-w-xs px-4 py-2 rounded-2xl ${
        message.type === 'sent' 
          ? 'bg-rose-500 text-white' 
          : 'bg-gray-100 text-gray-800'
      }">
        <div class="text-sm">${formattedText}</div>
        <div class="text-xs opacity-70 mt-1">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      </div>
    `;
    
    gsap.fromTo(messageDiv, 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
    );
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  let analyzingBubbleDiv: HTMLElement | null = null;

  const showAnalyzingBubble = () => {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    analyzingBubbleDiv = document.createElement('div');
    analyzingBubbleDiv.className = 'flex justify-start mb-3';
    analyzingBubbleDiv.innerHTML = `
      <div class="bg-gray-100 px-4 py-3 rounded-2xl">
        <div class="flex items-center space-x-2">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
          <div class="text-sm text-gray-600">Analyzing support logs...</div>
        </div>
      </div>
    `;
    
    gsap.fromTo(analyzingBubbleDiv, 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
    );
    
    chatMessages.appendChild(analyzingBubbleDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const hideAnalyzingBubble = () => {
    if (analyzingBubbleDiv && analyzingBubbleDiv.parentNode) {
      gsap.to(analyzingBubbleDiv, {
        opacity: 0,
        y: -10,
        duration: 0.5,
        onComplete: () => {
          if (analyzingBubbleDiv && analyzingBubbleDiv.parentNode) {
            analyzingBubbleDiv.parentNode.removeChild(analyzingBubbleDiv);
          }
        }
      });
    }
  };

  const showDashboard = () => {
    console.log('=== DASHBOARD SHOWING ===');
    
    // Just animate counters and create chart - no complex animations
    setTimeout(() => {
      console.log('Starting counter animation');
      animateCounters();
    }, 500);
    
    setTimeout(() => {
      console.log('Creating chart');
      createChart();
    }, 1000);
  };

  const startDashboardTransition = () => {
    console.log('=== STARTING DASHBOARD TRANSITION ===');
    const aiArchitecture = document.getElementById('aiArchitecture');
    const dashboardScene = document.getElementById('dashboardScene');
    
    if (!aiArchitecture || !dashboardScene) {
      console.error('Missing elements for transition');
      return;
    }
    
    // Step 1: Fade out analysis (1 second)
    gsap.to(aiArchitecture, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        aiArchitecture.style.display = 'none';
        console.log('Analysis faded out');
        
        // Step 2: Show and fade in dashboard scene (1.5 seconds)
        dashboardScene.style.display = 'block';
        gsap.fromTo(dashboardScene,
          { opacity: 0 },
          { 
            opacity: 1, 
            duration: 1.5,
            ease: "power2.out",
            onComplete: () => {
              console.log('Dashboard scene faded in');
              
              // Step 3: Animate dashboard content
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
  };

  // Simple Start/Stop control
  const handleStartStop = () => {
    if (!masterTimelineRef.current) return;
    
    if (demoState.isPaused || !demoState.isRunning) {
      masterTimelineRef.current.play();
      setDemoState(prev => ({ ...prev, isPaused: false, isRunning: true }));
    } else {
      masterTimelineRef.current.pause();
      setDemoState(prev => ({ ...prev, isPaused: true }));
    }
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
      
      // Start after loader
      setTimeout(() => {
        setIsLoaded(true);
        timeline.play();
        setDemoState(prev => ({ ...prev, isRunning: true, startTime: Date.now() }));
      }, 3000);
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
          background: linear-gradient(45deg, #F43F5E, #EC4899);
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
          background: linear-gradient(135deg, #F43F5E, #EC4899);
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

      {/* Simple Start/Stop Control */}
      {controlsVisible && (
        <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-30">
          <div className="relative">
            {/* Circular Progress Ring */}
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              {/* Background circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="4"
              />
              {/* Progress circle */}
              <circle
                id="progressCircle"
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#F43F5E"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="175.93"
                strokeDashoffset="175.93"
                className="transition-all duration-300"
              />
            </svg>
            
            {/* Start/Stop Button */}
            <button 
              onClick={handleStartStop}
              className="absolute inset-2 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl hover:bg-white transition-all duration-300 hover:scale-105 interactive-hover"
              tabIndex={0}
              aria-label={demoState.isRunning && !demoState.isPaused ? 'Pause demo' : 'Play demo'}
              aria-pressed={demoState.isRunning && !demoState.isPaused}
            >
              <div className="text-2xl" role="img" aria-hidden="true">
                {demoState.isRunning && !demoState.isPaused ? '⏸️' : '▶️'}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Realistic Mouse Cursor Simulation */}
      <div id="mouseCursor" className="fixed pointer-events-none z-40 opacity-0" style={{ left: '20%', top: '20%' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
          {/* Realistic Windows/Mac cursor */}
          <path d="M3 3L10.07 19.97L12.58 12.58L20 10.07L3 3Z" fill="white" stroke="black" strokeWidth="1"/>
          <path d="M4.5 4.5L8.93 17.43L10.64 11.64L16.5 9.93L4.5 4.5Z" fill="black"/>
        </svg>
        <div id="clickEffect" className="absolute top-2 left-2 w-4 h-4 border-2 border-blue-500 rounded-full opacity-0"></div>
      </div>

      {/* Scene 1: Create Action - Modern Design */}
      <div id="scene1" className="fixed inset-0 opacity-0" style={{ display: 'none' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 w-full max-w-lg overflow-hidden z-10">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-50 to-blue-50 rounded-full transform translate-x-16 -translate-y-16 opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-50 to-rose-50 rounded-full transform -translate-x-12 translate-y-12 opacity-20"></div>
          
          <div className="relative text-center">
            {/* Header with logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                {/* Logo with subtle animation rings */}
                <div className="relative z-10 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100">
                  <Image src="/image/logo.png" alt="BlizzardBerry Logo" width={40} height={40} className="rounded-lg" priority unoptimized />
                </div>
                {/* Subtle animated ring */}
                <div className="absolute inset-0 w-16 h-16 border-2 border-rose-200 rounded-2xl animate-ping opacity-20"></div>
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  BlizzardBerry
                </h1>
                <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-blue-500 rounded-full mt-1"></div>
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

              <div id="captionText" className="text-center text-gray-600 opacity-0 transform translate-y-4 transition-all duration-300">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                  <span>AI is analyzing your request...</span>
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 2: AI Processing & Dashboard */}
      <div id="scene2" className="fixed inset-0 opacity-0" style={{ display: 'none' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-10">
          {/* Chat Section */}
          <div id="chatWindow" className="bg-white rounded-2xl shadow-2xl flex flex-col h-96 transition-all duration-800">
            
            <div id="chatMessages" className="flex-1 p-6 overflow-y-auto space-y-4">
              {/* Messages will be dynamically added here */}
            </div>
            
            <div className="p-6 border-t border-gray-100">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-500"
                  disabled
                />
                <button className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modern 3-Step Revenue Analysis */}
        <div id="aiArchitecture" className="absolute inset-0 bg-white/95 backdrop-blur-sm opacity-0" style={{ display: 'none' }}>
          <div className="relative w-full h-full flex items-center justify-center">
            
            {/* Step 1: Data Collection */}
            <div id="analysisStep1" className="absolute inset-0 flex flex-col items-center justify-center opacity-0">
              <div className="mb-12">
                <div className="relative">
                  <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl flex items-center justify-center shadow-2xl border border-gray-200">
                    <svg width="64" height="64" fill="white" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  {/* Animated data particles */}
                  <div className="absolute inset-0">
                    <div className="data-dot absolute top-1/2 left-0 w-3 h-3 bg-rose-500 rounded-full opacity-0"></div>
                    <div className="data-dot absolute top-1/4 right-0 w-3 h-3 bg-blue-500 rounded-full opacity-0"></div>
                    <div className="data-dot absolute bottom-1/4 left-1/2 w-3 h-3 bg-rose-400 rounded-full opacity-0"></div>
                  </div>
                </div>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 text-center">Collecting Data</h2>
              <p className="text-2xl text-gray-700 text-center max-w-2xl">Gathering sales records, transactions, and regional data from North America...</p>
              <div className="mt-8 flex space-x-4">
                <div className="px-6 py-3 bg-rose-500/10 rounded-full text-rose-700 text-lg border border-rose-200">Sales Database</div>
                <div className="px-6 py-3 bg-blue-500/10 rounded-full text-blue-700 text-lg border border-blue-200">Transaction Log</div>
                <div className="px-6 py-3 bg-gray-500/10 rounded-full text-gray-700 text-lg border border-gray-200">Regional Stats</div>
              </div>
            </div>

            {/* Step 2: Processing */}
            <div id="analysisStep2" className="absolute inset-0 flex flex-col items-center justify-center opacity-0">
              <div className="mb-12">
                <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl border border-gray-200">
                  <svg width="64" height="64" fill="white" viewBox="0 0 24 24" className="animate-spin">
                    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 text-center">Processing Analytics</h2>
              <p className="text-2xl text-gray-700 text-center max-w-2xl mb-8">AI engine analyzing patterns, trends, and revenue metrics...</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 processing-card opacity-0" data-delay="0">
                  <div className="text-3xl font-bold text-rose-600 mb-2 counter-number" data-target="847">0</div>
                  <div className="text-gray-600">Records Analyzed</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 processing-card opacity-0" data-delay="300">
                  <div className="text-3xl font-bold text-blue-600 mb-2 counter-number" data-target="2800">0</div>
                  <div className="text-gray-600">Transaction Volume ($K)</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 processing-card opacity-0" data-delay="600">
                  <div className="text-3xl font-bold text-emerald-600 mb-2 counter-number" data-target="15">0</div>
                  <div className="text-gray-600">Growth Rate (%)</div>
                </div>
              </div>
            </div>

            {/* Step 3: Results */}
            <div id="analysisStep3" className="absolute inset-0 flex flex-col items-center justify-center opacity-0">
              <div className="mb-12">
                <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl border border-gray-200">
                  <svg width="64" height="64" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 text-center">Analysis Complete</h2>
              <p className="text-2xl text-gray-700 text-center max-w-2xl mb-8">Revenue insights ready! Preparing comprehensive dashboard...</p>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center completion-item" data-order="1">
                    <div className="relative">
                      <div className="text-4xl font-bold text-emerald-600 mb-2 checkmark opacity-0 scale-0">✓</div>
                      <div className="absolute inset-0 w-12 h-12 mx-auto border-2 border-emerald-200 rounded-full animate-ping opacity-0 ping-effect"></div>
                    </div>
                    <div className="text-gray-700">Data Ready</div>
                  </div>
                  <div className="text-center completion-item" data-order="2">
                    <div className="relative">
                      <div className="text-4xl font-bold text-blue-600 mb-2 checkmark opacity-0 scale-0">✓</div>
                      <div className="absolute inset-0 w-12 h-12 mx-auto border-2 border-blue-200 rounded-full animate-ping opacity-0 ping-effect"></div>
                    </div>
                    <div className="text-gray-700">Charts Built</div>
                  </div>
                  <div className="text-center completion-item" data-order="3">
                    <div className="relative">
                      <div className="text-4xl font-bold text-rose-600 mb-2 checkmark opacity-0 scale-0">✓</div>
                      <div className="absolute inset-0 w-12 h-12 mx-auto border-2 border-rose-200 rounded-full animate-ping opacity-0 ping-effect"></div>
                    </div>
                    <div className="text-gray-700">Dashboard Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Modern Revenue Dashboard */}
      <div id="dashboardScene" className="fixed inset-0 z-50 opacity-0" style={{ display: 'none' }}>
        {/* Clean white background */}
        <div className="absolute inset-0 bg-white">
          {/* Subtle animated particles using brand colors */}
          <div className="absolute top-10 left-10 w-2 h-2 bg-rose-500/20 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-3 h-3 bg-blue-500/15 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-32 w-2 h-2 bg-rose-600/25 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Main dashboard container */}
        <div id="dashboardWindow" className="relative w-full h-full flex items-center justify-center p-6">
          <div className="w-full max-w-5xl mx-auto">
            
            {/* Header Section */}
            <div className="text-center mb-8" id="dashboardHeader">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl mb-4 shadow-lg">
                <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Revenue Analytics</h1>
              <p className="text-lg text-gray-600">North America • Real-time Performance Dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="statsGrid">
              <div className="metric-card group relative bg-white rounded-2xl p-6 text-gray-900 hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg metric-card-hover card-glow interactive-element" tabIndex={0} role="region" aria-label="Total Revenue: $847K">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent rounded-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-600 text-sm font-medium uppercase tracking-wider">Total Revenue</div>
                    <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="metric-number text-4xl font-bold mb-2 text-rose-600" data-target="847">0</div>
                  <div className="text-gray-500 text-sm">$847K (In thousands)</div>
                </div>
              </div>
              
              <div className="metric-card group relative bg-white rounded-2xl p-6 text-gray-900 hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg metric-card-hover card-glow interactive-element" tabIndex={0} role="region" aria-label="Growth Rate: 18% Year over Year">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent rounded-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-600 text-sm font-medium uppercase tracking-wider">Growth Rate</div>
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="metric-number text-4xl font-bold mb-2 text-blue-600" data-target="18">0</div>
                  <div className="text-gray-500 text-sm">18% Year over Year</div>
                </div>
              </div>
              
              <div className="metric-card group relative bg-white rounded-2xl p-6 text-gray-900 hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg metric-card-hover card-glow interactive-element" tabIndex={0} role="region" aria-label="Active Clients: 2,840 Total">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent rounded-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-600 text-sm font-medium uppercase tracking-wider">Active Clients</div>
                    <div className="w-10 h-10 bg-gray-500/10 rounded-xl flex items-center justify-center">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zM12 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="metric-number text-4xl font-bold mb-2 text-gray-700" data-target="2840">0</div>
                  <div className="text-gray-500 text-sm">2,840 Total Clients</div>
                </div>
              </div>
              
              <div className="metric-card group relative bg-white rounded-2xl p-6 text-gray-900 hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg metric-card-hover card-glow interactive-element" tabIndex={0} role="region" aria-label="Average Deal Size: $298K">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent rounded-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-600 text-sm font-medium uppercase tracking-wider">Avg Deal Size</div>
                    <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="metric-number text-4xl font-bold mb-2 text-rose-600" data-target="298">0</div>
                  <div className="text-gray-500 text-sm">$298K Average</div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg" id="chartSection">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Revenue Trend Analysis</h3>
                  <p className="text-gray-600">6-Month performance overview • June - November 2024</p>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-rose-500/10 to-rose-600/10 rounded-full border border-rose-200">
                  <span className="text-rose-600 text-sm font-medium">Live Data</span>
                </div>
              </div>
              <div className="h-64 bg-gray-50 rounded-xl p-3">
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