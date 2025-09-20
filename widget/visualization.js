import { state } from './state';
import { persistMessage } from './api';
import Chart from 'chart.js/auto';

window.initializeCharts = function() {
  const chartElements = document.querySelectorAll('[id^="chart-init-"]');
  
  chartElements.forEach(element => {
    const containerId = element.id.replace('chart-init-', '');
    const config = JSON.parse(element.getAttribute('data-chart-config'));
    initializeSingleChart(containerId, config);
  });
};

function initializeSingleChart(containerId, config) {
  function createChart() {
    const ctx = document.getElementById(containerId);
    if (!ctx) {
      console.error('Canvas element not found:', containerId);
      return;
    }
    
    try {
      const chart = new Chart(ctx, config);
      console.log('Chart created successfully:', chart);
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  createChart();
}

export async function addVisualizationToMessage(visualizationResult) {
  if (!visualizationResult || visualizationResult.type !== 'visualization') {
    return;
  }

  const config = visualizationResult.config;
  if (!config || !config.data || !Array.isArray(config.data)) {
    return;
  }

  const response = await fetch('/api/visualization', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: config.data,
      chartType: config.chartType,
      xKey: config.xKey,
      yKey: config.yKey,
      title: config.title,
      options: config.options
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate chart');
  }

  const { html } = await response.json();
  
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage && lastMessage.role === 'assistant') {
    lastMessage.parts.push({ type: 'html', content: html });
    await persistMessage(lastMessage);
    
    setTimeout(() => {
      initializeCharts();
    }, 100);
  }
}