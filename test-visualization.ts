import { generateVisualizationWithLLM } from './src/app/api/lib/tools/llmVisualization';

// Mock data - simple array of numbers
const mockData1 = [10, 25, 15, 40, 30, 50];

// Mock data - array of objects
const mockData2 = [
  { month: 'Jan', sales: 1200 },
  { month: 'Feb', sales: 1900 },
  { month: 'Mar', sales: 1500 },
  { month: 'Apr', sales: 2100 },
  { month: 'May', sales: 1800 },
];

// Mock data - nested structure
const mockData3 = {
  categories: ['A', 'B', 'C', 'D'],
  values: [45, 62, 38, 71],
};

async function testVisualization() {
  console.log('Testing SVG visualization with LLM...\n');

  console.log('Test: Simple array of numbers');
  const result = await generateVisualizationWithLLM(mockData1, 'Show this as a bar chart');
  console.log('Result:', result.error ? `Error: ${result.error}` : 'SVG generated successfully!');
  if (result.svg) {
    console.log('SVG length:', result.svg.length);
    console.log('\nFirst 300 characters of SVG:');
    console.log(result.svg.substring(0, 300));
  }
}

testVisualization().catch(console.error);
