# ResumAI - AI-Powered Resume Evaluator

ResumAI is a Generative AI-driven platform that evaluates resumes against job descriptions using OpenAI's GPT-4 and NLP models (BERT, TF-IDF) to provide detailed feedback and suggestions.

## Features

- Resume parsing and analysis
- Job description keyword extraction
- AI-powered resume scoring and evaluation
- Detailed feedback and improvement suggestions
- Keyword recommendations for resume optimization

## Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **AI Models**: OpenAI GPT-4, BERT, TF-IDF
- **PDF Processing**: pdf-parse

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   USE_MOCK_DATA=false
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

During development, you can set `USE_MOCK_DATA=true` in your `.env.local` file to use mock data instead of making actual API calls to OpenAI.

## License

[MIT](LICENSE)
