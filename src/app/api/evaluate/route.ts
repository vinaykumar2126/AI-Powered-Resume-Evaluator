import { NextResponse } from 'next/server';

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

    // For demonstration purposes, we'll return mock data
    // In a production app, you would call the OpenAI API here
    const mockResult = generateMockEvaluation(resume, jobDescription);
    
    return NextResponse.json(mockResult);

  } catch (error) {
    console.error('Error evaluating resume:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate resume' },
      { status: 500 }
    );
  }
}

function generateMockEvaluation(resume: string, jobDescription: string) {
  // Extract some keywords from the job description to make it look more realistic
  const keywords = extractKeywords(jobDescription);
  
  // Calculate a mock score based on the presence of keywords in the resume
  const score = calculateMockScore(resume, keywords);
  
  return {
    score,
    feedback: generateMockFeedback(score),
    suggestions: generateMockSuggestions(score, keywords, resume),
    keywords: keywords.slice(0, 7) // Just take the first 7 keywords
  };
}

function extractKeywords(jobDescription: string): string[] {
  // This is a simplified way to extract "keywords" - in reality you'd use NLP
  const commonWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'of', 'that', 'this', 'these', 'those', 'will', 'would',
    'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'as', 'we', 'our',
    'you', 'your', 'they', 'their', 'he', 'his', 'she', 'her'
  ]);
  
  // Extract words from job description, filter out common words and short words
  return jobDescription
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => !commonWords.has(word) && word.length > 3)
    .filter((word, index, self) => self.indexOf(word) === index) // Unique words only
    .slice(0, 15); // Limit to 15 keywords
}

function calculateMockScore(resume: string, keywords: string[]): number {
  const resumeLower = resume.toLowerCase();
  const matchedKeywords = keywords.filter(keyword => resumeLower.includes(keyword));
  return Math.min(0.9, Math.max(0.4, matchedKeywords.length / keywords.length));
}

function generateMockFeedback(score: number): string {
  if (score > 0.8) {
    return "Your resume is well-aligned with the job description. You've included many of the key skills and qualifications the employer is looking for. The document is well-structured and effectively communicates your relevant experience.";
  } else if (score > 0.6) {
    return "Your resume shows good potential for this position. While you have included some important keywords, there are areas where you could better highlight specific skills and experiences mentioned in the job listing.";
  } else {
    return "Your resume could benefit from a significant revision to better match this job description. Many of the key skills and qualifications mentioned in the job listing are not clearly represented in your resume.";
  }
}

function generateMockSuggestions(score: number, keywords: string[], resume: string): string {
  const resumeLower = resume.toLowerCase();
  const missingKeywords = keywords.filter(keyword => !resumeLower.includes(keyword));
  
  let suggestions = "";
  
  if (missingKeywords.length > 0) {
    suggestions += `1. Consider adding these important keywords to your resume: ${missingKeywords.join(', ')}.\n\n`;
  }
  
  if (score < 0.7) {
    suggestions += "2. Restructure your experience section to prioritize achievements that are most relevant to this position.\n\n";
    suggestions += "3. Add measurable accomplishments with metrics to demonstrate impact in relevant areas.\n\n";
  }
  
  suggestions += "4. Tailor your professional summary to directly address the main requirements of this role.\n\n";
  
  if (resume.length < 2000) {
    suggestions += "5. Your resume appears brief. Consider adding more detail about projects and experiences that relate to this position.";
  } else {
    suggestions += "5. Focus on refining the language to be more concise while maintaining the important details.";
  }
  
  return suggestions;
}
