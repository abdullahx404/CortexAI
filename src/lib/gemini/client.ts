import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  // Don't throw at module load — only fail when actually used
  console.warn('[gemini] GEMINI_API_KEY is not set.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'not-configured');

export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.1, // Low temperature for structured output
    maxOutputTokens: 8192,
  },
});
