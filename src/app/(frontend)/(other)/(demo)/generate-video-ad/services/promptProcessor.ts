import {
  BusinessDomain,
  GeneratedVideo,
  PromptAnalysis,
  GeneratedScene,
} from '../types';
import { getTemplateForBusinessType } from '../templates/templateSelector';
import { generateScenesFromDomain } from './sceneGenerator';

/**
 * Main function to process a prompt and generate a complete video
 */
export async function generateVideoFromPrompt(
  prompt: string
): Promise<GeneratedVideo> {
  // 1. Analyze the prompt to understand the business
  const analysis = await analyzePrompt(prompt);

  // 2. Extract business domain information
  const businessDomain = extractBusinessDomain(prompt, analysis);

  // 3. Select appropriate template based on analysis
  const template = getTemplateForBusinessType(
    analysis.businessType,
    analysis.primaryFocus
  );

  // 4. Generate specific scenes with content
  const scenes = generateScenesFromDomain(businessDomain, template);

  // 5. Return complete video object
  return {
    id: `video-${Date.now()}`,
    prompt,
    businessDomain,
    template,
    scenes,
    generatedAt: new Date(),
  };
}

/**
 * Analyze prompt to understand business type and focus
 */
async function analyzePrompt(prompt: string): Promise<PromptAnalysis> {
  const lowerPrompt = prompt.toLowerCase();

  // Detect business type based on keywords
  let businessType: PromptAnalysis['businessType'] = 'generic';
  let primaryFocus: PromptAnalysis['primaryFocus'] = 'product';

  // SaaS indicators
  if (
    lowerPrompt.includes('saas') ||
    lowerPrompt.includes('software as a service') ||
    lowerPrompt.includes('platform') ||
    lowerPrompt.includes('dashboard') ||
    lowerPrompt.includes('analytics') ||
    lowerPrompt.includes('metrics')
  ) {
    businessType = 'saas';
    primaryFocus = 'dashboard';
  }

  // Analytics indicators
  else if (
    lowerPrompt.includes('analytics') ||
    lowerPrompt.includes('data') ||
    lowerPrompt.includes('insights') ||
    lowerPrompt.includes('reporting') ||
    lowerPrompt.includes('visualization') ||
    lowerPrompt.includes('metrics')
  ) {
    businessType = 'analytics';
    primaryFocus = 'data';
  }

  // E-commerce indicators
  else if (
    lowerPrompt.includes('ecommerce') ||
    lowerPrompt.includes('e-commerce') ||
    lowerPrompt.includes('shop') ||
    lowerPrompt.includes('store') ||
    lowerPrompt.includes('product') ||
    lowerPrompt.includes('sales')
  ) {
    businessType = 'ecommerce';
    primaryFocus = 'product';
  }

  // Service indicators
  else if (
    lowerPrompt.includes('service') ||
    lowerPrompt.includes('support') ||
    lowerPrompt.includes('help') ||
    lowerPrompt.includes('customer') ||
    lowerPrompt.includes('chatbot') ||
    lowerPrompt.includes('ai assistant')
  ) {
    businessType = 'service';
    primaryFocus = 'chat';
  }

  // Extract key entities
  const keyEntities = extractKeyEntities(prompt);

  return {
    businessType,
    primaryFocus,
    keyEntities,
    suggestedTemplate: getTemplateIdForType(businessType, primaryFocus),
    confidence: calculateConfidence(prompt, businessType),
  };
}

/**
 * Extract business information from the prompt
 */
function extractBusinessDomain(
  prompt: string,
  analysis: PromptAnalysis
): BusinessDomain {
  const companyName =
    analysis.keyEntities.companyName ||
    extractCompanyName(prompt) ||
    'Your Company';
  const industry =
    analysis.keyEntities.industry || inferIndustry(prompt) || 'Technology';

  // Generate tagline and description
  const tagline = generateTagline(prompt, analysis.businessType);
  const description = extractOrGenerateDescription(prompt);

  // Extract queries for the demo
  const queries = generateQueriesFromPrompt(prompt, analysis.primaryFocus);

  // Generate sample metrics based on business type
  const metrics = generateMetricsFromPrompt(prompt, analysis.businessType);

  // Generate dashboard data if relevant
  const dashboardData =
    analysis.primaryFocus === 'dashboard' || analysis.primaryFocus === 'data'
      ? generateDashboardData(prompt, analysis.businessType)
      : undefined;

  return {
    companyName,
    tagline,
    description,
    industry,
    queries,
    metrics,
    dashboardData,
  };
}

