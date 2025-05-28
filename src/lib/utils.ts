import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

// AI-powered resume analysis
export async function analyzeResumeWithAI(resumeText: string, jobDescription: string): Promise<{
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  matchedSkills: string[];
  missingSkills: string[];
}> {
  try {
    console.log('🚀 Starting AI resume analysis...');
    console.log('📄 Resume text length:', resumeText.length);
    console.log('💼 Job description length:', jobDescription.length);
    
    const startTime = Date.now();
    
    const response = await fetch('/api/analyze-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        jobDescription,
      }),
    });

    const endTime = Date.now();
    console.log(`⏱️ Analysis completed in ${endTime - startTime}ms`);

    if (!response.ok) {
      throw new Error('Failed to analyze resume');
    }

    const result = await response.json();
    console.log('✅ Analysis result received:', {
      score: result.score,
      strengthsCount: result.strengths?.length || 0,
      improvementsCount: result.improvements?.length || 0,
      matchedSkillsCount: result.matchedSkills?.length || 0
    });

    return result;
  } catch (error) {
    console.error('❌ Error analyzing resume:', error);
    throw new Error('Failed to analyze resume. Please try again.');
  }
}

// Extract text from PDF using server-side API
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    console.log('📄 Starting PDF extraction for:', file.name);
    console.log('📊 File size:', file.size, 'bytes');
    
    const formData = new FormData();
    formData.append('pdf', file);

    const startTime = Date.now();

    const response = await fetch('/api/extract-pdf', {
      method: 'POST',
      body: formData,
    });

    const endTime = Date.now();
    console.log(`⏱️ PDF extraction completed in ${endTime - startTime}ms`);

    if (!response.ok) {
      throw new Error('Failed to extract PDF text');
    }

    const { text } = await response.json();
    console.log('✅ PDF text extracted, length:', text.length);
    
    return text;
  } catch (error) {
    console.error('❌ Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF. Please ensure it\'s a valid PDF file.');
  }
}

// Extract skills from job description using AI
export async function extractSkillsFromJobDescription(jobDescription: string): Promise<string[]> {
  try {
    const response = await fetch('/api/extract-skills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobDescription }),
    });

    if (!response.ok) {
      throw new Error('Failed to extract skills');
    }

    const { skills } = await response.json();
    return skills;
  } catch (error) {
    console.error('Error extracting skills:', error);
    return [];
  }
}

// Test AI connectivity
export async function testAIConnection(): Promise<{
  success: boolean;
  message: string;
  responseTime?: number;
}> {
  try {
    console.log('🧪 Testing AI connection from client...');
    
    const response = await fetch('/api/test-ai');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ AI connection test successful!');
      console.log('⏱️ AI response time:', result.responseTime, 'ms');
      console.log('🤖 AI response:', result.aiResponse);
      
      return {
        success: true,
        message: `AI is working! Response time: ${result.responseTime}ms`,
        responseTime: result.responseTime
      };
    } else {
      console.log('❌ AI connection test failed:', result.error);
      return {
        success: false,
        message: `AI test failed: ${result.error}`
      };
    }
    
  } catch (error) {
    console.error('❌ Client AI test error:', error);
    return {
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
