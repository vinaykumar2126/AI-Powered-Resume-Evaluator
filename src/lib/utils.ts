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
    // For now, returning a simple text extraction since pdf-parse may not be installed
    return "Extracted text would appear here in production. Install pdf-parse for full functionality.";
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return 'Failed to extract text from PDF. Please try again or use a different file.';
  }
}
