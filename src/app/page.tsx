"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { extractTextFromPdf } from "@/lib/utils";
import { Loader2, Upload, FileText, CheckCircle } from "lucide-react";

type FormData = {
  jobDescription: string;
};

type EvaluationResult = {
  score: number;
  feedback: string;
  suggestions: string;
  keywords: string[];
};

export default function Home() {
  const [resumeText, setResumeText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      
      setFileName(file.name);
      
      try {
        if (file.type === 'application/pdf') {
          const text = await extractTextFromPdf(file);
          setResumeText(text);
        } else {
          const text = await file.text();
          setResumeText(text);
        }
      } catch (error) {
        console.error("Error extracting text:", error);
        alert("Failed to extract text from the file");
      }
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!resumeText) {
      alert("Please upload a resume first");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription: data.jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate resume');
      }

      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error("Error evaluating resume:", error);
      alert("An error occurred while evaluating the resume");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">ResumAI Evaluator</h1>
        <p className="text-xl text-center mb-4">Optimize your resume for your dream job using AI</p>
        <p className="text-sm text-center mb-12 text-muted-foreground">Powered by OpenAI GPT-4 and NLP models (BERT, TF-IDF)</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Step 1: Upload your resume</h2>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                {fileName ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-secondary mb-2" />
                    <p className="text-lg font-medium">{fileName}</p>
                    <p className="text-sm text-gray-500 mt-2">Click or drag to replace</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-lg">Drag & drop your resume here</p>
                    <p className="text-sm text-gray-500 mt-2">Supports PDF and TXT files</p>
                  </>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Step 2: Enter job description</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Textarea
                {...register("jobDescription", { required: "Job description is required" })}
                className="w-full h-64 p-4"
                placeholder="Paste the job description here..."
              />
              {errors.jobDescription && (
                <p className="text-destructive mt-1">{errors.jobDescription.message}</p>
              )}
              
              <Button 
                type="submit" 
                className="mt-4 w-full"
                disabled={isLoading || !resumeText}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Evaluate Resume"
                )}
              </Button>
            </form>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Results</h2>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[30rem] border rounded-lg p-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">Analyzing your resume against the job description...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
              </div>
            ) : result ? (
              <div className="border rounded-lg p-6 h-[30rem] overflow-y-auto">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Match Score</h3>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="bg-primary h-6 rounded-full"
                      style={{ width: `${Math.round(result.score * 100)}%` }}
                    >
                      <span className="px-2 text-primary-foreground font-medium">
                        {Math.round(result.score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Feedback</h3>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {result.feedback}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Suggestions for Improvement</h3>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {result.suggestions}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Keywords to Include</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className="bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[30rem] border rounded-lg p-6 text-gray-500">
                <FileText className="h-12 w-12 mb-4" />
                <p className="text-lg">Upload your resume and enter a job description to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
