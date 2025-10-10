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
      const isCompact = element.getAttribute('data-compact-preview') === 'true';
    if (isCompact) {
      // Don't render a preview chart; only bind click to open modal
      attachCardClickById(containerId, config);
    } else {
      initializeSingleChart(containerId, config);
    }
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
      attachCardClickToOpenModal(ctx, config);
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

  // Check if this is an SVG from GPT-5
  if (visualizationResult.svg) {
    const html = `
      <div class="viz-svg-container" style="margin: 12px 0;">
        ${visualizationResult.svg}
      </div>
    `;

    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.parts.push({ type: 'html', content: html });
      await persistMessage(lastMessage);
    }
    return;
  }

  // Check if this is a base64 image from LLM code execution
  if (visualizationResult.image) {
    const html = `
      <div class="viz-image-container" style="margin: 12px 0;">
        <img
          src="data:image/png;base64,${visualizationResult.image}"
          alt="Data Visualization"
          style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
        />
      </div>
    `;

    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.parts.push({ type: 'html', content: html });
      await persistMessage(lastMessage);
    }
    return;
  }

  // Legacy Chart.js format
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
  const width = options.width || 640;
  const height = options.height || 220;
  const previewHeight = Math.max(32, Math.min(height, options.previewHeight ?? 72));
  const colors = options.colors || DEFAULT_COLORS;
  const showLegend = options.showLegend !== false;
  const showGrid = options.showGrid !== false;
  const compactPreview = options.compactPreview !== false; // default: compact preview enabled

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

  if (!chartConfig.options) chartConfig.options = {};
  chartConfig.options.backgroundColor = '#ffffff';
  if (!chartConfig.options.plugins) chartConfig.options.plugins = {};
  // Add generous inner padding so the chart doesn't touch edges
  const userPadding = options.layoutPadding;
  chartConfig.options.layout = chartConfig.options.layout || {};
  const basePadding = userPadding ?? { top: 48, right: 56, bottom: 48, left: 56 };
  const normalizedPadding = typeof basePadding === 'number'
    ? { top: basePadding, right: basePadding, bottom: basePadding, left: basePadding }
    : { top: basePadding.top ?? 0, right: basePadding.right ?? 0, bottom: basePadding.bottom ?? 0, left: basePadding.left ?? 0 };
  chartConfig.options.layout.padding = normalizedPadding;

  if (compactPreview) {
    const label = inputConfig.title ? escapeHtml(inputConfig.title) : 'Open chart';
    return `
      <div class="viz-card viz-card--compact" data-viz-container="${containerId}" style="width: 100%; margin: 6px 0;">
        <div class="viz-chip viz-chip--left">
          <svg class="viz-chip-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 17h3a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1v-5a1 1 0 1 1 2 0v3l4.586-4.586a1 1 0 0 1 1.414 1.414L7 17Zm10-10h-3a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0V8l-4.586 4.586a1 1 0 0 1-1.414-1.414L17 7Z"/>
          </svg>
          <span class="viz-chip-text">${label}</span>
        </div>
        <div id="chart-init-${containerId}" data-compact-preview="true" data-chart-config='${JSON.stringify(chartConfig)}'></div>
      </div>
    `;
  }

  return `
      <div class="viz-card" data-viz-container="${containerId}" style="width: 100%; margin: 12px 0;">
        ${inputConfig.title ? `<div class="viz-title">${escapeHtml(inputConfig.title)}</div>` : ''}
        <div class="viz-expand-icon">⤢</div>
        <div style="position: relative; height: ${previewHeight}px; width: 100%; overflow: hidden; filter: grayscale(0.9) contrast(0.9) brightness(0.9);">
          <canvas id="${containerId}" width="${width}" height="${previewHeight}" style="position: absolute; inset: 0; width: 100% !important; height: 100% !important;"></canvas>
          <div class="viz-dim-overlay">Click to expand</div>
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

// Modal helpers
function getOrCreateModalShell() {
  if (document.getElementById('vizModalBackdrop')) {
    return '';
  }
  return `
    <div id="vizModalBackdrop" class="viz-modal-backdrop">
      <div class="viz-modal" role="dialog" aria-modal="true">
        <button class="viz-modal-close-icon" id="vizModalCloseBtn" aria-label="Close">×</button>
        <div class="viz-modal-content">
          <canvas id="vizModalCanvas"></canvas>
        </div>
      </div>
    </div>
  `;
}

function attachCardClickToOpenModal(canvasEl, chartConfig) {
  const card = canvasEl.closest('.viz-card');
  if (!card) return;
  if (card.dataset.bound === '1') return;
  card.dataset.bound = '1';

  const handler = (e) => {
    e.stopPropagation();
    openVisualizationModal(card, chartConfig);
  };
  card.addEventListener('click', handler);
}

function attachCardClickById(containerId, chartConfig) {
  const card = document.querySelector(`.viz-card[data-viz-container="${containerId}"]`);
  if (!card || card.dataset.bound === '1') return;
  card.dataset.bound = '1';
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    openVisualizationModal(card, chartConfig);
  });
}

function openVisualizationModal(card, chartConfig) {
  let backdrop = document.getElementById('vizModalBackdrop');
  if (!backdrop) {
    const container = document.createElement('div');
    container.innerHTML = getOrCreateModalShell();
    const node = container.firstElementChild;
    if (node) document.body.appendChild(node);
    backdrop = document.getElementById('vizModalBackdrop');
  } else if (backdrop.parentElement !== document.body) {
    document.body.appendChild(backdrop);
  }

  const closeBtn = document.getElementById('vizModalCloseBtn');
  const modalCanvas = document.getElementById('vizModalCanvas');

  backdrop.classList.add('visible');
  const prevOverflow = document.body.style.overflow;
  document.body.dataset.prevOverflow = prevOverflow;
  document.body.style.overflow = 'hidden';

  if (modalCanvas.__chartInstance) {
    try { modalCanvas.__chartInstance.destroy(); } catch (_) {}
  }

  const modalConfig = JSON.parse(JSON.stringify(chartConfig));
  modalConfig.options = modalConfig.options || {};
  modalConfig.options.maintainAspectRatio = false;
  modalConfig.options.responsive = true;

  setTimeout(() => {
    try {
      modalCanvas.__chartInstance = new Chart(modalCanvas.getContext('2d'), modalConfig);
    } catch (err) {
      console.error('Error creating modal chart', err);
    }
  }, 0);

  const onKey = (ev) => {
    if (ev.key === 'Escape') {
      closeVisualizationModal();
    }
  };

  const onBackdropClick = (ev) => {
    if (ev.target === backdrop) {
      closeVisualizationModal();
    }
  };

  const onClose = () => closeVisualizationModal();

  document.addEventListener('keydown', onKey);
  backdrop.addEventListener('click', onBackdropClick, { once: true });
  if (closeBtn) closeBtn.addEventListener('click', onClose, { once: true });

  backdrop.__cleanup = () => {
    document.removeEventListener('keydown', onKey);
  };
}

function closeVisualizationModal() {
  const backdrop = document.getElementById('vizModalBackdrop');
  if (!backdrop) return;
  backdrop.classList.remove('visible');
  if (backdrop.__cleanup) {
    try { backdrop.__cleanup(); } catch (_) {}
    backdrop.__cleanup = null;
  }
  const prevOverflow = document.body.dataset.prevOverflow || '';
  document.body.style.overflow = prevOverflow;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}