interface ChartData {
  data: Array<Record<string, any>>;
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  title?: string;
  xKey?: string;
  yKey?: string | string[];
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

    const { effectiveXKey, effectiveYKeys } = this.inferKeys(data, chartType, xKey, yKey);

    const chartData = this.prepareChartData(
      data,
      effectiveXKey,
      effectiveYKeys,
      chartType,
      colors
    );
    const chartConfig = this.getChartConfig(
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
        ${title ? `<h3 style="text-align: center; margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #1f2937;">${title}</h3>` : ''}
        <div style="position: relative; height: ${height}px; width: 100%;">
          <canvas id="${containerId}" width="${width}" height="${height}"></canvas>
        </div>
        <div id="chart-init-${containerId}" data-chart-config='${JSON.stringify(chartConfig)}'></div>
      </div>
    `;
  }

  private prepareChartData(
    data: Array<Record<string, any>>,
    xKey: string,
    yKeys: string[],
    chartType: string,
    colors: string[]
  ) {
    if (chartType === 'pie' || chartType === 'doughnut') {
      const pieKey = yKeys[0];
      return {
        labels: data.map((item) => this.readValue(item, xKey)),
        datasets: [
          {
            data: data.map((item) => Number(this.readValue(item, pieKey) ?? 0)),
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
            x: Number(this.readValue(item, xKey) ?? item['x'] ?? 0),
            y: Number(this.readValue(item, yk) ?? item['y'] ?? 0)
          })),
          borderColor: colors[i % colors.length],
          backgroundColor: colors[i % colors.length]
        }))
      } as any;
    }

    return {
      labels: data.map((item) => this.readValue(item, xKey)),
      datasets: yKeys.map((yk, i) => ({
        label: yk,
        data: data.map((item) => Number(this.readValue(item, yk) ?? 0)),
        backgroundColor: chartType === 'bar' ? colors[i % colors.length] : 'transparent',
        borderColor: colors[i % colors.length],
        borderWidth: 2,
        fill: chartType === 'area',
        tension: chartType === 'line' || chartType === 'area' ? 0.4 : 0
      }))
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

  private inferKeys(
    data: Array<Record<string, any>>,
    chartType: string,
    xKey?: string,
    yKey?: string | string[]
  ): { effectiveXKey: string; effectiveYKeys: string[] } {
    const sample = data[0] || {};
    const keys = Object.keys(sample);

    const isNumeric = (v: any) =>
      typeof v === 'number' && Number.isFinite(v) ||
      (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)));

    const numericKeys = keys.filter((k) => isNumeric(sample[k]));
    const nonNumericKeys = keys.filter((k) => !isNumeric(sample[k]));

    let resolvedX = xKey as string | undefined;
    let resolvedYKeys: string[] = Array.isArray(yKey)
      ? yKey
      : (yKey ? [yKey] : []);

    if (!resolvedX) {
      // Prefer non-numeric for categories; otherwise index-like numeric key
      resolvedX = nonNumericKeys[0] || keys[0] || 'index';
    }

    if (resolvedYKeys.length === 0) {
      if (chartType === 'pie') {
        // single measure for pie
        resolvedYKeys = [numericKeys[0] || keys[0]];
      } else if (chartType === 'scatter') {
        // prefer a numeric measure other than x
        const candidates = numericKeys.filter((k) => k !== resolvedX);
        resolvedYKeys = [candidates[0] || numericKeys[0] || keys[0]];
      } else {
        // for line/bar/area support multiple numeric series
        const candidates = numericKeys.filter((k) => k !== resolvedX);
        resolvedYKeys = candidates.length ? candidates : [numericKeys[0] || keys[0]];
      }
    }

    return { effectiveXKey: resolvedX, effectiveYKeys: resolvedYKeys };
  }

  private readValue(obj: Record<string, any>, key: string): any {
    if (key === 'index') return undefined; // handled by caller if needed
    return obj?.[key];
  }
}

export const chartJsGenerator = new ChartJsGenerator();
