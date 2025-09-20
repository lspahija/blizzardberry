import { state } from './state';
import { persistMessage } from './api';
import Chart from 'chart.js/auto';

const DEFAULT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

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

  const html = generateChartHTML(config);
  
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage && lastMessage.role === 'assistant') {
    lastMessage.parts.push({ type: 'html', content: html });
    await persistMessage(lastMessage);
    
    setTimeout(() => {
      initializeCharts();
    }, 100);
  }
}

function generateChartHTML(inputConfig) {
  const { data, chartType } = inputConfig;
  const options = inputConfig.options || {};
  const width = options.width || 800;
  const height = options.height || 400;
  const colors = options.colors || DEFAULT_COLORS;
  const showLegend = options.showLegend !== false;
  const showGrid = options.showGrid !== false;

  const containerId = `chart-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

  const { effectiveXKey, effectiveYKeys } = inferKeys(
    data,
    chartType,
    inputConfig.xKey,
    inputConfig.yKey
  );

  const chartData = prepareChartData(
    data,
    effectiveXKey,
    effectiveYKeys,
    chartType,
    colors
  );

  const chartConfig = getChartConfig(
    chartType,
    chartData,
    colors,
    showLegend,
    showGrid
  );

  return `
      <div style="
        width: 100%; 
        margin: 16px 0; 
        padding: 16px; 
        border: 2px solid #e2e8f0; 
        border-radius: 8px; 
        background: #ffffff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      ">
        ${inputConfig.title ? `<h3 style="text-align: center; margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #1f2937;">${inputConfig.title}</h3>` : ''}
        <div style="position: relative; height: ${height}px; width: 100%;">
          <canvas id="${containerId}" width="${width}" height="${height}"></canvas>
        </div>
        <div id="chart-init-${containerId}" data-chart-config='${JSON.stringify(chartConfig)}'></div>
      </div>
    `;
}

function inferKeys(data, chartType, xKey, yKey) {
  const sample = data[0] || {};
  const keys = Object.keys(sample);
  const isNumeric = (v) =>
    (typeof v === 'number' && Number.isFinite(v)) ||
    (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)));

  const numericKeys = keys.filter((k) => isNumeric(sample[k]));
  const nonNumericKeys = keys.filter((k) => !isNumeric(sample[k]));

  let resolvedX = xKey;
  let resolvedYKeys = Array.isArray(yKey) ? yKey : yKey ? [yKey] : [];

  if (!resolvedX) {
    resolvedX = nonNumericKeys[0] || keys[0] || 'index';
  }

  if (resolvedYKeys.length === 0) {
    if (chartType === 'pie') {
      resolvedYKeys = [numericKeys[0] || keys[0]];
    } else if (chartType === 'scatter') {
      const candidates = numericKeys.filter((k) => k !== resolvedX);
      resolvedYKeys = [candidates[0] || numericKeys[0] || keys[0]];
    } else {
      const candidates = numericKeys.filter((k) => k !== resolvedX);
      resolvedYKeys = candidates.length ? candidates : [numericKeys[0] || keys[0]];
    }
  }

  return { effectiveXKey: resolvedX, effectiveYKeys: resolvedYKeys };
}

function prepareChartData(data, xKey, yKeys, chartType, colors) {
  if (chartType === 'pie' || chartType === 'doughnut') {
    const pieKey = yKeys[0];
    return {
      labels: data.map((item) => item[xKey]),
      datasets: [
        {
          data: data.map((item) => Number(item[pieKey] ?? 0)),
          backgroundColor: colors.slice(0, data.length),
          borderColor: colors.slice(0, data.length),
          borderWidth: 1
        }
      ]
    };
  }

  if (chartType === 'scatter') {
    return {
      datasets: yKeys.map((yk, i) => ({
        label: yk,
        data: data.map((item) => ({
          x: Number(item[xKey] ?? item['x'] ?? 0),
          y: Number(item[yk] ?? item['y'] ?? 0)
        })),
        borderColor: colors[i % colors.length],
        backgroundColor: colors[i % colors.length]
      }))
    };
  }

  return {
    labels: data.map((item) => item[xKey]),
    datasets: yKeys.map((yk, i) => ({
      label: yk,
      data: data.map((item) => Number(item[yk] ?? 0)),
      backgroundColor: chartType === 'bar' ? colors[i % colors.length] : 'transparent',
      borderColor: colors[i % colors.length],
      borderWidth: 2,
      fill: chartType === 'area',
      tension: chartType === 'line' || chartType === 'area' ? 0.4 : 0
    }))
  };
}

function getChartConfig(chartType, chartData, colors, showLegend, showGrid) {
  const baseConfig = {
    type: mapChartType(chartType),
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'top'
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1
        }
      },
      scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
        x: {
          display: true,
          grid: {
            display: showGrid,
            color: '#f3f4f6'
          },
          ticks: {
            color: '#6b7280'
          }
        },
        y: {
          display: true,
          grid: {
            display: showGrid,
            color: '#f3f4f6'
          },
          ticks: {
            color: '#6b7280'
          }
        }
      } : {}
    }
  };

  if (chartType === 'scatter' && baseConfig.data.datasets.length) {
    baseConfig.data.datasets[0].pointRadius = 6;
    baseConfig.data.datasets[0].pointHoverRadius = 8;
  }

  return baseConfig;
}

function mapChartType(chartType) {
  switch (chartType) {
    case 'bar': return 'bar';
    case 'line': return 'line';
    case 'pie': return 'pie';
    case 'area': return 'line';
    case 'scatter': return 'scatter';
    default: return 'bar';
  }
}