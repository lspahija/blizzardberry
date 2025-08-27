import { VideoTemplate } from '../types';

/**
 * Generic video templates that can be applied to any business type
 */
export const genericVideoTemplates: VideoTemplate[] = [
  {
    id: 'saas-dashboard-template',
    name: 'SaaS Dashboard Demo',
    description:
      'Perfect for showcasing business intelligence, analytics, and data-driven products',
    config: {
      totalDuration: 45000,
      scenes: [
        {
          id: 'intro',
          type: 'intro',
          duration: 8000,
          config: {
            showHeader: true,
            animationType: 'fade',
            layout: 'centered',
          },
        },
        {
          id: 'demo-query',
          type: 'demo',
          duration: 12000,
          config: {
            showChat: true,
            animationType: 'slide',
            layout: 'centered',
          },
        },
        {
          id: 'dashboard-display',
          type: 'dashboard',
          duration: 15000,
          config: {
            showHeader: true,
            showMetrics: true,
            animationType: 'scale',
            layout: 'full',
          },
        },
        {
          id: 'data-table',
          type: 'data',
          duration: 8000,
          config: {
            showData: true,
            animationType: 'slide',
            layout: 'full',
          },
        },
        {
          id: 'brand-outro',
          type: 'outro',
          duration: 6000,
          config: {
            showHeader: true,
            animationType: 'fade',
            layout: 'centered',
          },
        },
      ],
      styling: {
        backgroundColor: '#ffffff',
        windowSize: { width: 600, height: 680 },
      },
      timings: {
        typingSpeed: 50,
        transitionSpeed: 800,
        sceneTransitionDelay: 500,
      },
    },
  },
  {
    id: 'analytics-dashboard-template',
    name: 'Analytics Dashboard',
    description: 'Heavy focus on data visualization and metrics display',
    config: {
      totalDuration: 35000,
      scenes: [
        {
          id: 'intro',
          type: 'intro',
          duration: 5000,
          config: {
            showHeader: true,
            animationType: 'fade',
            layout: 'centered',
          },
        },
        {
          id: 'query-demo',
          type: 'demo',
          duration: 8000,
          config: {
            showChat: true,
            animationType: 'slide',
            layout: 'centered',
          },
        },
        {
          id: 'main-dashboard',
          type: 'dashboard',
          duration: 18000,
          config: {
            showHeader: true,
            showMetrics: true,
            animationType: 'scale',
            layout: 'full',
          },
        },
        {
          id: 'brand-outro',
          type: 'outro',
          duration: 6000,
          config: {
            showHeader: true,
            animationType: 'fade',
            layout: 'centered',
          },
        },
      ],
      styling: {
        backgroundColor: '#ffffff',
        windowSize: { width: 700, height: 750 },
      },
      timings: {
        typingSpeed: 60,
        transitionSpeed: 1000,
        sceneTransitionDelay: 300,
      },
    },
  },
  {
    id: 'chat-demo-template',
    name: 'Chat Demo',
    description: 'Focuses on conversational AI and chat interactions',
    config: {
      totalDuration: 25000,
      scenes: [
        {
          id: 'intro',
          type: 'intro',
          duration: 3000,
          config: {
            showHeader: true,
            animationType: 'fade',
            layout: 'centered',
          },
        },
        {
          id: 'chat-interaction',
          type: 'demo',
          duration: 18000,
          config: {
            showChat: true,
            animationType: 'slide',
            layout: 'centered',
          },
        },
        {
          id: 'brand-outro',
          type: 'outro',
          duration: 6000,
          config: {
            showHeader: true,
            animationType: 'fade',
            layout: 'centered',
          },
        },
      ],
      styling: {
        backgroundColor: '#f8fafc',
        windowSize: { width: 500, height: 600 },
      },
      timings: {
        typingSpeed: 40,
        transitionSpeed: 600,
        sceneTransitionDelay: 200,
      },
    },
  },
  {
    id: 'product-showcase-template',
    name: 'Product Showcase',
    description: 'Ideal for demonstrating product features and capabilities',
    config: {
      totalDuration: 30000,
      scenes: [
        {
          id: 'intro',
          type: 'intro',
          duration: 4000,
          config: {
            showHeader: true,
            animationType: 'fade',
            layout: 'centered',
          },
        },
        {
          id: 'product-demo',
          type: 'demo',
          duration: 12000,
          config: {
            showChat: true,
            animationType: 'slide',
            layout: 'split',
          },
        },
        {
          id: 'feature-data',
          type: 'data',
          duration: 10000,
          config: {
            showData: true,
            showMetrics: true,
            animationType: 'scale',
            layout: 'full',
          },
        },
        {
          id: 'brand-outro',
          type: 'outro',
          duration: 6000,
          config: {
            showHeader: true,
            animationType: 'fade',
            layout: 'centered',
          },
        },
      ],
      styling: {
        backgroundColor: '#ffffff',
        windowSize: { width: 600, height: 650 },
      },
      timings: {
        typingSpeed: 45,
        transitionSpeed: 700,
        sceneTransitionDelay: 400,
      },
    },
  },
  {
    id: 'generic-demo-template',
    name: 'Generic Demo',
    description: 'Flexible template that works for any business type',
    config: {
      totalDuration: 28000,
      scenes: [
        {
          id: 'intro',
          type: 'intro',
          duration: 4000,
          config: {
            showHeader: true,
            animationType: 'fade',
            layout: 'centered',
          },
        },
        {
          id: 'main-demo',
          type: 'demo',
          duration: 15000,
          config: {
            showChat: true,
            showMetrics: true,
            animationType: 'slide',
            layout: 'centered',
          },
        },
        {
          id: 'supporting-data',
          type: 'data',
          duration: 7000,
          config: {
            showData: true,
            animationType: 'fade',
            layout: 'full',
          },
        },
        {
          id: 'brand-outro',
          type: 'outro',
          duration: 5000,
          config: {
            showHeader: true,
            animationType: 'fade',
            layout: 'centered',
          },
        },
      ],
      styling: {
        backgroundColor: '#ffffff',
        windowSize: { width: 580, height: 620 },
      },
      timings: {
        typingSpeed: 50,
        transitionSpeed: 750,
        sceneTransitionDelay: 350,
      },
    },
  },
];

