// Quick console test for browser
// You can copy-paste this into the browser console to test the integrations

console.log('🔍 Testing SecureFlow Security Integrations...');

// Test SonarQube integration
async function testSonarQube() {
  try {
    console.log('📊 Testing SonarQube API...');
    const response = await fetch('https://sonarcloud.io/api/measures/component?component=TechTyphoon_secure-flow-automaton&metricKeys=bugs,vulnerabilities,code_smells', {
      headers: {
        'Authorization': 'Bearer 33724c9ff7bad47604aa0fb35b989817187f4903'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SonarQube API working:', data);
      return true;
    } else {
      console.log('❌ SonarQube API failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ SonarQube API error:', error.message);
    return false;
  }
}

// Test Snyk integration
async function testSnyk() {
  try {
    console.log('🛡️ Testing Snyk API...');
    const response = await fetch('https://api.snyk.io/v1/user/me', {
      headers: {
        'Authorization': 'token 21f97758-8d59-4220-aafa-c4e5976c22ae'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Snyk API working:', data);
      return true;
    } else {
      console.log('❌ Snyk API failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Snyk API error:', error.message);
    return false;
  }
}

// Test Slack webhook
async function testSlack() {
  try {
    console.log('📢 Testing Slack Webhook...');
    const response = await fetch('https://hooks.slack.com/services/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', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: '🧪 Browser Console Test: SecureFlow integration working!'
      })
    });
    
    if (response.ok) {
      console.log('✅ Slack webhook working - check your #security-alerts channel!');
      return true;
    } else {
      console.log('❌ Slack webhook failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Slack webhook error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting integration tests...');
  console.log('=' .repeat(50));
  
  const results = await Promise.all([
    testSonarQube(),
    testSnyk(),
    testSlack()
  ]);
  
  const passed = results.filter(Boolean).length;
  console.log('=' .repeat(50));
  console.log(`📊 Test Results: ${passed}/3 integrations working`);
  
  if (passed === 3) {
    console.log('🎉 All integrations working perfectly!');
  } else {
    console.log('⚠️ Some integrations need attention');
  }
}

// Auto-run tests
runAllTests();

// Also make functions available globally for manual testing
window.testSonarQube = testSonarQube;
window.testSnyk = testSnyk;
window.testSlack = testSlack;
window.runAllTests = runAllTests;

console.log('💡 Functions available: testSonarQube(), testSnyk(), testSlack(), runAllTests()');
