import { VideoTemplate } from '../types';

export const defaultVideoTemplates: VideoTemplate[] = [
  {
    id: 'saas-dashboard-demo',
    name: 'SaaS Dashboard Demo',
    description:
      'Perfect for showcasing business intelligence, analytics, and dashboard-driven products. Features chat-to-dashboard flow with data visualization.',
    config: {
      timings: {
        sceneDuration: 48000,
        typingSpeed: 50,
        transitionSpeed: 800,
        dashboardDisplay: 3000,
        ticketsDisplay: 5000,
      },
      animations: {
        fadeDuration: 0.6,
        scaleDuration: 0.8,
        slideDuration: 0.5,
      },
      scenes: [
        {
          id: 'chat-intro',
          name: 'Chat Introduction',
          type: 'chat',
          duration: 15000,
          chatConfig: {
            showInitialInput: true,
            enableTypingAnimation: true,
            airplaneAnimation: true,
            conversationFlow: [
              {
                type: 'user',
                content: '',
                delay: 1000,
                useBusinessQuery: 'primary',
              },
              {
                type: 'typing',
                content: 'Analyzing...',
                delay: 2500,
              },
            ],
          },
        },
        {
          id: 'dashboard-display',
          name: 'Dashboard Display',
          type: 'dashboard',
          duration: 8000,
          dashboardConfig: {
            showHeader: true,
            animateCounters: true,
            chartType: 'radial',
            metricsLayout: 'horizontal',
          },
        },
        {
          id: 'chat-continuation',
          name: 'Chat Continuation',
          type: 'chat',
          duration: 12000,
          chatConfig: {
            showInitialInput: true,
            enableTypingAnimation: true,
            airplaneAnimation: true,
            conversationFlow: [
              {
                type: 'user',
                content: '',
                delay: 2000,
                useBusinessQuery: 'secondary',
              },
              {
                type: 'assistant',
                content:
                  'We had 3 tickets today:\n\n• 2 Resolved\n• 1 Open\n\nWould you like to see the full details?',
                delay: 3000,
              },
              {
                type: 'user',
                content: 'Yes, please!',
                delay: 2000,
              },
            ],
          },
        },
        {
          id: 'table-display',
          name: 'Table Display',
          type: 'table',
          duration: 7000,
          tableConfig: {
            title: 'Support Tickets',
            showStats: true,
            animateRows: true,
            rowAnimation: 'slide',
          },
        },
        {
          id: 'brand-finale',
          name: 'Brand Finale',
          type: 'branding',
          duration: 6000,
          brandingConfig: {
            showLogo: true,
            showTagline: true,
            logoSize: 120,
            textSize: 'large',
          },
        },
      ],
      styling: {
        backgroundColor: '#ffffff',
        chatWindowSize: { width: 600, height: 680 },
        borderRadius: '24px',
      },
    },
  },
  {
    id: 'simple-chat-demo',
    name: 'Simple Chat Demo',
    description:
      'Streamlined template focusing on conversational AI interaction. Great for chatbots, virtual assistants, and simple query-response demos.',
    config: {
      timings: {
        sceneDuration: 25000,
        typingSpeed: 40,
        transitionSpeed: 600,
        dashboardDisplay: 0,
      },
      animations: {
        fadeDuration: 0.4,
        scaleDuration: 0.6,
        slideDuration: 0.4,
      },
      scenes: [
        {
          id: 'chat-demo',
          name: 'Chat Demo',
          type: 'chat',
          duration: 18000,
          chatConfig: {
            showInitialInput: true,
            enableTypingAnimation: true,
            airplaneAnimation: false,
            conversationFlow: [
              {
                type: 'user',
                content: '',
                delay: 1000,
                useBusinessQuery: 'primary',
              },
              {
                type: 'typing',
                content: 'Processing...',
                delay: 2000,
              },
              {
                type: 'assistant',
                content:
                  "Here's the information you requested. Our AI can help with various business queries and provide instant insights.",
                delay: 1500,
              },
              {
                type: 'user',
                content: '',
                delay: 2000,
                useBusinessQuery: 'secondary',
              },
              {
                type: 'assistant',
                content:
                  'Absolutely! Our system provides real-time answers to help you make better business decisions.',
                delay: 2000,
              },
            ],
          },
        },
        {
          id: 'brand-finale',
          name: 'Brand Finale',
          type: 'branding',
          duration: 7000,
          brandingConfig: {
            showLogo: true,
            showTagline: true,
            logoSize: 100,
            textSize: 'medium',
          },
        },
      ],
      styling: {
        backgroundColor: '#f8fafc',
        chatWindowSize: { width: 500, height: 600 },
        borderRadius: '16px',
      },
    },
  },
  {
    id: 'analytics-focused',
    name: 'Analytics Focused',
    description:
      'Heavy emphasis on data visualization and metrics. Perfect for analytics platforms, reporting tools, and data-driven products.',
    config: {
      timings: {
        sceneDuration: 35000,
        typingSpeed: 60,
        transitionSpeed: 1000,
        dashboardDisplay: 8000,
      },
      animations: {
        fadeDuration: 0.8,
        scaleDuration: 1.0,
        slideDuration: 0.6,
      },
      scenes: [
        {
          id: 'chat-query',
          name: 'Query Input',
          type: 'chat',
          duration: 8000,
          chatConfig: {
            showInitialInput: true,
            enableTypingAnimation: true,
            airplaneAnimation: true,
            conversationFlow: [
              {
                type: 'user',
                content: '',
                delay: 1500,
                useBusinessQuery: 'primary',
              },
              {
                type: 'typing',
                content: 'Analyzing data...',
                delay: 3000,
              },
            ],
          },
        },
        {
          id: 'primary-dashboard',
          name: 'Primary Dashboard',
          type: 'dashboard',
          duration: 12000,
          dashboardConfig: {
            showHeader: true,
            animateCounters: true,
            chartType: 'radial',
            metricsLayout: 'grid',
          },
        },
        {
          id: 'secondary-dashboard',
          name: 'Secondary Metrics',
          type: 'dashboard',
          duration: 8000,
          dashboardConfig: {
            showHeader: false,
            animateCounters: true,
            chartType: 'bar',
            metricsLayout: 'vertical',
          },
        },
        {
          id: 'brand-finale',
          name: 'Brand Finale',
          type: 'branding',
          duration: 7000,
          brandingConfig: {
            showLogo: true,
            showTagline: true,
            logoSize: 110,
            textSize: 'large',
          },
        },
      ],
      styling: {
        backgroundColor: '#ffffff',
        chatWindowSize: { width: 700, height: 750 },
        borderRadius: '20px',
      },
    },
  },
];
