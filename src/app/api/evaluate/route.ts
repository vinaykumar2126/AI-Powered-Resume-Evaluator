import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

type RequestBody = {
  resume: string;
  jobDescription: string;
};

export async function POST(req: Request) {
  try {
    const { resume, jobDescription } = await req.json() as RequestBody;

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume and job description are required' },
        { status: 400 }
      );
    }

    console.log('🤖 STARTING REAL GEMINI AI EVALUATION');
    console.log('📊 Input lengths - Resume:', resume.length, 'Job:', jobDescription.length);

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Evaluate this resume against the job description and provide detailed analysis.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resume}

Please provide your evaluation in the following JSON format. Keep feedback and suggestions as plain text without markdown formatting:
{
  "score": 0.85,
  "feedback": "Detailed assessment paragraph explaining the overall match. Use plain text only.",
  "suggestions": "Detailed suggestions for improvement with specific actionable items. Use plain text only.",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Score should be between 0 and 1. Be specific and actionable in your feedback and suggestions. Do not use markdown formatting like ** or * in the feedback and suggestions fields.`;

      console.log('⏳ Sending request to Gemini API...');
      const startTime = Date.now();
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const endTime = Date.now();
      console.log('✅ GEMINI AI EVALUATION COMPLETE!');
      console.log('⏱️ API Response time:', endTime - startTime, 'ms');
      console.log('📝 Raw AI response preview:', text.substring(0, 200) + '...');
      
      // Extract and clean JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('❌ No JSON found in AI response');
        console.log('📝 Full response:', text);
        throw new Error('Invalid response format from AI');
      }
      
      let cleanedJson = jsonMatch[0];
      let evaluation;
      
      // Clean up common JSON issues
      try {
        // Remove any trailing commas before closing brackets/braces
        cleanedJson = cleanedJson.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix quotes in array elements
        cleanedJson = cleanedJson.replace(/(["\w]+)\s*:\s*\[(.*?)\]/g, (match, key, arrayContent) => {
          if (key.includes('keywords')) {
            // Clean up keyword array specifically
            const cleaned = arrayContent
              .split(',')
              .map((item: string) => item.trim().replace(/^["']|["']$/g, ''))
              .filter((item: string) => item.length > 0)
              .map((item: string) => `"${item}"`)
              .join(', ');
            return `${key}: [${cleaned}]`;
          }
          return match;
        });
        
        console.log('🔧 Cleaned JSON preview:', cleanedJson.substring(0, 300) + '...');
        
        evaluation = JSON.parse(cleanedJson);
        console.log('✅ Successfully parsed AI evaluation');
        console.log('📊 Evaluation score:', evaluation.score);
        
      } catch (parseError) {
        console.log('❌ JSON parse error after cleaning:', parseError);
        console.log('📝 Cleaned JSON that failed:', cleanedJson);
        
        // Fallback: try to extract individual fields
        const scoreMatch = text.match(/"score":\s*([\d.]+)/);
        const feedbackMatch = text.match(/"feedback":\s*"([^"]*(?:"[^"]*"[^"]*)*)"/);
        const suggestionsMatch = text.match(/"suggestions":\s*"([^"]*(?:"[^"]*"[^"]*)*)"/);
        const keywordsMatch = text.match(/"keywords":\s*\[(.*?)\]/);
        
        evaluation = {
          score: scoreMatch ? parseFloat(scoreMatch[1]) : 0.5,
          feedback: feedbackMatch ? feedbackMatch[1] : "Unable to parse detailed feedback from AI response.",
          suggestions: suggestionsMatch ? suggestionsMatch[1] : "Unable to parse suggestions from AI response.",
          keywords: keywordsMatch ? 
            keywordsMatch[1].split(',').map(k => k.trim().replace(/['"]/g, '')).filter(k => k.length > 0) : 
            ["technical-skills", "experience", "education"]
        };
        
        console.log('🔄 Using fallback parsing result');
      }
      
      // Add timestamp to prove it's real AI
      evaluation.aiTimestamp = new Date().toISOString();
      evaluation.responseTime = endTime - startTime;
      
      return NextResponse.json(evaluation);

    } catch (aiError) {
      console.error('❌ GEMINI AI EVALUATION ERROR:', aiError);
      throw aiError;
    }

  } catch (error) {
    console.error('Error evaluating resume:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate resume', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
