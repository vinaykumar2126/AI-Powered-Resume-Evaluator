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

    // Using mock data for demonstration
    console.log('Using mock evaluation data');
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

// For future implementation with OpenAI
/*
async function evaluateWithAI(resume: string, jobDescription: string) {
  // Will be implemented when OpenAI package is installed
}
*/

function generateMockEvaluation(resume: string, jobDescription: string) {
  // Extract some keywords from the job description to make it look more realistic
  const keywords = extractKeywords(jobDescription);
  
  // Calculate a score based on the presence of keywords in the resume
  const score = calculateScore(resume, keywords, jobDescription);
  
  return {
    score,
    feedback: generateMockFeedback(score),
    suggestions: generateMockSuggestions(score, keywords, resume),
    keywords: keywords.slice(0, 10) // Just take the first 10 keywords
  };
}

function extractKeywords(jobDescription: string): string[] {
  // This is a simplified way to extract "keywords" - in reality you'd use NLP
  const commonWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'of', 'that', 'this', 'these', 'those', 'will', 'would',
    'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'as', 'we', 'our',
    'you', 'your', 'they', 'their', 'he', 'his', 'she', 'her', 'it', 'its', 'us',
    'from', 'about', 'who', 'what', 'where', 'when', 'why', 'how', 'all', 'any',
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such'
  ]);
  
  // Add specialized terms that are likely important in job descriptions
  const importantTerms = ['experience', 'skill', 'knowledge', 'ability', 'proficient', 
                         'develop', 'manage', 'create', 'design', 'implement', 'analyze',
                         'years', 'bachelor', 'master', 'degree'];
  
  // Extract words from job description, filter out common words and short words
  return jobDescription
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => (!commonWords.has(word) && word.length > 3) || importantTerms.includes(word))
    .filter((word, index, self) => self.indexOf(word) === index) // Unique words only
    .slice(0, 20); // Limit to 20 keywords
}

function calculateScore(resume: string, keywords: string[], jobDescription: string): number {
  const resumeLower = resume.toLowerCase();
  const jobDescLower = jobDescription.toLowerCase();
  
  // 1. Calculate keyword match rate
  const matchedKeywords = keywords.filter(keyword => resumeLower.includes(keyword));
  const keywordScore = matchedKeywords.length / keywords.length;
  
  // 2. Check for education matches
  const educationTerms = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'certification'];
  const educationMatch = educationTerms.some(term => 
    (jobDescLower.includes(term) && resumeLower.includes(term))
  );
  
  // 3. Check for experience matches
  const experienceMatch = checkExperienceMatch(resumeLower, jobDescLower);
  
  // 4. Check for skill section presence
  const hasSkillsSection = resumeLower.includes('skills') || 
                          resumeLower.includes('expertise') || 
                          resumeLower.includes('proficiency');
  
  // 5. Length check - longer resumes tend to have more details
  const lengthScore = Math.min(1, resume.length / 3000); // Cap at 3000 chars
  
  // 6. Calculate the final score with weighted components
  let finalScore = (
    keywordScore * 0.5 + 
    (educationMatch ? 0.15 : 0) + 
    (experienceMatch ? 0.15 : 0) + 
    (hasSkillsSection ? 0.1 : 0) +
    lengthScore * 0.1
  );
  
  // Add some randomness but keep within reasonable bounds
  const randomFactor = (Math.random() * 0.2) - 0.1; // -0.1 to +0.1
  finalScore = Math.max(0.3, Math.min(0.95, finalScore + randomFactor));
  
  return finalScore;
}

function checkExperienceMatch(resume: string, jobDescription: string): boolean {
  // Check for experience requirements in job description
  const experienceRegex = /(\d+)[\s-]*(?:year|yr)s?/gi;
  const experienceMatches = [...jobDescription.matchAll(experienceRegex)];
  
  if (experienceMatches.length === 0) {
    return true; // No specific experience requirement found
  }
  
  // Find the highest year requirement
  const yearsRequired = Math.max(...experienceMatches.map(match => 
    parseInt(match[1], 10)
  ));
  
  // Check if resume mentions similar experience
  const resumeExperienceMatches = [...resume.matchAll(experienceRegex)];
  const maxResumeYears = resumeExperienceMatches.length > 0 ? 
    Math.max(...resumeExperienceMatches.map(match => parseInt(match[1], 10))) : 0;
  
  return maxResumeYears >= yearsRequired * 0.8; // Allow some flexibility
}