/**
 * Extract company name from prompt
 */
function extractCompanyName(prompt: string): string | null {
  // Look for patterns like "TechFlow", "DataViz Pro", "CloudSync"
  const patterns = [
    /(?:called|named)\s+([A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)?)/,
    /^([A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)?),/,
    /for\s+([A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)?),/,
    /demo\s+for\s+([A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)?)/i,
    /show\s+off\s+([A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)?)/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Look for capitalized words at the beginning
  const firstWords = prompt.split(/[,.]/, 1)[0].trim();
  const capitalizedWords = firstWords.match(
    /^([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)?)/
  );
  if (capitalizedWords) {
    return capitalizedWords[1];
  }

  return null;
}

/**
 * Infer industry from prompt context
 */
function inferIndustry(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  if (
    lowerPrompt.includes('health') ||
    lowerPrompt.includes('medical') ||
    lowerPrompt.includes('patient')
  ) {
    return 'Healthcare';
  }
  if (
    lowerPrompt.includes('finance') ||
    lowerPrompt.includes('banking') ||
    lowerPrompt.includes('payment')
  ) {
    return 'Fintech';
  }
  if (
    lowerPrompt.includes('education') ||
    lowerPrompt.includes('learning') ||
    lowerPrompt.includes('student')
  ) {
    return 'EdTech';
  }
  if (lowerPrompt.includes('real estate') || lowerPrompt.includes('property')) {
    return 'Real Estate';
  }
  if (
    lowerPrompt.includes('retail') ||
    lowerPrompt.includes('shopping') ||
    lowerPrompt.includes('ecommerce')
  ) {
    return 'E-commerce';
  }

  return 'Technology';
}

/**
 * Generate tagline based on prompt and business type
 */
function generateTagline(prompt: string, businessType: string): string {
  const templates = {
    saas: 'The intelligent platform for modern businesses',
    analytics: 'Turn data into actionable insights',
    ecommerce: 'Grow your online business with AI',
    service: 'Exceptional service, powered by AI',
    generic: 'Innovating the future of business',
  };

  return templates[businessType as keyof typeof templates] || templates.generic;
}

/**
 * Extract or generate description from prompt
 */
function extractOrGenerateDescription(prompt: string): string {
  // If prompt is short enough, use it as description
  if (prompt.length <= 200) {
    return prompt;
  }

  // Extract first sentence or main concept
  const sentences = prompt.split(/[.!?]/);
  const firstSentence = sentences[0].trim();

  if (firstSentence.length > 50 && firstSentence.length <= 200) {
    return firstSentence + '.';
  }

  // Fallback: truncate prompt
  return prompt.substring(0, 197) + '...';
}

/**
 * Generate relevant queries for the demo based on focus
 */
function generateQueriesFromPrompt(prompt: string, focus: string): string[] {
  const lowerPrompt = prompt.toLowerCase();

  const focusQueries = {
    dashboard: [
      'Show me our revenue performance this quarter',
      'What are our top metrics this month?',
      'How are we tracking against our goals?',
    ],
    data: [
      'Generate a report on user engagement',
      'Show me the latest analytics data',
      'What trends are we seeing in our data?',
    ],
    chat: [
      'How can you help our customers?',
      'What services do you provide?',
      'Help me with product recommendations',
    ],
    product: [
      'Show me our bestselling products',
      'What products do you recommend?',
      'Display our product catalog',
    ],
    service: [
      'What support options are available?',
      'Help me resolve a customer issue',
      'Show me our service metrics',
    ],
  };

  // Try to extract specific queries from prompt
  const extractedQueries: string[] = [];

  // Look for quoted text or specific questions
  const quotedText = prompt.match(/"([^"]+)"/g);
  if (quotedText) {
    extractedQueries.push(...quotedText.map((q) => q.replace(/"/g, '')));
  }

  // Look for question patterns
  const questions = prompt.match(
    /\b(how|what|when|where|why|show me|tell me|display)[^.!?]*[.!?]/gi
  );
  if (questions) {
    extractedQueries.push(...questions.map((q) => q.trim()));
  }

  // Combine extracted and template queries
  const templateQueries =
    focusQueries[focus as keyof typeof focusQueries] || focusQueries.product;
  const combinedQueries = [...extractedQueries, ...templateQueries];

  // Return first 3 unique queries
  return Array.from(new Set(combinedQueries)).slice(0, 3);
}

/**
 * Generate sample metrics based on business type
 */
function generateMetricsFromPrompt(
  prompt: string,
  businessType: string
): BusinessDomain['metrics'] {
  const lowerPrompt = prompt.toLowerCase();

  // Extract numbers from prompt that might be metrics
  const numberMatches = prompt.match(/(\d+(?:\.\d+)?)\s*%?/g) || [];
  const extractedNumbers = numberMatches.map((match) => {
    const num = parseFloat(match.replace('%', ''));
    const isPercentage = match.includes('%');
    return { value: num, isPercentage };
  });

  const businessMetrics = {
    saas: [
      {
        label: 'Monthly Recurring Revenue',
        value: 247,
        type: 'currency' as const,
      },
      { label: 'Growth Rate', value: 23, type: 'percentage' as const },
      { label: 'Active Users', value: 15420, type: 'count' as const },
    ],
    analytics: [
      { label: 'Data Points Processed', value: 2.3, type: 'count' as const },
      { label: 'Accuracy Rate', value: 96, type: 'percentage' as const },
      { label: 'Reports Generated', value: 1247, type: 'count' as const },
    ],
    ecommerce: [
      { label: 'Monthly Sales', value: 182, type: 'currency' as const },
      { label: 'Conversion Rate', value: 3.2, type: 'percentage' as const },
      { label: 'Products Sold', value: 8934, type: 'count' as const },
    ],
    service: [
      { label: 'Customer Satisfaction', value: 4.8, type: 'count' as const },
      { label: 'Response Time', value: 30, type: 'count' as const },
      { label: 'Issues Resolved', value: 94, type: 'percentage' as const },
    ],
    generic: [
      { label: 'Performance Score', value: 87, type: 'count' as const },
      { label: 'Growth Rate', value: 15, type: 'percentage' as const },
      { label: 'Total Users', value: 5420, type: 'count' as const },
    ],
  };

  let metrics =
    businessMetrics[businessType as keyof typeof businessMetrics] ||
    businessMetrics.generic;

  // Replace with extracted numbers if available
  if (extractedNumbers.length > 0) {
    extractedNumbers.slice(0, 3).forEach((extracted, index) => {
      if (metrics[index]) {
        metrics[index].value = extracted.value;
        if (extracted.isPercentage) {
          metrics[index].type = 'percentage';
        }
      }
    });
  }

  return metrics;
}

/**
 * Generate dashboard data for data-focused demos
 */
function generateDashboardData(
  prompt: string,
  businessType: string
): BusinessDomain['dashboardData'] {
  const lowerPrompt = prompt.toLowerCase();

  // Determine data type from prompt
  let dataType = 'items';
  let title = 'Recent Items';

  if (lowerPrompt.includes('ticket') || lowerPrompt.includes('support')) {
    dataType = 'tickets';
    title = 'Support Tickets';
  } else if (lowerPrompt.includes('order') || lowerPrompt.includes('sales')) {
    dataType = 'orders';
    title = 'Recent Orders';
  } else if (lowerPrompt.includes('user') || lowerPrompt.includes('customer')) {
    dataType = 'users';
    title = 'User Activity';
  } else if (lowerPrompt.includes('task') || lowerPrompt.includes('project')) {
    dataType = 'tasks';
    title = 'Project Tasks';
  }

  const dataTemplates = {
    tickets: [
      {
        id: '#2401',
        title: 'Login Issue',
        description: 'User unable to access dashboard',
        status: 'Open',
        priority: 'High',
      },
      {
        id: '#2402',
        title: 'Payment Failed',
        description: 'Credit card processing error',
        status: 'Resolved',
        priority: 'Medium',
      },
      {
        id: '#2403',
        title: 'Feature Request',
        description: 'Request for dark mode',
        status: 'In Progress',
        priority: 'Low',
      },
    ],
    orders: [
      {
        id: '#ORD-001',
        title: 'Premium Subscription',
        description: 'Annual plan upgrade',
        status: 'Completed',
        priority: 'High',
      },
      {
        id: '#ORD-002',
        title: 'API Credits',
        description: 'Additional API usage',
        status: 'Processing',
        priority: 'Medium',
      },
      {
        id: '#ORD-003',
        title: 'Enterprise Plan',
        description: 'Team plan activation',
        status: 'Completed',
        priority: 'High',
      },
    ],
    users: [
      {
        id: 'USR-101',
        title: 'Sarah Johnson',
        description: 'Product Manager at TechCorp',
        status: 'Active',
        priority: 'Premium',
      },
      {
        id: 'USR-102',
        title: 'Mike Chen',
        description: 'Developer at StartupCo',
        status: 'Active',
        priority: 'Standard',
      },
      {
        id: 'USR-103',
        title: 'Emma Wilson',
        description: 'Analyst at DataFirm',
        status: 'Inactive',
        priority: 'Free',
      },
    ],
    tasks: [
      {
        id: 'TSK-501',
        title: 'Dashboard Redesign',
        description: 'Update user interface components',
        status: 'In Progress',
        priority: 'High',
      },
      {
        id: 'TSK-502',
        title: 'API Documentation',
        description: 'Complete REST API docs',
        status: 'Completed',
        priority: 'Medium',
      },
      {
        id: 'TSK-503',
        title: 'Security Audit',
        description: 'Quarterly security review',
        status: 'Planned',
        priority: 'High',
      },
    ],
    items: [
      {
        id: 'ITM-001',
        title: 'Data Analysis',
        description: 'Monthly performance review',
        status: 'Active',
        priority: 'High',
      },
      {
        id: 'ITM-002',
        title: 'User Feedback',
        description: 'Customer satisfaction survey',
        status: 'Completed',
        priority: 'Medium',
      },
      {
        id: 'ITM-003',
        title: 'Feature Update',
        description: 'New functionality release',
        status: 'Pending',
        priority: 'High',
      },
    ],
  };

  return {
    title,
    items:
      dataTemplates[dataType as keyof typeof dataTemplates] ||
      dataTemplates.items,
  };
}

/**
 * Extract key entities from prompt using simple NLP
 */
function extractKeyEntities(prompt: string): PromptAnalysis['keyEntities'] {
  const lowerPrompt = prompt.toLowerCase();

  // Extract features
  const featureKeywords = [
    'dashboard',
    'analytics',
    'chat',
    'api',
    'integration',
    'automation',
    'ai',
    'ml',
    'reporting',
  ];
  const features = featureKeywords.filter((keyword) =>
    lowerPrompt.includes(keyword)
  );

  // Extract metrics keywords
  const metricKeywords = [
    'revenue',
    'growth',
    'users',
    'conversion',
    'performance',
    'engagement',
    'retention',
  ];
  const metrics = metricKeywords.filter((keyword) =>
    lowerPrompt.includes(keyword)
  );

  // Extract use cases
  const useCaseKeywords = [
    'business',
    'enterprise',
    'startup',
    'team',
    'individual',
    'company',
  ];
  const useCases = useCaseKeywords.filter((keyword) =>
    lowerPrompt.includes(keyword)
  );

  return {
    companyName: extractCompanyName(prompt) || undefined,
    industry: inferIndustry(prompt),
    features,
    metrics,
    useCases,
  };
}

/**
 * Get template ID for business type and focus
 */
function getTemplateIdForType(
  businessType: string,
  primaryFocus: string
): string {
  const mapping = {
    'saas-dashboard': 'saas-dashboard-template',
    'saas-data': 'analytics-dashboard-template',
    'analytics-dashboard': 'analytics-dashboard-template',
    'analytics-data': 'analytics-dashboard-template',
    'ecommerce-product': 'product-showcase-template',
    'service-chat': 'chat-demo-template',
  };

  const key = `${businessType}-${primaryFocus}` as keyof typeof mapping;
  return mapping[key] || 'generic-demo-template';
}

/**
 * Calculate confidence score for analysis
 */
function calculateConfidence(prompt: string, businessType: string): number {
  let confidence = 0.5; // Base confidence

  const lowerPrompt = prompt.toLowerCase();
  const businessKeywords = {
    saas: ['saas', 'platform', 'dashboard', 'software as a service'],
    analytics: ['analytics', 'data', 'insights', 'reporting', 'visualization'],
    ecommerce: ['ecommerce', 'shop', 'store', 'sales', 'product'],
    service: ['service', 'support', 'help', 'chatbot', 'assistant'],
  };

  const keywords =
    businessKeywords[businessType as keyof typeof businessKeywords] || [];
  const matchCount = keywords.filter((keyword) =>
    lowerPrompt.includes(keyword)
  ).length;

  confidence += (matchCount / keywords.length) * 0.4;

  // Boost confidence if company name is clearly identified
  if (extractCompanyName(prompt)) {
    confidence += 0.1;
  }

  return Math.min(confidence, 0.95); // Cap at 95%
}
