'use server';
/**
 * @fileOverview This file defines a Genkit flow for handling follow-up questions about a skin diagnosis.
 *
 * - answerFollowUp - A function that takes diagnosis context and a user question, and returns an AI-generated answer.
 * - FollowUpInput - The input type for the answerFollowUp function.
 * - FollowUpOutput - The output type for the answerFollowUp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FollowUpInputSchema = z.object({
  diagnosisContext: z.string().describe('The context of the initial diagnosis, including the condition, severity, and suggested remedies.'),
  userQuestion: z.string().describe("The user's follow-up question."),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The history of the conversation so far.'),
});

export type FollowUpInput = z.infer<typeof FollowUpInputSchema>;

const FollowUpOutputSchema = z.object({
  aiResponse: z.string().describe('The AI-generated answer to the user\'s question.'),
});

export type FollowUpOutput = z.infer<typeof FollowUpOutputSchema>;


export async function answerFollowUp(input: FollowUpInput): Promise<FollowUpOutput> {
  return followUpFlow(input);
}

const followUpPrompt = ai.definePrompt({
  name: 'followUpPrompt',
  input: { schema: FollowUpInputSchema },
  output: { schema: FollowUpOutputSchema },
  system: `You are a helpful and cautious dermatology assistant AI. Your role is to answer follow-up questions based ONLY on the provided context of a skin condition diagnosis.

  **CRITICAL RULES:**
  1.  **DO NOT PROVIDE MEDICAL ADVICE.** You are an AI, not a doctor.
  2.  If the user asks for a diagnosis, for you to look at a new image, or anything that requires medical expertise, you MUST refuse and strongly recommend consulting a qualified healthcare professional.
  3.  Base your answers strictly on the initial diagnosis context provided. Do not invent new information.
  4.  Keep your answers concise, clear, and easy to understand.
  5.  Always end your response with a disclaimer: "Remember, this is for informational purposes only. Please consult a doctor for medical advice."
  `,
  prompt: `**Initial Diagnosis Context:**
  {{{diagnosisContext}}}
  
  **Conversation History:**
  {{#each chatHistory}}
    **{{role}}:** {{{content}}}
  {{/each}}

  **User's New Question:**
  {{{userQuestion}}}
  
  Please provide a helpful answer to the user's new question based on the context and history provided, following all your critical rules.`,
});

const followUpFlow = ai.defineFlow(
  {
    name: 'followUpFlow',
    inputSchema: FollowUpInputSchema,
    outputSchema: FollowUpOutputSchema,
  },
  async (input) => {
    const { output } = await followUpPrompt(input);
    return output!;
  }
);