function generateMockFeedback(score: number): string {
  if (score > 0.8) {
    return "Your resume is very well-aligned with the job description. You've included many of the key skills and qualifications the employer is looking for. The document is well-structured and effectively communicates your relevant experience and background. Your experience appears to match what the employer is seeking, and your skills are presented clearly.\n\nYour education and qualifications align well with the position requirements. The resume demonstrates a strong fit for this role.";
  } else if (score > 0.6) {
    return "Your resume shows good potential for this position. While you have included some important keywords and qualifications, there are areas where you could better highlight specific skills and experiences mentioned in the job listing.\n\nConsider reorganizing your content to emphasize the most relevant experiences for this particular role. Your background appears to have good elements that match this position, but they could be presented more strategically to demonstrate your fit.";
  } else if (score > 0.4) {
    return "Your resume could benefit from moderate revisions to better match this job description. Several key skills and qualifications mentioned in the job listing are not clearly represented in your resume.\n\nConsider adding more specific examples of your relevant experience and achievements. The employer is looking for specific expertise that isn't fully addressed in your current resume. Try to quantify your achievements and connect them directly to the requirements in the job posting.";
  } else {
    return "Your resume needs significant revisions to align with this job description. Many essential skills and qualifications from the job listing are missing or not clearly communicated.\n\nYour current resume may not effectively represent your actual qualifications for this role. Consider a substantial restructuring to highlight relevant experience, even if it means deemphasizing other aspects of your background. Focus on matching your language to the terms used in the job posting.";
  }
}

function generateMockSuggestions(score: number, keywords: string[], resume: string): string {
  const resumeLower = resume.toLowerCase();
  const missingKeywords = keywords.filter(keyword => !resumeLower.includes(keyword));
  
  let suggestions = "";
  
  if (missingKeywords.length > 0) {
    suggestions += `1. **Add key terms**: Include these important keywords in your resume: ${missingKeywords.join(', ')}.\n\n`;
  }
  
  if (score < 0.7) {
    suggestions += "2. **Restructure your experience**: Prioritize achievements and responsibilities that are most relevant to this specific position.\n\n";
    suggestions += "3. **Quantify your achievements**: Add metrics and specific results to demonstrate your impact in relevant areas (e.g., 'increased efficiency by 30%' rather than 'improved efficiency').\n\n";
  }
  
  suggestions += "4. **Customize your summary**: Tailor your professional summary or objective to directly address the main requirements of this role.\n\n";
  
  if (!resumeLower.includes('skill') && !resumeLower.includes('expertise')) {
    suggestions += "5. **Add a skills section**: Create a dedicated section highlighting your relevant technical and soft skills.\n\n";
  }
  
  if (resume.length < 2000) {
    suggestions += "6. **Add more detail**: Your resume appears brief. Consider adding more details about projects and experiences that relate to this position.\n\n";
  } else if (resume.length > 5000) {
    suggestions += "6. **Be more concise**: Your resume is quite lengthy. Focus on refining the language to be more concise while maintaining the important details.\n\n";
  }
  
  suggestions += "7. **Use action verbs**: Begin bullet points with strong action verbs such as 'developed,' 'implemented,' 'managed,' rather than passive language.\n\n";
  
  if (score < 0.5) {
    suggestions += "8. **Consider a different format**: Your current resume structure may not be highlighting your strengths effectively. Consider a different format that emphasizes your relevant qualifications.";
  } else {
    suggestions += "8. **Proofread carefully**: Ensure your resume is free of grammatical errors and inconsistencies in formatting.";
  }
  
  return suggestions;
}
