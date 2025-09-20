interface ChartData {
  data: Array<Record<string, any>>;
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  title?: string;
  xKey: string;
  yKey: string;
  options?: {
    width?: number;
    height?: number;
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
  };
}

const DEFAULT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export class ChartJsGenerator {
  generateChartHTML(config: ChartData): string {
    const { data, chartType, xKey, yKey, title, options = {} } = config;
    
    const {
      width = 800,
      height = 400,
      colors = DEFAULT_COLORS,
      showLegend = true,
      showGrid = true
    } = options;

    const containerId = `chart-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Prepare data for Chart.js
    const chartData = this.prepareChartData(data, xKey, yKey, chartType, colors);
    const chartConfig = this.getChartConfig(chartType, chartData, colors, showLegend, showGrid);

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
        ${title ? `<h3 style="text-align: center; margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #1f2937;">${title}</h3>` : ''}
        <div style="position: relative; height: ${height}px; width: 100%;">
          <canvas id="${containerId}" width="${width}" height="${height}"></canvas>
        </div>
        <div id="chart-init-${containerId}" data-chart-config='${JSON.stringify(chartConfig)}'></div>
      </div>
    `;
  }

  private prepareChartData(data: Array<Record<string, any>>, xKey: string, yKey: string, chartType: string, colors: string[]) {
    if (chartType === 'pie' || chartType === 'doughnut') {
      return {
        labels: data.map(item => item[xKey]),
        datasets: [{
          data: data.map(item => item[yKey]),
          backgroundColor: colors.slice(0, data.length),
          borderColor: colors.slice(0, data.length),
          borderWidth: 1
        }]
      };
    }

    return {
      labels: data.map(item => item[xKey]),
      datasets: [{
        label: yKey,
        data: data.map(item => item[yKey]),
        backgroundColor: chartType === 'bar' ? colors[0] : 'transparent',
        borderColor: colors[0],
        borderWidth: 2,
        fill: chartType === 'area',
        tension: chartType === 'line' || chartType === 'area' ? 0.4 : 0
      }]
    };
  }

  private getChartConfig(chartType: string, chartData: any, colors: string[], showLegend: boolean, showGrid: boolean) {
    const baseConfig = {
      type: this.mapChartType(chartType),
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: showLegend,
            position: 'top' as const
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

    // Special handling for scatter charts
    if (chartType === 'scatter') {
      baseConfig.data.datasets[0].pointRadius = 6;
      baseConfig.data.datasets[0].pointHoverRadius = 8;
    }

    return baseConfig;
  }

  private mapChartType(chartType: string): string {
    switch (chartType) {
      case 'bar': return 'bar';
      case 'line': return 'line';
      case 'pie': return 'pie';
      case 'area': return 'line';
      case 'scatter': return 'scatter';
      default: return 'bar';
    }
  }
}

export const chartJsGenerator = new ChartJsGenerator();
