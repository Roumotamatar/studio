import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-remedies-for-detected-condition.ts';
import '@/ai/flows/classify-uploaded-image.ts';