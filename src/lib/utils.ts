import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // For PDF files, we'll attempt to use pdf-parse if available
    // Otherwise, we'll just use a fallback mechanism for demo
    
    // In a real implementation, you'd use pdf-parse
    // const pdfData = await pdfParse(await file.arrayBuffer());
    // return pdfData.text;
    
    // For now, we'll just simulate some text extraction
    // This will let us test the UI without needing pdf-parse dependency
    const fileName = file.name.toLowerCase();
    
    // Generate sample text based on file name to make it seem more realistic
    const mockResumeText = generateMockResumeText(fileName);
    
    return mockResumeText;
    
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return 'Failed to extract text from PDF. Please try again or use a different file.';
  }
}

// Helper function to generate dummy resume text for testing
function generateMockResumeText(fileName: string): string {
  const skills = [
    "JavaScript", "TypeScript", "React", "NextJS", "Node.js", 
    "Python", "Java", "C#", "SQL", "AWS", "Azure", "Docker",
    "Machine Learning", "Data Science", "Project Management"
  ];
  
  // Pick some random skills based on filename to simulate different resumes
  const fileNameHash = fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const selectedSkills = skills.filter((_, index) => (fileNameHash + index) % 3 === 0);
  
  return `
John Doe
Software Engineer
email@example.com | (555) 123-4567 | linkedin.com/in/johndoe

SUMMARY
Experienced software engineer with 5+ years of professional experience in developing and maintaining high-quality applications. Skilled in full-stack development, problem-solving, and team collaboration.

EDUCATION
University of Technology
Bachelor of Science in Computer Science, 2015-2019
GPA: 3.8/4.0

SKILLS
${selectedSkills.join(', ')}

EXPERIENCE
Senior Software Engineer | Tech Solutions Inc. | 2021-Present
- Developed and maintained multiple web applications using React and Node.js
- Implemented CI/CD pipelines that reduced deployment time by 40%
- Led a team of 3 developers to successfully deliver projects on time and within budget
- Improved application performance by 60% through code optimization

Software Engineer | Digital Innovations LLC | 2019-2021
- Designed and developed RESTful APIs using Node.js and Express
- Collaborated with UX designers to implement responsive user interfaces
- Participated in code reviews and maintained coding standards
- Reduced bug rate by 30% through comprehensive unit testing

PROJECTS
Project Management Dashboard
- Created a project management tool using React, TypeScript and Firebase
- Implemented real-time updates and notifications
- Used by over 500 users with a 4.8/5 satisfaction rating

E-commerce Platform
- Built a scalable e-commerce platform using microservices architecture
- Integrated payment processing and inventory management systems
- Resulted in 25% increase in online sales

CERTIFICATIONS
AWS Certified Developer - Associate
Microsoft Certified: Azure Developer Associate
`;
}
