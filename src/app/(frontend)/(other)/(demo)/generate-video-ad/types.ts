// Core interfaces for the prompt-to-video pipeline

export interface BusinessDomain {
  companyName: string;
  tagline: string;
  description: string;
  industry: string;

  // Extracted data points
  queries: string[];
  metrics: {
    label: string;
    value: string | number;
    type: 'currency' | 'percentage' | 'count' | 'text';
  }[];

  // Generated dashboard data
  dashboardData?: {
    title: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      status: string;
      priority?: string;
    }>;
  };
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;

  config: {
    totalDuration: number;
    scenes: SceneTemplate[];
    styling: {
      backgroundColor: string;
      windowSize: { width: number; height: number };
    };
    timings: {
      typingSpeed: number;
      transitionSpeed: number;
      sceneTransitionDelay: number;
    };
  };
}

export interface SceneTemplate {
  id: string;
  type: 'intro' | 'demo' | 'dashboard' | 'data' | 'outro';
  duration: number;

  // Generic scene configuration
  config: {
    showHeader?: boolean;
    showMetrics?: boolean;
    showChat?: boolean;
    showData?: boolean;
    animationType?: 'fade' | 'slide' | 'scale';
    layout?: 'centered' | 'split' | 'full';
  };
}

export interface GeneratedScene {
  id: string;
  type: SceneTemplate['type'];
  duration: number;
  content: {
    title?: string;
    subtitle?: string;
    text?: string;
    query?: string;
    response?: string;
    metrics?: BusinessDomain['metrics'];
    data?: any[];
  };
  animations: {
    entrance: string;
    exit: string;
    elements?: Array<{
      selector: string;
      animation: string;
      delay: number;
    }>;
  };
}

export interface GeneratedVideo {
  id: string;
  prompt: string;
  businessDomain: BusinessDomain;
  template: VideoTemplate;
  scenes: GeneratedScene[];
  generatedAt: Date;
}

// Prompt analysis result
export interface PromptAnalysis {
  businessType: 'saas' | 'ecommerce' | 'analytics' | 'service' | 'generic';
  primaryFocus: 'dashboard' | 'chat' | 'data' | 'product' | 'service';
  keyEntities: {
    companyName?: string;
    industry?: string;
    features?: string[];
    metrics?: string[];
    useCases?: string[];
  };
  suggestedTemplate: string;
  confidence: number;
}
