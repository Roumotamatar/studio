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

const shouldIncludeAdditionalInfoTool = ai.defineTool({
  name: 'shouldIncludeAdditionalInfo',
  description: 'Determines whether a specific piece of information should be included in the model\'s generated response.',
  inputSchema: z.object({
    infoType: z.string().describe('The type of information to consider including.'),
    detectedCondition: z.string().describe('The detected skin condition.'),
  }),
  outputSchema: z.boolean().describe('Whether or not to include the information.'),
}, async (input) => {
  // In a real application, this would involve a more complex decision-making process.
  // For this example, we'll just include the information if the condition contains certain keywords.
  const {
    infoType,
    detectedCondition
  } = input;
  if (infoType === 'Severity' && detectedCondition.toLowerCase().includes('severe')) {
    return true;
  }
  return false;
});

const suggestRemediesPrompt = ai.definePrompt({
  name: 'suggestRemediesPrompt',
  input: {schema: SuggestRemediesInputSchema},
  output: {schema: SuggestRemediesOutputSchema},
  tools: [shouldIncludeAdditionalInfoTool],
  prompt: `You are a helpful dermatology assistant. You will suggest remedies and treatments for the detected skin condition.

  Detected Skin Condition: {{{detectedCondition}}}

  Consider the severity of the condition before suggesting remedies.

  {{#if (shouldIncludeAdditionalInfoTool infoType="Severity" detectedCondition=detectedCondition)}}Include information about severe cases.{{/if}}

  Suggested Remedies:
  `,
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
