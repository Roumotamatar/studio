'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting remedies for a detected skin condition.
 *
 * - suggestRemedies - A function that takes a detected skin condition and suggests remedies.
 * - SuggestRemediesInput - The input type for the suggestRemedies function.
 * - SuggestRemediesOutput - The return type for the suggestRemedies function.
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
  remedies: z.array(z.object({
    title: z.string().describe("The concise name of the remedy or treatment."),
    description: z.string().describe("A brief explanation of the remedy.")
  })).describe("A list of suggested over-the-counter treatments or home remedies."),
  routine: z.object({
    am: z.array(z.string()).describe("A list of morning skincare routine steps (e.g., 'Gentle Cleanser', 'Moisturizer', 'Sunscreen SPF 30+')."),
    pm: z.array(z.string()).describe("A list of evening skincare routine steps (e.g., 'Cleanser', 'Treatment Serum', 'Night Cream').")
  }).describe("A sample daily skincare routine tailored to the condition."),
  lifestyle: z.array(z.object({
    title: z.string().describe("The concise name of the lifestyle tip."),
    description: z.string().describe("A brief explanation of the diet or lifestyle recommendation.")
  })).describe("A list of diet and lifestyle recommendations that may help manage the condition."),
});


export type SuggestRemediesOutput = z.infer<typeof SuggestRemediesOutputSchema>;

const suggestRemediesPrompt = ai.definePrompt({
  name: 'suggestRemediesPrompt',
  input: {schema: SuggestRemediesInputSchema},
  output: {schema: SuggestRemediesOutputSchema},
  system: `You are a helpful dermatology assistant. You will suggest remedies, a daily routine, and lifestyle changes for the detected skin condition.`,
  prompt: `Detected Skin Condition: {{{detectedCondition}}}
  
  Based on the condition above, provide a structured response including:
  1.  A list of suggested over-the-counter remedies and treatments.
  2.  A simple, tailored AM (morning) and PM (evening) skincare routine.
  3.  A list of relevant diet and lifestyle recommendations.

  If the condition sounds severe, include a note in the remedies about seeking professional medical advice.`,
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
