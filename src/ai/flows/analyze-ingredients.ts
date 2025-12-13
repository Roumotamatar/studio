'use server';
/**
 * @fileOverview A flow for analyzing a list of skincare ingredients from an image.
 *
 * - analyzeIngredients - A function that handles the ingredient analysis process.
 * - AnalyzeIngredientsInput - The input type for the analyzeIngredients function.
 * - AnalyzeIngredientsOutput - The return type for the analyzeIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeIngredientsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a skincare product's ingredient list, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeIngredientsInput = z.infer<typeof AnalyzeIngredientsInputSchema>;

const IngredientSchema = z.object({
    name: z.string().describe("The name of the ingredient."),
    description: z.string().describe("A brief, easy-to-understand description of what the ingredient does (e.g., 'Moisturizer', 'Exfoliant', 'Preservative')."),
    isGood: z.boolean().describe("True if the ingredient is generally beneficial or benign."),
    isBad: z.boolean().describe("True if the ingredient is a known common irritant or comedogenic (pore-clogging)."),
});

const AnalyzeIngredientsOutputSchema = z.object({
    ingredients: z.array(IngredientSchema).describe("A list of identified ingredients and their analysis."),
    summary: z.string().describe("A brief, overall summary of the product's suitability for sensitive or acne-prone skin based on the ingredient list."),
});
export type AnalyzeIngredientsOutput = z.infer<typeof AnalyzeIngredientsOutputSchema>;

export async function analyzeIngredients(input: AnalyzeIngredientsInput): Promise<AnalyzeIngredientsOutput> {
  return analyzeIngredientsFlow(input);
}

const analyzeIngredientsPrompt = ai.definePrompt({
  name: 'analyzeIngredientsPrompt',
  input: {schema: AnalyzeIngredientsInputSchema},
  output: {schema: AnalyzeIngredientsOutputSchema},
  prompt: `You are an expert esthetician. Your task is to analyze the skincare ingredient list provided in the image.

  1.  First, perform OCR on the image to accurately extract the list of ingredients.
  2.  For each ingredient, provide its name and a simple, one or two-word description of its primary function (e.g., "Moisturizer", "Exfoliant", "Preservative", "Antioxidant").
  3.  Flag each ingredient as 'isBad' if it is a widely recognized potential irritant (like fragrance, certain alcohols) or is known to be highly comedogenic (pore-clogging).
  4.  Flag each ingredient as 'isGood' if it is generally considered beneficial (e.g., Hyaluronic Acid, Niacinamide, Ceramides) or is a benign carrier/formulation agent. An ingredient can be both not good and not bad.
  5.  Finally, provide a brief, one to two-sentence summary of the product based on its ingredients, noting if it seems suitable for sensitive or acne-prone skin.
  
  Image with ingredient list: {{media url=photoDataUri}}
  
  Provide a structured response.`,
});

const analyzeIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzeIngredientsFlow',
    inputSchema: AnalyzeIngredientsInputSchema,
    outputSchema: AnalyzeIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzeIngredientsPrompt(input);
    return output!;
  }
);
