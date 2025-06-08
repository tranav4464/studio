// Test script for API verification
import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGeminiAPI() {
  console.log('Testing Gemini API...');
  
  if (!process.env.GEMINI_API) {
    console.error('❌ GEMINI_API environment variable is not set');
    return false;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Say this is a test');
    const response = await result.response;
    console.log('✅ Gemini API test successful!');
    console.log('Response:', response.text());
    return true;
  } catch (error) {
    console.error('❌ Gemini API test failed:');
    console.error(error);
    return false;
  }
}

async function testStabilityAPI() {
  console.log('\nTesting Stability AI API...');
  
  if (!process.env.STABILITY_API_KEY) {
    console.error('❌ STABILITY_API_KEY environment variable is not set');
    return false;
  }

  try {
    const response = await fetch('https://api.stability.ai/v1/user/account', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Stability AI API test successful!');
    console.log('Account email:', data.email);
    console.log('Credits:', data.credits);
    return true;
  } catch (error) {
    console.error('❌ Stability AI API test failed:');
    console.error(error);
    return false;
  }
}

async function runTests() {
  console.log('Starting API tests...\n');
  
  const geminiResult = await testGeminiAPI();
  const stabilityResult = await testStabilityAPI();
  
  console.log('\n--- Test Summary ---');
  console.log(`Gemini API: ${geminiResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Stability AI API: ${stabilityResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (geminiResult && stabilityResult) {
    console.log('\n🎉 All API tests passed successfully!');
  } else {
    console.log('\n❌ Some tests failed. Please check the error messages above.');
  }
}

runTests().catch(console.error);