/**
 * Select the best template based on business type and focus
 */
export function getTemplateForBusinessType(
  businessType: 'saas' | 'ecommerce' | 'analytics' | 'service' | 'generic',
  primaryFocus: 'dashboard' | 'chat' | 'data' | 'product' | 'service'
): VideoTemplate {
  // Template selection logic
  const templateMap: Record<string, string> = {
    'saas-dashboard': 'saas-dashboard-template',
    'saas-data': 'analytics-dashboard-template',
    'saas-chat': 'chat-demo-template',
    'saas-product': 'product-showcase-template',
    'saas-service': 'saas-dashboard-template',

    'analytics-dashboard': 'analytics-dashboard-template',
    'analytics-data': 'analytics-dashboard-template',
    'analytics-chat': 'analytics-dashboard-template',
    'analytics-product': 'analytics-dashboard-template',
    'analytics-service': 'analytics-dashboard-template',

    'ecommerce-dashboard': 'product-showcase-template',
    'ecommerce-data': 'product-showcase-template',
    'ecommerce-chat': 'product-showcase-template',
    'ecommerce-product': 'product-showcase-template',
    'ecommerce-service': 'product-showcase-template',

    'service-dashboard': 'chat-demo-template',
    'service-data': 'chat-demo-template',
    'service-chat': 'chat-demo-template',
    'service-product': 'chat-demo-template',
    'service-service': 'chat-demo-template',

    'generic-dashboard': 'saas-dashboard-template',
    'generic-data': 'analytics-dashboard-template',
    'generic-chat': 'chat-demo-template',
    'generic-product': 'product-showcase-template',
    'generic-service': 'generic-demo-template',
  };

  const key = `${businessType}-${primaryFocus}`;
  const templateId = templateMap[key] || 'generic-demo-template';

  const selectedTemplate = genericVideoTemplates.find(
    (t) => t.id === templateId
  );
  return (
    selectedTemplate || genericVideoTemplates[genericVideoTemplates.length - 1]
  ); // Fallback to generic
}

/**
 * Get all available templates
 */
export function getAllTemplates(): VideoTemplate[] {
  return genericVideoTemplates;
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): VideoTemplate | null {
  return genericVideoTemplates.find((t) => t.id === id) || null;
}
