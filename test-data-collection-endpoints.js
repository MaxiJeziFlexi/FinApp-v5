// Comprehensive Test Script for Data Collection Endpoints
// Tests all API endpoints for gathering and saving data for AI models

const BASE_URL = 'http://localhost:5000';
const TEST_USER_ID = 'admin-test-user';

// Test endpoints for data collection
const testEndpoints = [
  {
    name: 'Analytics - Live Data',
    method: 'GET',
    endpoint: '/api/analytics/live',
    expected: ['totalUsers', 'activeUsers', 'newUsersToday']
  },
  {
    name: 'Analytics - User Behavior',
    method: 'GET', 
    endpoint: '/api/analytics/user-behavior',
    expected: ['pageViews', 'sessionDuration', 'interactions']
  },
  {
    name: 'Analytics - AI Usage',
    method: 'GET',
    endpoint: '/api/analytics/ai-usage',
    expected: ['aiInteractions', 'modelUsage', 'tokenUsage']
  },
  {
    name: 'Admin - AI Performance',
    method: 'GET',
    endpoint: '/api/admin/ai-performance',
    headers: { 'x-user-id': TEST_USER_ID },
    expected: ['predictionAccuracy', 'averageResponseTime']
  },
  {
    name: 'Admin - AI Models',
    method: 'GET',
    endpoint: '/api/admin/ai-models',
    headers: { 'x-user-id': TEST_USER_ID },
    expected: ['name', 'accuracy', 'totalRequests']
  },
  {
    name: 'Admin - Quantum Models',
    method: 'GET',
    endpoint: '/api/admin/quantum-models', 
    headers: { 'x-user-id': TEST_USER_ID },
    expected: ['name', 'accuracy', 'predictions']
  },
  {
    name: 'Admin - User Stats',
    method: 'GET',
    endpoint: '/api/admin/user-stats',
    headers: { 'x-user-id': TEST_USER_ID },
    expected: ['activeUsers', 'totalSessions']
  },
  {
    name: 'Admin - AI Overview',
    method: 'GET', 
    endpoint: '/api/admin/ai-overview',
    headers: { 'x-user-id': TEST_USER_ID },
    expected: ['system', 'models', 'timestamp']
  },
  {
    name: 'Admin - AI Health',
    method: 'GET',
    endpoint: '/api/admin/ai-health',
    headers: { 'x-user-id': TEST_USER_ID },
    expected: ['overall', 'uptime', 'totalModels']
  }
];

// Test data tracking endpoints
const trackingTests = [
  {
    name: 'Track AI Interaction',
    method: 'POST',
    endpoint: '/api/analytics/track-event',
    data: {
      userId: TEST_USER_ID,
      eventType: 'ai_interaction',
      data: {
        model: 'gpt-4o',
        tokens: 1500,
        responseTime: 2.3,
        accuracy: 0.95,
        cost: 0.045
      }
    }
  },
  {
    name: 'Track User Behavior',
    method: 'POST',
    endpoint: '/api/analytics/track-event',
    data: {
      userId: TEST_USER_ID,
      eventType: 'user_behavior',
      data: {
        page: '/admin',
        action: 'view_dashboard',
        duration: 45.2,
        interactions: 12
      }
    }
  },
  {
    name: 'Track Model Performance',
    method: 'POST',
    endpoint: '/api/analytics/track-event', 
    data: {
      userId: TEST_USER_ID,
      eventType: 'model_performance',
      data: {
        modelName: 'Advanced AI Agent',
        accuracy: 0.92,
        responseTime: 1847,
        tokensUsed: 2456,
        successRate: 0.97
      }
    }
  }
];

// Test data storage and retrieval
const storageTests = [
  {
    name: 'Retrain AI Models',
    method: 'POST',
    endpoint: '/api/admin/retrain-models',
    headers: { 'x-user-id': TEST_USER_ID },
    data: { modelType: 'openai' }
  },
  {
    name: 'Update Tax Data',
    method: 'POST',
    endpoint: '/api/admin/update-tax-data',
    headers: { 'x-user-id': TEST_USER_ID },
    data: { force: true }
  }
];

console.log('=== COMPREHENSIVE DATA COLLECTION TEST ===');
console.log('Testing all endpoints for AI model training data...\n');

// Function to test endpoint
async function testEndpoint(test) {
  try {
    const options = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        ...test.headers
      }
    };
    
    if (test.data) {
      options.body = JSON.stringify(test.data);
    }
    
    const response = await fetch(`${BASE_URL}${test.endpoint}`, options);
    const data = await response.json();
    
    console.log(`✓ ${test.name}: ${response.status}`);
    
    if (test.expected && Array.isArray(data)) {
      console.log(`  - Array with ${data.length} items`);
    } else if (test.expected) {
      const hasFields = test.expected.some(field => data[field] !== undefined);
      console.log(`  - Expected fields present: ${hasFields ? 'YES' : 'NO'}`);
    }
    
    return { success: true, data, status: response.status };
  } catch (error) {
    console.log(`✗ ${test.name}: ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runAllTests() {
  console.log('--- DATA RETRIEVAL ENDPOINTS ---');
  for (const test of testEndpoints) {
    await testEndpoint(test);
  }
  
  console.log('\n--- DATA TRACKING ENDPOINTS ---');
  for (const test of trackingTests) {
    await testEndpoint(test);
  }
  
  console.log('\n--- DATA STORAGE/MANAGEMENT ENDPOINTS ---');
  for (const test of storageTests) {
    await testEndpoint(test);
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

// Export for potential reuse
if (typeof module !== 'undefined') {
  module.exports = { testEndpoints, trackingTests, storageTests, testEndpoint };
} else {
  // Run tests if script is executed directly
  runAllTests();
}