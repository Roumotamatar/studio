import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

if (!process.env.GEMINI_API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      'GEMINI_API_KEY environment variable is not set. The app will not work.'
    );
  } else {
    console.warn(
      'GEMINI_API_KEY environment variable is not set. The app will not work. Please add it to your .env file.'
    );
  }
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: 'googleai/gemini-2.5-flash',
});
