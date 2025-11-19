'use server';

import { classifyUploadedImage } from '@/ai/flows/classify-uploaded-image';
import { suggestRemedies } from '@/ai/flows/suggest-remedies-for-detected-condition';

export async function analyzeSkinCondition(photoDataUri: string) {
  if (!photoDataUri) {
    throw new Error('Image data is missing.');
  }

  try {
    const classificationResult = await classifyUploadedImage({ photoDataUri });
    if (!classificationResult?.diseaseClassification) {
      throw new Error('Could not classify the image.');
    }

    const remedyResult = await suggestRemedies({
      detectedCondition: classificationResult.diseaseClassification,
    });
    if (!remedyResult?.suggestedRemedies) {
      throw new Error('Could not generate remedies.');
    }

    return {
      classification: classificationResult.diseaseClassification,
      remedies: remedyResult.suggestedRemedies,
    };
  } catch (error) {
    console.error('An error occurred during analysis:', error);
    throw new Error('An unexpected error occurred during the analysis. Please try again.');
  }
}
