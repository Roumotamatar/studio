'use server';

import { classifyUploadedImage } from '@/ai/flows/classify-uploaded-image';
import { suggestRemedies } from '@/ai/flows/suggest-remedies-for-detected-condition';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';
import { firebaseConfig } from '@/firebase/config';

if (getApps().length === 0) {
  initializeApp({
    ...firebaseConfig,
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
  });
}

export async function analyzeSkinCondition(photoDataUri: string) {
  const auth = getAuth();
  const token = await auth.verifyIdToken(photoDataUri.split(';')[2]); // This is a temporary workaround to pass the id token
  const uid = token.uid;

  if (!uid) {
    throw new Error('User is not authenticated.');
  }
  
  if (!photoDataUri) {
    throw new Error('Image data is missing.');
  }

  const firestore = getFirestore();
  const userRef = doc(firestore, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error('User profile not found.');
  }

  const userData = userDoc.data();
  const hasPaid = userData.hasPaid || false;
  let remainingTrials = userData.trialCount || 0;

  if (!hasPaid && remainingTrials <= 0) {
    throw new Error('No trials remaining. Please upgrade to continue.');
  }

  try {
    const classificationResult = await classifyUploadedImage({ photoDataUri: photoDataUri.split(';')[0] + ';' + photoDataUri.split(';')[1] });
    if (!classificationResult?.diseaseClassification) {
      throw new Error('Could not classify the image.');
    }

    const remedyResult = await suggestRemedies({
      detectedCondition: classificationResult.diseaseClassification,
    });
    if (!remedyResult?.suggestedRemedies) {
      throw new Error('Could not generate remedies.');
    }

    if (!hasPaid) {
      remainingTrials--;
    }

    return {
      classification: classificationResult.diseaseClassification,
      remedies: remedyResult.suggestedRemedies,
      remainingTrials,
    };
  } catch (error) {
    console.error('An error occurred during analysis:', error);
    throw new Error('An unexpected error occurred during the analysis. Please try again.');
  }
}
