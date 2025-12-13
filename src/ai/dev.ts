'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-remedies-for-detected-condition.ts';
import '@/ai/flows/classify-uploaded-image.ts';
import '@/ai/flows/assess-severity.ts';
import '@/ai/flows/follow-up-chat.ts';
import '@/ai/flows/analyze-ingredients.ts';
