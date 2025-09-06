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

export default function EcommerceShoppingVideo() {
  const [videoState, setVideoState] = useState<VideoState>({
    isRunning: false,
    currentPhase: 'chat'
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
    clearAllTimers();
    setVideoState({ isRunning: true, currentPhase: 'chat' });

    const timeline = gsap.timeline({
      repeat: -1,
      onComplete: () => {
        // Auto-restart
        setVideoState(prev => ({ ...prev, currentPhase: 'chat' }));
        clearAllTimers();
      }
    });

    // Phase 1: Skip intro, go directly to chat
    timeline
      .call(() => {
        setVideoState(prev => ({ ...prev, currentPhase: 'chat' }));
        showChatInterface();
      })

    // Phase 2: Processing phase (3s for processing bubble)  
      .call(() => {
        setVideoState(prev => ({ ...prev, currentPhase: 'processing' }));
        showProcessing();
      }, [], 3)

    // Phase 3: Result Display (18s for conversation + success message)
      .call(() => {
        setVideoState(prev => ({ ...prev, currentPhase: 'result' }));
      }, [], 6)

    // Phase 4: Demo-Niko Finale (4s) - comes earlier
      .call(() => {
        setVideoState(prev => ({ ...prev, currentPhase: 'finale' }));
        showFinale();
      }, [], 20)

    // Phase 5: Complete and restart (2s pause)
      .call(() => {
        setVideoState(prev => ({ ...prev, currentPhase: 'complete' }));
      }, [], 24);

    masterTimelineRef.current = timeline;
    timeline.play();
  };

  const showChatInterface = () => {
    // Show chat interface directly without intro transition
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput') as HTMLTextAreaElement;
    
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
          typeTextWithScroll(userInput, "Find me a floral dress under $150\nin size medium with long sleeves.", 60, () => {
            // Show airplane animation and send with natural pause
            addTimeout(() => {
              triggerAirplane();
            }, 800); // Longer pause before airplane
          });
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
        ease: "power1.out",
        onComplete: () => {
          console.log('Airplane animation complete, transitioning to processing');
          transitionToProcessing();
        }
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
        text: 'Find me a floral dress under $150 in size medium with long sleeves.'
      });

      // Add processing bubble and then continue directly to AI response
      addTimeout(() => {
        addProcessingBubble();
        
        // Continue directly to AI response after processing bubble
        addTimeout(() => {
          console.log('Processing complete, transforming bubble to AI response');
          // Transform processing bubble to AI response instead of removing
          const processingBubble = document.getElementById('processingBubble');
          if (processingBubble) {
            const messageContent = processingBubble.querySelector('.max-w-md > div');
            if (messageContent) {
              // Smoothly transform the processing bubble to first AI message
              gsap.to(messageContent, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                  messageContent.innerHTML = `<div class="text-base leading-relaxed">Found 3 beautiful floral maxi dresses under $150 in size medium with long sleeves:</div>`;
                  gsap.to(messageContent, {
                    opacity: 1,
                    duration: 0.4,
                    ease: "power2.out"
                  });
                }
              });
              // Remove ID so it's treated as normal message
              processingBubble.removeAttribute('id');
            }
          }
          
          // Continue with rest of conversation
          addTimeout(() => {
            continueWithSearchResults();
          }, 1000);
        }, 2000); // Wait 2 seconds after processing bubble appears
      }, 1000); // Wait for user message animation to complete
    }
  };

  const addChatMessageWithSlide = (message: { type: string; text: string }, isMultiline = false) => {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Get existing messages for smooth sliding animation
    const existingMessages = Array.from(chatMessages.querySelectorAll('.chat-message'));
    
    // Format text for multiline with bullet points
    let formattedText = message.text;
    if (isMultiline) {
      formattedText = message.text
        .split('\n')
        .map(line => line.trim())
        .join('<br>');
    }

    // Create the new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} chat-message`;
    messageDiv.innerHTML = `
      <div class="max-w-md px-5 py-3 rounded-2xl transition-all duration-300 ${
        message.type === 'sent' 
          ? 'bg-teal-500 text-white hover:scale-[1.02]' 
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
        rotationX: 15
      });
      
      // Animate existing messages up with smooth stagger
      existingMessages.forEach((el, i) => {
        gsap.to(el, {
          y: -totalMove,
          duration: 1.0,
          delay: i * 0.04, // More pronounced stagger for elegant wave
          ease: "power3.out"
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
        ease: "power3.out",
        clearProps: "all"
      });
      
    }, chatMessages);
  };

  const addProcessingBubble = () => {
    addChatMessageWithSlide({
      type: 'received',
      text: `
        <div class="flex items-center space-x-3">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-teal-500/60 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-teal-500/60 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-teal-500/60 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
          <div class="text-base text-muted-foreground">Searching products...</div>
        </div>
      `
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
    console.log('Processing phase started - will continue directly to AI response');
  };

  const continueWithSearchResults = () => {
    console.log('=== Showing search results ===');
    
    // Show overlay with 3 product options
    addTimeout(() => {
      console.log('Adding product overlay');
      showProductOverlay();
    }, 800); // Show overlay after AI message
  };

  const showProductOverlay = () => {
    const chatContainer = document.getElementById('chatContainer');
    const chatMessages = document.getElementById('chatMessages');
    
    // Blur the chat in background
    if (chatMessages) {
      gsap.to(chatMessages, {
        filter: 'blur(8px)',
        opacity: 0.3,
        duration: 0.6,
        ease: "power2.out"
      });
    }
    
    // Create realistic cursor first - position it at center of screen initially
    const cursor = document.createElement('div');
    cursor.className = 'absolute w-6 h-6 pointer-events-none z-30';
    cursor.style.transform = 'translate(-2px, -2px)';
    cursor.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 2L20 12.5L14 14.5L11.5 20L8 2Z" fill="white" stroke="black" stroke-width="1"/>
      </svg>
    `;
    cursor.id = 'animatedCursor';
    
    // Position cursor at center of screen initially
    gsap.set(cursor, {
      left: window.innerWidth / 2,
      top: window.innerHeight / 2,
      opacity: 1
    });
    document.body.appendChild(cursor);
    
    // Create product overlay
    const productOverlay = document.createElement('div');
    productOverlay.id = 'productOverlay';
    productOverlay.className = 'absolute inset-0 flex items-center justify-center z-10';
    productOverlay.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <h3 class="text-2xl font-bold text-center mb-6">Choose your dress</h3>
        <div class="space-y-4">
          <!-- Option 1 -->
          <div id="product1" class="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-teal-500 transition-all cursor-pointer hover:shadow-lg">
            <div class="flex items-start space-x-4">
              <div class="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src="/images/dress1.jpg" alt="Vintage Floral Maxi Dress" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 mb-1">Vintage Floral Maxi Dress</h4>
                <p class="text-xs text-gray-600 mb-2">Size M • Long sleeves • Button front</p>
                <div class="text-lg font-bold text-teal-600">$138</div>
              </div>
            </div>
          </div>
          
          <!-- Option 2 -->
          <div id="product2" class="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-teal-500 transition-all cursor-pointer hover:shadow-lg">
            <div class="flex items-start space-x-4">
              <div class="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src="/images/dress2.jpg" alt="Faded Green Floral Dress" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 mb-1">Faded Green Floral Dress</h4>
                <p class="text-xs text-gray-600 mb-2">Size M • Long sleeves • Wrap style</p>
                <div class="text-lg font-bold text-teal-600">$145</div>
              </div>
            </div>
          </div>
          
          <!-- Option 3 -->
          <div id="product3" class="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-teal-500 transition-all cursor-pointer hover:shadow-lg">
            <div class="flex items-start space-x-4">
              <div class="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src="/images/dress3.jpeg" alt="Elegant Floral Maxi Dress" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 mb-1">Elegant Floral Maxi Dress</h4>
                <p class="text-xs text-gray-600 mb-2">Size M • Long sleeves • A-line cut</p>
                <div class="text-lg font-bold text-teal-600">$129</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (chatContainer) {
      chatContainer.appendChild(productOverlay);
      
      // Set initial overlay state - hidden and slightly scaled down
      gsap.set(productOverlay, { opacity: 0, scale: 0.95 });
      
      // Simple overlay animation first
      gsap.to(productOverlay, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          // After overlay is fully visible, move cursor
          const product1 = document.getElementById('product1');
          if (product1 && cursor) {
            const rect = product1.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + rect.height / 2;
            
            // Smooth cursor movement to product1
            gsap.to(cursor, {
              left: targetX,
              top: targetY,
              duration: 0.8,
              ease: "power2.inOut",
              onComplete: () => {
                // Hover effect
                product1.style.borderColor = '#14B8A6';
                product1.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                
                // Click after short hover
                addTimeout(() => {
                  // Click animation on product
                  gsap.to(product1, {
                    scale: 0.95,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                      // Remove cursor safely
                      if (cursor && cursor.parentNode) {
                        cursor.remove();
                      }
                      hideProductOverlay();
                    }
                  });
                }, 600);
              }
            });
          }
        }
      });
    }
  };

  const hideProductOverlay = () => {
    const productOverlay = document.getElementById('productOverlay');
    const chatMessages = document.getElementById('chatMessages');
    
    // Restore chat to normal state
    if (chatMessages) {
      gsap.to(chatMessages, {
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      });
    }
    
    if (productOverlay) {
      gsap.to(productOverlay, {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          productOverlay.remove();
          // Continue with user selection message
          continueWithUserSelection();
        }
      });
    }
  };

  const continueWithUserSelection = () => {
    // Skip user message, go directly to AI confirmation
    addTimeout(() => {
      console.log('AI confirms selection and adds to cart');
      addChatMessageWithSlide({
        type: 'received',
        text: 'Perfect choice! Added the Vintage Floral Maxi Dress to your cart.'
      });

      // Show success animation overlay with smooth chat transition
      addTimeout(() => {
        console.log('Starting smooth transition from chat to success overlay');
        transitionToSuccessOverlay();
      }, 1200); // Wait for confirmation message
    }, 300); // Quick transition from overlay to chat
  };

  const continueWithRestOfConversation = () => {
    // This function is kept for compatibility but now calls the new one
    continueWithSearchResults();
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
    chatTl.to(messages, {
      y: -20,
      opacity: 0,
      scale: 0.95,
      duration: 0.6,
      stagger: -0.03,
      ease: "power2.inOut"
    })
    
    // Fade out chat container
    .to(chatContainer, {
      opacity: 0,
      scale: 0.98,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        chatContainer.style.display = 'none';
        showSuccessDashboard();
      }
    }, "-=0.4");
  };

  const showSuccessDashboard = () => {
    console.log('=== Showing success dashboard ===');
    
    // Create success dashboard for e-commerce
    const dashboardOverlay = document.createElement('div');
    dashboardOverlay.className = 'fixed inset-0 bg-white z-50 flex items-center justify-center';
    dashboardOverlay.id = 'successDashboard';
    
    // E-commerce success message with modern design
    dashboardOverlay.innerHTML = `
      <div class="max-w-lg mx-auto px-8">
        <div class="bg-white rounded-2xl p-10 shadow-xl border border-gray-200/50 backdrop-blur-sm">
          <!-- Success Icon -->
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 success-checkmark">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <!-- Title -->
          <h2 class="text-3xl font-semibold text-gray-900 text-center mb-3">Added to Cart</h2>
          <p class="text-gray-600 text-center mb-8">Your item has been successfully added to your shopping cart.</p>
          
          <!-- Product Card -->
          <div class="bg-gradient-to-r from-gray-50 to-gray-100/70 rounded-xl p-6 border border-gray-200/60">
            <div class="flex items-start space-x-4">
              <div class="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src="/images/dress1.jpg" alt="Vintage Floral Maxi Dress" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 mb-1">Vintage Floral Maxi Dress</h4>
                <div class="text-sm text-gray-600 mb-2">Size M • Long sleeves • Button front</div>
                <div class="text-xl font-bold text-gray-900">$138</div>
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
      scale: 0.9
    });
    
    const content = dashboardOverlay.querySelector('.bg-white');
    const icon = dashboardOverlay.querySelector('.success-checkmark');
    const title = dashboardOverlay.querySelector('h2');
    const subtitle = dashboardOverlay.querySelector('p');
    const productCard = dashboardOverlay.querySelector('.bg-gradient-to-r');
    
    console.log('Success animation elements:', { content: !!content, icon: !!icon, title: !!title, subtitle: !!subtitle, productCard: !!productCard });
    
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
    if (productCard) {
      gsap.set(productCard, { y: 20, opacity: 0 });
    }
    
    // Create smooth entrance timeline
    const tl = gsap.timeline();
    
    // 1. Background fade in - slower and smoother
    tl.to(dashboardOverlay, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "power2.out"
    })
    
    // 2. Content card entrance - more relaxed
    .to(content, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1.0,
      ease: "power3.out"
    }, "-=0.4")
    
    // 3. Success icon appears - gentler bounce
    .to(icon, {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: "back.out(1.4)"
    }, "-=0.2")
    
    // 4. Title appears - slower and elegant
    .to(title, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power2.out"
    }, "-=0.4")
    
    // 5. Subtitle appears - gentle timing
    .to(subtitle, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.5")
    
    // 6. Product card appears - smooth and relaxed
    .to(productCard, {
      y: 0,
      opacity: 1,
      duration: 1.0,
      ease: "power3.out"
    }, "-=0.4")
    
    // 7. Celebration effect
    .call(() => {
      addTimeout(() => {
        // Gentle pulse effect on success icon
        if (icon) {
          gsap.to(icon, {
            scale: 1.1,
            duration: 0.3,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
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
    particle.style.background = ['#10B981', '#14B8A6', '#0D9488'][Math.floor(Math.random() * 3)];
    
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
      ease: "power2.out",
      onComplete: () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }
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
        const content = successDashboard.querySelector('.bg-white');
        
        // Create elegant exit sequence
        const exitTl = gsap.timeline();
        
        // Step 1: Content scales and rotates out
        exitTl.to(content, {
          scale: 0.85,
          rotationY: -15,
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.in"
        })
        
        // Step 2: Background fade with perspective
        .to(successDashboard, {
          opacity: 0,
          scale: 0.9,
          rotationY: -25,
          duration: 0.7,
          ease: "power3.inOut",
          onComplete: () => {
            if (successDashboard.parentNode) {
              successDashboard.parentNode.removeChild(successDashboard);
            }
          }
        }, "-=0.5");
      }
      
      // Immediately fade in finale container
      timeline.to(finaleContainer, {
        opacity: 1,
        scale: 1,
        duration: 1.0,
        ease: "power3.out",
        onComplete: () => {
          animateFinaleElements();
        }
      }, "-=0.4");
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
          className="h-full bg-gradient-to-r from-teal-500 to-secondary transition-all duration-300 ease-out" 
          style={{ 
            width: videoState.currentPhase === 'chat' ? '25%' :
                   videoState.currentPhase === 'processing' ? '40%' :
                   videoState.currentPhase === 'result' ? '85%' :
                   videoState.currentPhase === 'finale' ? '100%' : '0%'
          }}
        />
      </div>

      {/* Chat Interface - E-commerce Style */}
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
                  <h2 className="text-3xl font-bold text-muted-foreground mb-2">
                    Fashion Finds<br/>AI Agent
                  </h2>
                </div>
                
                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative overflow-visible">
                    <textarea
                      id="userInput"
                      placeholder="What are you shopping for today?"
                      className="w-full px-6 py-4 pr-16 text-base bg-muted rounded-2xl focus:outline-none transition-all duration-300 resize-none h-17 leading-normal"
                      spellCheck={false}
                      disabled
                    />
                    <button id="sendButton" className="group absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:scale-110 transition-all duration-300">
                      <div className="transform -rotate-12 group-hover:-rotate-6 transition-transform duration-300">
                        <svg width="20" height="20" fill="#14B8A6" viewBox="0 0 24 24" className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation State: Messages */}
            <div id="conversationState" className="flex-1 flex items-center justify-center" style={{ display: 'none' }}>
              <div id="chatMessages" className="w-full max-w-2xl px-6 flex flex-col gap-4">
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

      {/* Phase indicator dots */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-50">
        {['chat', 'processing', 'result', 'finale'].map((phase) => (
          <div
            key={phase}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              videoState.currentPhase === phase ? 'bg-teal-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}