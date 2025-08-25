import { BusinessDomain, VideoTemplate, GeneratedScene } from '../types';

/**
 * Generate specific scenes with content based on business domain and template
 */
export function generateScenesFromDomain(
  businessDomain: BusinessDomain,
  template: VideoTemplate
): GeneratedScene[] {
  return template.config.scenes.map((sceneTemplate, index) => {
    const sceneContent = generateSceneContent(sceneTemplate, businessDomain, index);
    const sceneAnimations = generateSceneAnimations(sceneTemplate);
    
    return {
      id: `scene-${sceneTemplate.id}-${Date.now()}-${index}`,
      type: sceneTemplate.type,
      duration: sceneTemplate.duration,
      content: sceneContent,
      animations: sceneAnimations
    };
  });
}

/**
 * Generate content for a specific scene based on its type
 */
function generateSceneContent(
  sceneTemplate: any,
  businessDomain: BusinessDomain,
  sceneIndex: number
): GeneratedScene['content'] {
  switch (sceneTemplate.type) {
    case 'intro':
      return generateIntroContent(businessDomain);
    
    case 'demo':
      return generateDemoContent(businessDomain, sceneIndex);
    
    case 'dashboard':
      return generateDashboardContent(businessDomain);
    
    case 'data':
      return generateDataContent(businessDomain);
    
    case 'outro':
      return generateOutroContent(businessDomain);
    
    default:
      return generateGenericContent(businessDomain);
  }
}

/**
 * Generate intro scene content
 */
function generateIntroContent(businessDomain: BusinessDomain): GeneratedScene['content'] {
  return {
    title: `Welcome to ${businessDomain.companyName}`,
    subtitle: businessDomain.tagline,
    text: `See how ${businessDomain.companyName} can transform your ${businessDomain.industry.toLowerCase()} business`
  };
}

/**
 * Generate demo scene content (chat/interaction)
 */
function generateDemoContent(businessDomain: BusinessDomain, sceneIndex: number): GeneratedScene['content'] {
  // Use different queries for different demo scenes
  const queryIndex = Math.min(sceneIndex, businessDomain.queries.length - 1);
  const query = businessDomain.queries[queryIndex] || businessDomain.queries[0];
  
  // Generate contextual response based on the query and business type
  const response = generateResponseForQuery(query, businessDomain);
  
  return {
    title: 'Interactive Demo',
    query,
    response,
    text: `Experience ${businessDomain.companyName}'s AI-powered capabilities`
  };
}

/**
 * Generate dashboard scene content
 */
function generateDashboardContent(businessDomain: BusinessDomain): GeneratedScene['content'] {
  const primaryMetric = businessDomain.metrics[0];
  const context = primaryMetric ? 
    `${primaryMetric.label} Performance` : 
    `${businessDomain.companyName} Dashboard`;
  
  return {
    title: context,
    subtitle: 'Real-time insights and analytics',
    metrics: businessDomain.metrics,
    text: `Track your ${businessDomain.industry.toLowerCase()} metrics in real-time`
  };
}

/**
 * Generate data scene content
 */
function generateDataContent(businessDomain: BusinessDomain): GeneratedScene['content'] {
  const dataTitle = businessDomain.dashboardData?.title || 'Data Overview';
  const dataItems = businessDomain.dashboardData?.items || [];
  
  return {
    title: dataTitle,
    subtitle: 'Detailed breakdown and insights',
    data: dataItems,
    text: `Comprehensive data management for ${businessDomain.industry.toLowerCase()} businesses`
  };
}

/**
 * Generate outro scene content
 */
function generateOutroContent(businessDomain: BusinessDomain): GeneratedScene['content'] {
  return {
    title: businessDomain.companyName,
    subtitle: businessDomain.tagline,
    text: businessDomain.description
  };
}

/**
 * Generate generic content fallback
 */
function generateGenericContent(businessDomain: BusinessDomain): GeneratedScene['content'] {
  return {
    title: businessDomain.companyName,
    text: businessDomain.description,
    metrics: businessDomain.metrics
  };
}

/**
 * Generate contextual response for a given query
 */
