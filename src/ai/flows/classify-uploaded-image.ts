'use server';

/**
 * @fileOverview A flow for classifying uploaded skin images and detecting potential skin diseases.
 *
 * - classifyUploadedImage - A function that handles the image classification process.
 * - ClassifyUploadedImageInput - The input type for the classifyUploadedImage function.
 * - ClassifyUploadedImageOutput - The return type for the classifyUploadedImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyUploadedImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the skin condition, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ClassifyUploadedImageInput = z.infer<typeof ClassifyUploadedImageInputSchema>;

const ClassifyUploadedImageOutputSchema = z.object({
  diseaseClassification: z.string().describe('The classification of the skin disease.'),
});
export type ClassifyUploadedImageOutput = z.infer<typeof ClassifyUploadedImageOutputSchema>;

export async function classifyUploadedImage(
  input: ClassifyUploadedImageInput
): Promise<ClassifyUploadedImageOutput> {
  return classifyUploadedImageFlow(input);
}

const classifyImagePrompt = ai.definePrompt({
  name: 'classifyImagePrompt',
  input: {schema: ClassifyUploadedImageInputSchema},
  output: {schema: ClassifyUploadedImageOutputSchema},
  prompt: `Analyze the provided image of a skin condition and classify the potential disease.

  Image: {{media url=photoDataUri}}
  
  Based on the image, provide a concise classification of the skin condition (e.g., "Acne", "Eczema", "Psoriasis", "Benign Nevus"). Your response should only contain the name of the condition.`,
});

const classifyUploadedImageFlow = ai.defineFlow(
  {
    name: 'classifyUploadedImageFlow',
    inputSchema: ClassifyUploadedImageInputSchema,
    outputSchema: ClassifyUploadedImageOutputSchema,
  },
  async input => {
    const {output} = await classifyImagePrompt(input);
    return output!;
  }
);
