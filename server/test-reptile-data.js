// Quick test script for Reptile Agent's autonomous data gathering
const { realTimeDataService } = require('./services/realTimeDataService.ts');

async function testReptileDataCapabilities() {
  console.log('🔍 Testing Reptile Agent Autonomous Data Gathering...\n');

  try {
    // Test 1: Market data search
    console.log('📊 Test 1: Market Data Search');
    const marketData = await realTimeDataService.searchFinancialData(
      'current S&P 500 price and market sentiment today',
      { timeframe: 'hour', domain: 'stocks' }
    );
    console.log('✅ Market Data Retrieved:', {
      confidence: marketData.confidence,
      sources: marketData.sources.length,
      hasData: !!marketData.data
    });

    // Test 2: Financial news gathering
    console.log('\n📰 Test 2: Financial News Gathering');
    const newsData = await realTimeDataService.getFinancialNews(['market', 'earnings'], 3);
    console.log('✅ News Data Retrieved:', {
      headlines: newsData.headlines.length,
      sentiment: newsData.overallSentiment,
      themes: newsData.keyThemes.length,
      sources: newsData.sources.length
    });

    // Test 3: Economic indicators
    console.log('\n📈 Test 3: Economic Indicators');
    const economicData = await realTimeDataService.getEconomicIndicators(['GDP', 'inflation']);
    console.log('✅ Economic Data Retrieved:', {
      indicators: economicData.data.length,
      hasOutlook: !!economicData.economicOutlook,
      sources: economicData.sources.length
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Reptile Agent now has autonomous access to real-time financial data');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('ℹ️ This is expected if PERPLEXITY_API_KEY is not configured or network issues exist');
  }
}

// Run the test
testReptileDataCapabilities();