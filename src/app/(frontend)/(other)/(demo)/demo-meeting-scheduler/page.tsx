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

export default function MeetingSchedulerVideo() {
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

    // Phase 3: Result Display (18s for conversation + calendar interaction)
      .call(() => {
        setVideoState(prev => ({ ...prev, currentPhase: 'result' }));
      }, [], 6)

    // Phase 4: Meeting Finale (4s) - comes after calendar interaction
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
          typeTextWithScroll(userInput, "I need to schedule a new meeting with the team for next week", 40, () => {
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
      // Airplane animation like in demo-ecommerce
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
        text: 'I need to schedule a new meeting with the team for next week'
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
                  messageContent.innerHTML = `<div class="text-base leading-relaxed">Sure! I'll help you schedule a meeting. Let me show you available time slots for next week.</div>`;
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
          
          // Continue with calendar selection
          addTimeout(() => {
            continueWithCalendarResults();
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
          ? 'bg-brand/15 text-brand hover:scale-[1.02]' 
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
            <div class="w-2 h-2 bg-brand/15 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-brand/15 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-brand/15 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
          <div class="text-base text-muted-foreground">Checking calendar...</div>
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

  const continueWithCalendarResults = () => {
    console.log('=== Showing calendar overlay ===');
    
    // Show calendar overlay with month view
    addTimeout(() => {
      console.log('Adding calendar overlay');
      showCalendarOverlay();
    }, 800); // Show overlay after AI message
  };

  const showCalendarOverlay = () => {
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
    
    // Create calendar overlay
    const calendarOverlay = document.createElement('div');
    calendarOverlay.id = 'calendarOverlay';
    calendarOverlay.className = 'absolute inset-0 flex items-center justify-center z-10';
    
    // Generate calendar dates - show we're currently on the 10th (week before 17th)
    const today = new Date(2025, 8, 10); // September 10, 2025 - current day (week before 17th)
    const nextWeek = new Date(2025, 8, 17); // September 17, 2025 (month is 0-indexed)
    const month = nextWeek.toLocaleString('en-US', { month: 'long' });
    const year = nextWeek.getFullYear();
    
    // Generate calendar days for the month
    const firstDay = new Date(year, nextWeek.getMonth(), 1);
    const lastDay = new Date(year, nextWeek.getMonth() + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // Available days - roughly 70% of days from 17th onwards
    // September has 30 days, from 17th-30th = 14 days, 70% = ~10 days available
    const availableDays = [17, 18, 20, 21, 23, 25, 26, 27, 29, 30]; // 10 out of 14 days
    
    let calendarDays = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays += '<div class="h-8 w-8"></div>';
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate();
      const isTargetDay = day === nextWeek.getDate();
      const isAvailableDay = availableDays.includes(day);
      const dayClasses = isToday
        ? 'text-gray-900 font-semibold underline underline-offset-1' // Today's date (10th) - just underlined
        : isAvailableDay 
          ? 'bg-brand/10 border border-brand/20 font-semibold text-brand hover:bg-brand/15' // All available days same styling
          : 'text-gray-400'; // Unavailable days
      
      calendarDays += `
        <div id="day-${day}" class="h-8 w-8 flex items-center justify-center text-sm cursor-pointer rounded transition-colors ${dayClasses}">
          ${day}
        </div>
      `;
    }
    
    calendarOverlay.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <h3 class="text-2xl font-bold text-center mb-6 text-gray-900">Choose a date</h3>
        
        <!-- Calendar Header -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold text-gray-800">${month} ${year}</h4>
          </div>
          
          <!-- Days of week header -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div class="h-8 w-8 flex items-center justify-center text-xs font-semibold text-gray-500">Su</div>
            <div class="h-8 w-8 flex items-center justify-center text-xs font-semibold text-gray-500">Mo</div>
            <div class="h-8 w-8 flex items-center justify-center text-xs font-semibold text-gray-500">Tu</div>
            <div class="h-8 w-8 flex items-center justify-center text-xs font-semibold text-gray-500">We</div>
            <div class="h-8 w-8 flex items-center justify-center text-xs font-semibold text-gray-500">Th</div>
            <div class="h-8 w-8 flex items-center justify-center text-xs font-semibold text-gray-500">Fr</div>
            <div class="h-8 w-8 flex items-center justify-center text-xs font-semibold text-gray-500">Sa</div>
          </div>
          
          <!-- Calendar Days Grid -->
          <div class="grid grid-cols-7 gap-1">
            ${calendarDays}
          </div>
        </div>
      </div>
    `;

    if (chatContainer) {
      chatContainer.appendChild(calendarOverlay);
      
      // Set initial overlay state - hidden and slightly scaled down
      gsap.set(calendarOverlay, { opacity: 0, scale: 0.95 });
      
      // Simple overlay animation first
      gsap.to(calendarOverlay, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          // After overlay is fully visible, move cursor
          const targetDay = document.getElementById(`day-${nextWeek.getDate()}`);
          if (targetDay && cursor) {
            const rect = targetDay.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + rect.height / 2;
            
            // Smooth cursor movement to target day
            gsap.to(cursor, {
              left: targetX,
              top: targetY,
              duration: 0.8,
              ease: "power2.inOut",
              onComplete: () => {
                // Hover effect
                targetDay.style.backgroundColor = '#fce7e7';
                targetDay.style.borderColor = '#E11D48';
                
                // Click after short hover
                addTimeout(() => {
                  // Click animation on day
                  gsap.to(targetDay, {
                    scale: 0.9,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                      // Remove cursor safely
                      if (cursor && cursor.parentNode) {
                        cursor.remove();
                      }
                      showTimeSelection();
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

  const showTimeSelection = () => {
    const calendarOverlay = document.getElementById('calendarOverlay');
    
    if (calendarOverlay) {
      // Transform calendar to time selection
      const calendarContent = calendarOverlay.querySelector('.bg-white');
      if (calendarContent) {
        gsap.to(calendarContent, {
          scale: 0.9,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            // Replace with time selection
            calendarContent.innerHTML = `
              <h3 class="text-2xl font-bold text-center mb-6 text-gray-900">Choose a time</h3>
              
              <div class="space-y-3">
                <!-- Morning slots -->
                <div class="text-sm font-semibold text-gray-600 mb-2">Morning</div>
                <div id="time-9am" class="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-brand/60 transition-all cursor-pointer hover:shadow-md">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-gray-900">9:00 AM</span>
                    <span class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Available</span>
                  </div>
                </div>
                
                <div id="time-10am" class="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-brand/60 transition-all cursor-pointer hover:shadow-md">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-gray-900">10:00 AM</span>
                    <span class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Available</span>
                  </div>
                </div>
                
                <!-- Afternoon slots -->
                <div class="text-sm font-semibold text-gray-600 mb-2 mt-4">Afternoon</div>
                <div id="time-2pm" class="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-brand/60 transition-all cursor-pointer hover:shadow-md">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-gray-900">2:00 PM</span>
                    <span class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Available</span>
                  </div>
                </div>
                
                <div id="time-3pm" class="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-brand/60 transition-all cursor-pointer hover:shadow-md">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-gray-900">3:00 PM</span>
                    <span class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Available</span>
                  </div>
                </div>
              </div>
            `;
            
            // Animate time selection in
            gsap.to(calendarContent, {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
              onComplete: () => {
                // Create new cursor for time selection
                const timeCursor = document.createElement('div');
                timeCursor.className = 'absolute w-6 h-6 pointer-events-none z-30';
                timeCursor.style.transform = 'translate(-2px, -2px)';
                timeCursor.innerHTML = `
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2L20 12.5L14 14.5L11.5 20L8 2Z" fill="white" stroke="black" stroke-width="1"/>
                  </svg>
                `;
                timeCursor.id = 'timeCursor';
                
                // Position cursor at center initially
                gsap.set(timeCursor, {
                  left: window.innerWidth / 2,
                  top: window.innerHeight / 2,
                  opacity: 1
                });
                document.body.appendChild(timeCursor);
                
                // Move cursor to 2PM option after brief delay
                addTimeout(() => {
                  const selectedTime = document.getElementById('time-2pm');
                  if (selectedTime && timeCursor) {
                    const rect = selectedTime.getBoundingClientRect();
                    const targetX = rect.left + rect.width / 2;
                    const targetY = rect.top + rect.height / 2;
                    
                    // Animate cursor to 2PM
                    gsap.to(timeCursor, {
                      left: targetX,
                      top: targetY,
                      duration: 0.8,
                      ease: "power2.inOut",
                      onComplete: () => {
                        // Hover effect
                        selectedTime.style.borderColor = '#E11D48';
                        selectedTime.style.backgroundColor = '#fce7e7';
                        
                        // Click after hover
                        addTimeout(() => {
                          // Click animation
                          gsap.to(selectedTime, {
                            scale: 0.95,
                            duration: 0.1,
                            yoyo: true,
                            repeat: 1,
                            onComplete: () => {
                              // Remove cursor
                              if (timeCursor && timeCursor.parentNode) {
                                timeCursor.remove();
                              }
                              hideCalendarOverlay();
                            }
                          });
                        }, 600);
                      }
                    });
                  }
                }, 800); // Wait for time selection to settle
              }
            });
          }
        });
      }
    }
  };

  const hideCalendarOverlay = () => {
    const calendarOverlay = document.getElementById('calendarOverlay');
    
    // Skip restoring chat - go directly to confirmation
    if (calendarOverlay) {
      gsap.to(calendarOverlay, {
        opacity: 0,
        scale: 0.9,
        duration: 0.2, // Much faster calendar hide
        ease: "power2.in",
        onComplete: () => {
          calendarOverlay.remove();
          // Go directly to confirmation without returning to chat
          transitionToSuccessOverlay();
        }
      });
    }
  };

  const continueWithMeetingConfirmation = () => {
    // Go directly to success confirmation
    addTimeout(() => {
      console.log('Going directly to meeting confirmation');
      transitionToSuccessOverlay();
    }, 300); // Quick transition from overlay to confirmation
  };

  const transitionToSuccessOverlay = () => {
    console.log('=== Starting transition to meeting confirmation ===');
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
      duration: 0.3, // Much faster fade out
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
    console.log('=== Showing meeting confirmation ===');
    
    // Create success dashboard for meeting scheduling
    const dashboardOverlay = document.createElement('div');
    dashboardOverlay.className = 'fixed inset-0 bg-white z-50 flex items-center justify-center';
    dashboardOverlay.id = 'successDashboard';
    
    // Meeting confirmation with modern design
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
          <h2 class="text-3xl font-semibold text-gray-900 text-center mb-3">Meeting Scheduled</h2>
          <p class="text-gray-600 text-center mb-8">Your meeting has been successfully scheduled.</p>
          
          <!-- Meeting Details Card -->
          <div class="bg-gradient-to-r from-brand/5 to-brand/10 rounded-xl p-6 border border-brand/20">
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-brand mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <div class="font-medium text-gray-900">Team Meeting</div>
                  <div class="text-sm text-gray-600">September 17, 2025, 2:00 PM</div>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-brand mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <div class="font-medium text-gray-900">Duration</div>
                  <div class="text-sm text-gray-600">1 hour</div>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-brand mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div>
                  <div class="font-medium text-gray-900">Location</div>
                  <div class="text-sm text-gray-600">Video Conference</div>
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
      scale: 0.9
    });
    
    const content = dashboardOverlay.querySelector('.bg-white');
    const icon = dashboardOverlay.querySelector('.success-checkmark');
    const title = dashboardOverlay.querySelector('h2');
    const subtitle = dashboardOverlay.querySelector('p');
    const meetingCard = dashboardOverlay.querySelector('.bg-gradient-to-r');
    
    console.log('Success animation elements:', { content: !!content, icon: !!icon, title: !!title, subtitle: !!subtitle, meetingCard: !!meetingCard });
    
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
    if (meetingCard) {
      gsap.set(meetingCard, { y: 20, opacity: 0 });
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
    
    // 6. Meeting card appears - smooth and relaxed
    .to(meetingCard, {
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
    particle.style.background = ['#E11D48', '#F43F5E', '#FB7185'][Math.floor(Math.random() * 3)];
    
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
    // Scene 4: Brand Finale - Sequential animation with proper timing
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
          className="h-full bg-gradient-to-r from-brand/60 to-secondary transition-all duration-300 ease-out" 
          style={{ 
            width: videoState.currentPhase === 'chat' ? '25%' :
                   videoState.currentPhase === 'processing' ? '40%' :
                   videoState.currentPhase === 'result' ? '85%' :
                   videoState.currentPhase === 'finale' ? '100%' : '0%'
          }}
        />
      </div>

      {/* Chat Interface - Meeting Scheduler Style */}
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
                <div className="text-center mb-6">
                  <h2 className="text-4xl font-bold text-muted-foreground mb-2">
                    Web Meet<br/>AI Agent
                  </h2>
                </div>
                
                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative overflow-visible">
                    <textarea
                      id="userInput"
                      placeholder="Schedule a meeting..."
                      className="w-full px-6 py-4 pr-16 text-base bg-muted rounded-full focus:outline-none transition-all duration-300 resize-none min-h-[60px] max-h-[120px] leading-normal overflow-hidden"
                      spellCheck={false}
                      disabled
                      rows={1}
                      onInput={(e) => {
                        const textarea = e.target as HTMLTextAreaElement;
                        textarea.style.height = '60px'; // Reset to minimum height
                        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'; // Expand up to max
                      }}
                    />
                    <button id="sendButton" className="group absolute right-3 top-1/2 transform -translate-y-[60%] p-2 hover:scale-110 transition-all duration-300">
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
          <h1 className="text-7xl font-bold text-foreground mb-16 tracking-tight">
            BlizzardBerry
          </h1>
          <div className="h-2 w-48 bg-gradient-to-r from-[#F43F5E] to-[#1D4ED8] rounded-full mx-auto mb-20"></div>
          <div
            id="finaleTagline"
            className="text-xl text-muted-foreground font-normal opacity-0 tracking-wide"
          >
            An AI-powered natural language interface for every app
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