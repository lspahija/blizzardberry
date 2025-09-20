export async function GET() {
  const sampleData = {
    salesData: [
      { month: 'Jan', sales: 1200, target: 1000 },
      { month: 'Feb', sales: 1900, target: 1500 },
      { month: 'Mar', sales: 1500, target: 1200 },
      { month: 'Apr', sales: 2100, target: 1800 },
      { month: 'May', sales: 1800, target: 1600 },
      { month: 'Jun', sales: 2400, target: 2000 },
    ],
    
    userGrowth: [
      { date: '2024-01', users: 1000 },
      { date: '2024-02', users: 1250 },
      { date: '2024-03', users: 1600 },
      { date: '2024-04', users: 2100 },
      { date: '2024-05', users: 2800 },
      { date: '2024-06', users: 3500 },
    ],
    
    categoryBreakdown: [
      { category: 'Web Development', value: 35 },
      { category: 'Mobile Apps', value: 25 },
      { category: 'Design', value: 20 },
      { category: 'Marketing', value: 15 },
      { category: 'Other', value: 5 },
    ],

    performanceMetrics: [
      { metric: 'Response Time', value: 150, unit: 'ms' },
      { metric: 'Uptime', value: 99.9, unit: '%' },
      { metric: 'Error Rate', value: 0.1, unit: '%' },
      { metric: 'Throughput', value: 1000, unit: 'req/s' },
    ],
  };

  return Response.json({
    success: true,
    data: sampleData,
    message: 'Sample data retrieved successfully. You can ask me to visualize any of these datasets: salesData, userGrowth, categoryBreakdown, or performanceMetrics.',
  });
}