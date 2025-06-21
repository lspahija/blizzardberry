const fs = require('fs');
const path = require('path');

// Test user ID (you can change this)
const TEST_USER_ID = 'test_user_123';

// Test agent ID (you can change this)
const TEST_AGENT_ID = '8b5d8bfb-f6b4-45de-9500-aa95c7046487';

async function setupTestData() {
  console.log('Setting up test data...');
  
  try {
    // 1. Create test agent
    console.log('Creating test agent...');
    const agentResponse = await fetch('http://localhost:3000/api/create-test-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        name: 'Test Agent',
        websiteDomain: 'localhost:3000'
      })
    });
    
    if (!agentResponse.ok) {
      const error = await agentResponse.text();
      console.log('Agent creation response:', error);
    } else {
      const agentData = await agentResponse.json();
      console.log('✅ Test agent created:', agentData);
    }
    
    // 2. Add test credits
    console.log('Adding test credits...');
    const creditsResponse = await fetch('http://localhost:3000/api/add-test-credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        amount: 10000
      })
    });
    
    if (!creditsResponse.ok) {
      const error = await creditsResponse.text();
      console.log('Credits creation response:', error);
    } else {
      const creditsData = await creditsResponse.json();
      console.log('✅ Test credits added:', creditsData);
    }
    
    console.log('✅ Test data setup complete!');
    console.log(`Test User ID: ${TEST_USER_ID}`);
    console.log(`Test Agent ID: ${TEST_AGENT_ID}`);
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  }
}

// Run the setup
setupTestData(); 