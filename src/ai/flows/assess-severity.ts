'use server';
/**
 * @fileOverview A flow for assessing the severity of a detected skin condition from an image.
 *
 * - assessSeverity - A function that handles the severity assessment process.
 * - AssessSeverityInput - The input type for the assessSeverity function.
 * - AssessSeverityOutput - The return type for the assessSeverity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessSeverityInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the skin condition, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  condition: z.string().describe('The name of the diagnosed skin condition.'),
});
export type AssessSeverityInput = z.infer<typeof AssessSeverityInputSchema>;

const AssessSeverityOutputSchema = z.object({
  severity: z.enum(['Mild', 'Moderate', 'Severe'])
    .describe('The assessed severity of the skin condition.'),
});
export type AssessSeverityOutput = z.infer<typeof AssessSeverityOutputSchema>;

export async function assessSeverity(input: AssessSeverityInput): Promise<AssessSeverityOutput> {
  return assessSeverityFlow(input);
}

const assessSeverityPrompt = ai.definePrompt({
  name: 'assessSeverityPrompt',
  input: {schema: AssessSeverityInputSchema},
  output: {schema: AssessSeverityOutputSchema},
  prompt: `You are an expert dermatologist. Based on the provided image of a skin condition diagnosed as "{{condition}}", assess its severity. Consider factors like redness, inflammation, size of the affected area, and texture. Classify the severity as "Mild", "Moderate", or "Severe".

  Image: {{media url=photoDataUri}}
  
  Your response must only be one of the three severity levels.`,
});

const assessSeverityFlow = ai.defineFlow(
  {
    name: 'assessSeverityFlow',
    inputSchema: AssessSeverityInputSchema,
    outputSchema: AssessSeverityOutputSchema,
  },
  async input => {
    const {output} = await assessSeverityPrompt(input);
    return output!;
  }
);
