import { state } from './state';
import { persistMessage } from './api';

export async function addVisualizationToMessage(visualizationResult) {
  if (!visualizationResult || visualizationResult.type !== 'visualization') {
    return;
  }

  const config = visualizationResult.config;
  if (!config || !config.data || !Array.isArray(config.data)) {
    return;
  }

  const containerId = `visualization-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  
  let chartHTML = `
    <div id="${containerId}" class="visualization-container" style="
      width: 100%; 
      margin: 16px 0; 
      padding: 16px; 
      border: 2px solid #e2e8f0; 
      border-radius: 8px; 
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    ">
      <div class="visualization-header" style="margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">
          ${config.title || 'Data Visualization'}
        </h3>
      </div>
      <div class="visualization-content" style="
        min-height: 200px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        background: #f9fafb; 
        border-radius: 4px; 
        color: #6b7280;
        font-family: monospace;
      ">
        <div style="text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
          <div style="font-weight: bold; margin-bottom: 4px;">
            ${config.chartType.toUpperCase()} Chart
          </div>
          <div style="font-size: 14px; margin-bottom: 8px;">
            ${config.data.length} data points
          </div>
          <div style="font-size: 12px; color: #9ca3af;">
            ${config.xKey} vs ${config.yKey}
          </div>`;

  // Add actual data visualization
  chartHTML += `
          <div style="margin-top: 16px; width: 100%; max-width: 400px;">`;
  
  if (config.chartType === 'bar') {
    // Create a simple bar chart with text
    const maxValue = Math.max(...config.data.map(item => item[config.yKey]));
    config.data.forEach(item => {
      const percentage = (item[config.yKey] / maxValue) * 100;
      chartHTML += `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
            <span>${item[config.xKey]}</span>
            <span>${item[config.yKey]}</span>
          </div>
          <div style="background: #e5e7eb; height: 20px; border-radius: 4px; overflow: hidden;">
            <div style="background: #3b82f6; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
          </div>
        </div>`;
    });
  } else if (config.chartType === 'pie') {
    // Create a simple list for pie charts
    config.data.slice(0, 6).forEach(item => {
      chartHTML += `
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f3f4f6;">
          <span style="font-size: 12px;">${item[config.xKey]}</span>
          <span style="font-size: 12px; font-weight: bold;">${item[config.yKey]}${config.chartType === 'pie' ? '%' : ''}</span>
        </div>`;
    });
    if (config.data.length > 6) {
      chartHTML += `<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">... and ${config.data.length - 6} more</div>`;
    }
  } else {
    // For line, area, scatter - show as a simple table
    config.data.slice(0, 8).forEach(item => {
      chartHTML += `
        <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
          <span>${item[config.xKey]}</span>
          <span style="font-weight: bold;">${item[config.yKey]}</span>
        </div>`;
    });
    if (config.data.length > 8) {
      chartHTML += `<div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">... and ${config.data.length - 8} more data points</div>`;
    }
  }
  
  chartHTML += `</div>`;

  chartHTML += `
        </div>
      </div>
    </div>
  `;

  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage && lastMessage.role === 'assistant') {
    lastMessage.parts.push({ type: 'html', content: chartHTML });
    await persistMessage(lastMessage);
  }
}