function generateResponseForQuery(query: string, businessDomain: BusinessDomain): string {
  const lowerQuery = query.toLowerCase();
  
  // Revenue/financial queries
  if (lowerQuery.includes('revenue') || lowerQuery.includes('sales') || lowerQuery.includes('financial')) {
    const revenueMetric = businessDomain.metrics.find(m => 
      m.type === 'currency' || m.label.toLowerCase().includes('revenue')
    );
    if (revenueMetric) {
      return `Our ${revenueMetric.label.toLowerCase()} is performing exceptionally well at $${revenueMetric.value}K, showing strong growth in the ${businessDomain.industry.toLowerCase()} sector.`;
    }
    return `Our financial performance shows strong growth across all key metrics, with consistent revenue increases quarter over quarter.`;
  }
  
  // Performance/growth queries
  if (lowerQuery.includes('performance') || lowerQuery.includes('growth') || lowerQuery.includes('metrics')) {
    const growthMetric = businessDomain.metrics.find(m => 
      m.type === 'percentage' || m.label.toLowerCase().includes('growth')
    );
    if (growthMetric) {
      return `We're seeing impressive growth of ${growthMetric.value}% in ${growthMetric.label.toLowerCase()}, significantly outpacing industry averages.`;
    }
    return `Our performance metrics show consistent improvement across all key areas, with strong user engagement and business growth.`;
  }
  
  // Data/analytics queries
  if (lowerQuery.includes('data') || lowerQuery.includes('analytics') || lowerQuery.includes('insights')) {
    return `Our advanced analytics platform processes millions of data points to provide actionable insights that drive business decisions and improve ${businessDomain.industry.toLowerCase()} operations.`;
  }
  
  // User/customer queries
  if (lowerQuery.includes('user') || lowerQuery.includes('customer') || lowerQuery.includes('client')) {
    const userMetric = businessDomain.metrics.find(m => 
      m.label.toLowerCase().includes('user') || m.label.toLowerCase().includes('customer')
    );
    if (userMetric) {
      return `We're proud to serve ${userMetric.value} ${userMetric.label.toLowerCase()}, providing exceptional value in the ${businessDomain.industry.toLowerCase()} space.`;
    }
    return `Our customer base continues to grow, with high satisfaction rates and strong retention across all user segments.`;
  }
  
  // Support/service queries
  if (lowerQuery.includes('support') || lowerQuery.includes('help') || lowerQuery.includes('service')) {
    if (businessDomain.dashboardData && businessDomain.dashboardData.items.length > 0) {
      const resolvedCount = businessDomain.dashboardData.items.filter(item => 
        item.status.toLowerCase() === 'resolved'
      ).length;
      const totalCount = businessDomain.dashboardData.items.length;
      
      return `We maintain excellent support standards with ${resolvedCount} of ${totalCount} recent tickets resolved, ensuring quick response times and customer satisfaction.`;
    }
    return `Our support team provides 24/7 assistance with industry-leading response times and resolution rates for all ${businessDomain.industry.toLowerCase()} related inquiries.`;
  }
  
  // Features/capabilities queries
  if (lowerQuery.includes('feature') || lowerQuery.includes('capability') || lowerQuery.includes('function')) {
    return `${businessDomain.companyName} offers comprehensive features designed specifically for ${businessDomain.industry.toLowerCase()} professionals, including advanced automation and intelligent insights.`;
  }
  
  // Generic responses based on business domain
  const responses = [
    `${businessDomain.companyName} provides cutting-edge solutions for the ${businessDomain.industry.toLowerCase()} industry, delivering measurable results and ROI.`,
    `Our platform helps ${businessDomain.industry.toLowerCase()} businesses streamline operations and achieve better outcomes through intelligent automation.`,
    `With ${businessDomain.companyName}, you get enterprise-grade capabilities tailored specifically for ${businessDomain.industry.toLowerCase()} use cases.`,
    `We're transforming how ${businessDomain.industry.toLowerCase()} companies operate with our innovative approach to business intelligence and automation.`
  ];
  
  // Return a contextually relevant response
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate animations for a scene based on its template
 */
function generateSceneAnimations(sceneTemplate: any): GeneratedScene['animations'] {
  const animationType = sceneTemplate.config.animationType || 'fade';
  
  const animationMap = {
    fade: {
      entrance: 'fadeIn',
      exit: 'fadeOut'
    },
    slide: {
      entrance: 'slideInUp',
      exit: 'slideOutDown'
    },
    scale: {
      entrance: 'scaleIn',
      exit: 'scaleOut'
    }
  };
  
  const animations = animationMap[animationType as keyof typeof animationMap] || animationMap.fade;
  
  // Generate element-specific animations based on scene type
  const elementAnimations = generateElementAnimations(sceneTemplate.type, animationType);
  
  return {
    entrance: animations.entrance,
    exit: animations.exit,
    elements: elementAnimations
  };
}

/**
 * Generate element-specific animations
 */
function generateElementAnimations(
  sceneType: string, 
  animationType: string
): GeneratedScene['animations']['elements'] {
  const baseDelay = 200;
  const elements: GeneratedScene['animations']['elements'] = [];
  
  switch (sceneType) {
    case 'intro':
      elements.push(
        { selector: '.scene-title', animation: `${animationType}In`, delay: baseDelay },
        { selector: '.scene-subtitle', animation: `${animationType}In`, delay: baseDelay + 300 },
        { selector: '.scene-text', animation: `${animationType}In`, delay: baseDelay + 600 }
      );
      break;
      
    case 'demo':
      elements.push(
        { selector: '.chat-container', animation: 'scaleIn', delay: baseDelay },
        { selector: '.query-input', animation: 'slideInUp', delay: baseDelay + 400 },
        { selector: '.response-message', animation: 'slideInLeft', delay: baseDelay + 800 }
      );
      break;
      
    case 'dashboard':
      elements.push(
        { selector: '.dashboard-title', animation: 'slideInDown', delay: baseDelay },
        { selector: '.metric-card', animation: 'scaleIn', delay: baseDelay + 300 },
        { selector: '.chart-container', animation: 'fadeIn', delay: baseDelay + 600 }
      );
      break;
      
    case 'data':
      elements.push(
        { selector: '.data-title', animation: 'slideInDown', delay: baseDelay },
        { selector: '.stats-grid', animation: 'slideInUp', delay: baseDelay + 200 },
        { selector: '.data-table', animation: 'fadeIn', delay: baseDelay + 500 },
        { selector: '.table-row', animation: 'slideInLeft', delay: baseDelay + 700 }
      );
      break;
      
    case 'outro':
      elements.push(
        { selector: '.brand-logo', animation: 'scaleIn', delay: baseDelay },
        { selector: '.brand-name', animation: 'slideInUp', delay: baseDelay + 400 },
        { selector: '.brand-tagline', animation: 'fadeIn', delay: baseDelay + 800 }
      );
      break;
  }
  
  return elements;
}