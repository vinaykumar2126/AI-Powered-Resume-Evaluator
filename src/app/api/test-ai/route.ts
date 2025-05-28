import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    console.log('🧪 Testing Gemini AI connection...');
    
    // Check environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY not found in environment'
      });
    }

    console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
    
    // Initialize AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('✅ AI model initialized');
    
    // Simple test prompt
    const testPrompt = "Please respond with a JSON object containing: {\"status\": \"working\", \"message\": \"AI is functioning correctly\", \"timestamp\": \"current time\"}";
    
    console.log('⏳ Sending test request to AI...');
    const startTime = Date.now();
    
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();
    
    const endTime = Date.now();
    
    console.log('✅ AI Test Response received!');
    console.log('⏱️ Response time:', endTime - startTime, 'ms');
    console.log('📝 Response text:', text);
    
    return NextResponse.json({
      success: true,
      aiWorking: true,
      responseTime: endTime - startTime,
      aiResponse: text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ AI Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
