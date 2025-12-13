'use server';
/**
 * @fileOverview A flow for checking if a skincare product is suitable for a diagnosed condition.
 *
 * - checkProductSuitability - A function that handles the product check process.
 * - CheckProductSuitabilityInput - The input type for the checkProductSuitability function.
 * - CheckProductSuitabilityOutput - The return type for the checkProductSuitability function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckProductSuitabilityInputSchema = z.object({
  diagnosedCondition: z.string().describe('The skin condition that was diagnosed.'),
  productIngredientsImageUri: z
    .string()
    .describe(
      "A photo of a skincare product's ingredient list, as a data URI."
    ),
});
export type CheckProductSuitabilityInput = z.infer<typeof CheckProductSuitabilityInputSchema>;

const IngredientAnalysisSchema = z.object({
    name: z.string().describe("The name of the ingredient."),
    isHelpful: z.boolean().describe("True if this ingredient is known to be beneficial for the diagnosed condition."),
    isHarmful: z.boolean().describe("True if this ingredient is a known irritant or could worsen the diagnosed condition."),
    reason: z.string().describe("A brief explanation of why the ingredient is helpful or harmful for the specific condition."),
});

const CheckProductSuitabilityOutputSchema = z.object({
    isGoodMatch: z.boolean().describe("Overall assessment: true if the product is a good match for the condition, false otherwise."),
    summary: z.string().describe("A one-sentence summary explaining why the product is or isn't a good match."),
    ingredientAnalyses: z.array(IngredientAnalysisSchema).describe("A list of the most important ingredients found and their specific relevance to the diagnosed condition."),
});
export type CheckProductSuitabilityOutput = z.infer<typeof CheckProductSuitabilityOutputSchema>;

export async function checkProductSuitability(input: CheckProductSuitabilityInput): Promise<CheckProductSuitabilityOutput> {
  return checkProductSuitabilityFlow(input);
}

const productCheckPrompt = ai.definePrompt({
  name: 'productCheckPrompt',
  input: {schema: CheckProductSuitabilityInputSchema},
  output: {schema: CheckProductSuitabilityOutputSchema},
  prompt: `You are an expert dermatologist. The user was diagnosed with "{{diagnosedCondition}}".
  They have provided an image of a skincare product's ingredient list.

  Your task is to determine if this product is suitable for someone with "{{diagnosedCondition}}".

  1.  First, perform OCR on the image to get the list of ingredients.
  2.  Analyze the key ingredients and determine if they are helpful or potentially harmful for "{{diagnosedCondition}}".
      - An ingredient is 'isHelpful' if it soothes, treats, or supports the healing of the condition (e.g., Salicylic Acid for Acne, Hyaluronic Acid for Eczema).
      - An ingredient is 'isHarmful' if it is a known irritant, is comedogenic, or could otherwise exacerbate "{{diagnosedCondition}}" (e.g., Alcohol for Rosacea, Heavy oils for Acne).
  3.  Provide a 'reason' for why each key ingredient is helpful or harmful in the context of "{{diagnosedCondition}}".
  4.  Based on the overall ingredient list, determine if the product is a 'isGoodMatch'. A product is a good match if it contains more helpful than harmful ingredients and doesn't contain any major red-flag ingredients for the condition.
  5.  Provide a concise 'summary' explaining your final recommendation.

  Image of product ingredients: {{media url=productIngredientsImageUri}}
  
  Provide a structured response.`,
});

const checkProductSuitabilityFlow = ai.defineFlow(
  {
    name: 'checkProductSuitabilityFlow',
    inputSchema: CheckProductSuitabilityInputSchema,
    outputSchema: CheckProductSuitabilityOutputSchema,
  },
  async input => {
    const {output} = await productCheckPrompt(input);
    return output!;
  }
);
