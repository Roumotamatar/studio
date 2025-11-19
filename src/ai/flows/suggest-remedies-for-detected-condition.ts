'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting remedies for a detected skin condition.
 *
 * - suggestRemedies - A function that takes a detected skin condition and suggests remedies.
 * - SuggestRemediesInput - The input type for the suggestRemedies function.
 * - SuggestRemediesOutput - The output type for the suggestRemedies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRemediesInputSchema = z.object({
  detectedCondition: z
    .string()
    .describe('The detected skin condition for which to suggest remedies.'),
});

export type SuggestRemediesInput = z.infer<typeof SuggestRemediesInputSchema>;

const SuggestRemediesOutputSchema = z.object({
  suggestedRemedies: z
    .string()
    .describe('A list of possible remedies and treatments for the detected skin condition.'),
});

export type SuggestRemediesOutput = z.infer<typeof SuggestRemediesOutputSchema>;

const suggestRemediesPrompt = ai.definePrompt({
  name: 'suggestRemediesPrompt',
  input: {schema: SuggestRemediesInputSchema},
  output: {schema: SuggestRemediesOutputSchema},
  system: `You are a helpful dermatology assistant. You will suggest remedies and treatments for the detected skin condition.`,
  prompt: `Detected Skin Condition: {{{detectedCondition}}}
  
  Provide a list of suggested remedies and treatments for the condition above. If the condition sounds severe, include a note about seeking professional medical advice for severe cases.`,
});


const suggestRemediesFlow = ai.defineFlow(
  {
    name: 'suggestRemediesFlow',
    inputSchema: SuggestRemediesInputSchema,
    outputSchema: SuggestRemediesOutputSchema,
  },
  async input => {
    const {output} = await suggestRemediesPrompt(input);
    return output!;
  }
);

export async function suggestRemedies(input: SuggestRemediesInput): Promise<SuggestRemediesOutput> {
  return suggestRemediesFlow(input);
}
