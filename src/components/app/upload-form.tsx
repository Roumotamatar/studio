'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Sparkles, X, ShieldAlert, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { classifyUploadedImage } from '@/ai/flows/classify-uploaded-image';
import { suggestRemedies } from '@/ai/flows/suggest-remedies-for-detected-condition';
import { assessSeverity } from '@/ai/flows/assess-severity';
import type { AnalysisResultType } from '@/app/page';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';


interface UploadFormProps {
  onAnalysisStart: () => void;
  onAnalysisSuccess: (result: AnalysisResultType, previewUrl: string) => void;
  onAnalysisError: (error: string) => void;
  canAnalyze: boolean;
  userData: { trialCount: number; hasPaid: boolean; } | null | undefined;
}

export default function UploadForm({ onAnalysisStart, onAnalysisSuccess, onAnalysisError, canAnalyze, userData }: UploadFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, firestore } = useFirebase();

  const resizeAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Could not get canvas context'));
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compress to 80% quality JPEG
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsAnalyzing(true); // Show feedback while processing
      try {
        const processedDataUrl = await resizeAndCompressImage(file);
        setImagePreview(processedDataUrl);
        // We don't need to store the original file anymore
        setImageFile(new File([], "processed.jpg")); 
      } catch (error) {
        console.error("Image processing error:", error);
        onAnalysisError("There was an error processing your image. Please try another one.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imagePreview || !user || !userData) return;
    
    if (!userData.hasPaid && userData.trialCount <= 0) {
      onAnalysisError('No trials remaining. Please upgrade to continue.');
      return;
    }

    setIsAnalyzing(true);
    onAnalysisStart();
    
    try {
      const classificationResult = await classifyUploadedImage({ photoDataUri: imagePreview });
      if (!classificationResult?.diseaseClassification) {
        throw new Error('Could not classify the image.');
      }
      
      const [remedyResult, severityResult] = await Promise.all([
        suggestRemedies({
          detectedCondition: classificationResult.diseaseClassification,
        }),
        assessSeverity({
            photoDataUri: imagePreview,
            condition: classificationResult.diseaseClassification,
        }),
      ]);

      if (!remedyResult) {
        throw new Error('Could not generate recommendations.');
      }

      if (!severityResult?.severity) {
        throw new Error('Could not assess severity.');
      }

      let remainingTrials = userData.trialCount;
      if (!userData.hasPaid) {
        remainingTrials--;
        const userRef = doc(firestore, 'users', user.uid);
        updateDocumentNonBlocking(userRef, {
          trialCount: remainingTrials,
        });
      }
      
      const result: AnalysisResultType = {
        classification: classificationResult.diseaseClassification,
        remedies: remedyResult.remedies,
        routine: remedyResult.routine,
        lifestyle: remedyResult.lifestyle,
        severity: severityResult.severity,
        remainingTrials,
      }

      onAnalysisSuccess(result, imagePreview);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      onAnalysisError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
       <Card className="w-full transform transition-all duration-700 ease-in-out shadow-lg bg-background/80 backdrop-blur-sm border-2 border-white animate-in fade-in-50 slide-in-from-bottom-5">
        <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-6">
            <p className="text-gray-600 text-left">
                Upload or take a clear photo of your skin concern. Make sure the area is well-lit, in focus, and centered in the frame. Please avoid pointing, drawing, or adding any marks to the image.
            </p>
            <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/bmp,image/tiff"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                disabled={isAnalyzing}
            />

            {imagePreview ? (
                <div className="relative w-full h-60 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                    <Image
                    src={imagePreview}
                    alt="Selected skin image"
                    fill
                    className="object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-4">
                    <Button variant="secondary" onClick={triggerFileSelect} disabled={isAnalyzing}>Change Photo</Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                    </Button>
                    </div>
                </div>
            ) : (
                <div
                    className={`group flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed  bg-gray-50/50 transition-colors ${canAnalyze ? 'cursor-pointer border-gray-300 hover:border-primary/50 hover:bg-primary/10' : 'cursor-not-allowed border-gray-200 bg-gray-100/50'}`}
                    onClick={canAnalyze ? triggerFileSelect : undefined}
                >
                    <div className="text-center space-y-2">
                        {canAnalyze ? (
                        <>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                                <Camera className="h-8 w-8" />
                            </div>
                            <div>
                                <p className='font-semibold text-base text-gray-700'>Press here to add/take a photo</p>
                            </div>
                        </>
                        ) : (
                        <div className="space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200">
                                <ShieldAlert className="h-8 w-8 text-gray-500" />
                            </div>
                            <div>
                                <p className='font-semibold text-base text-gray-600'>No Trials Remaining</p>
                                <p className="text-sm text-gray-500 mt-1">Please upgrade to a premium plan.</p>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            )}
            
            {!canAnalyze && !userData?.hasPaid && (
                <Button className="w-full" size="lg" onClick={() => alert('Payment system coming soon!')}>
                    <Zap className="mr-2 h-5 w-5" />
                    Upgrade to Premium
                </Button>
            )}
            
            <div className="flex items-center space-x-2">
                <Checkbox id="terms" checked={termsAgreed} onCheckedChange={(checked) => setTermsAgreed(checked as boolean)} />
                <Dialog>
                    <DialogTrigger asChild>
                        <Label htmlFor="terms" className="text-sm text-gray-600">
                            Check this box to indicate you have read and agree with our{' '}
                            <span className="text-primary hover:underline cursor-pointer">Terms & Conditions</span>
                        </Label>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-primary">Terms & Conditions for SkinWise</DialogTitle>
                             <p className="text-sm text-muted-foreground">Last Updated: 09-12-2025</p>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="prose prose-zinc max-w-none dark:prose-invert">
                                <p>Welcome to SkinWise (“we”, “our”, “the platform”, or “the service”). By accessing or using SkinWise, you (“user”, “you”, or “your”) agree to the following Terms & Conditions. Please read them carefully before proceeding. If you do not agree to any part of these Terms, you must discontinue using the service immediately.</p>

                                <h2>1. Nature of the Service</h2>
                                <p>1.1 SkinWise is an AI-powered skin image analysis tool designed to provide general informational insights based on the images you upload.</p>
                                <p>1.2 The service uses machine learning models, and any results generated are automated predictions, not verified by any certified medical professional.</p>
                                <p>1.3 SkinWise does NOT provide medical advice, diagnosis, treatment, prescriptions, or professional medical services of any kind.</p>

                                <h2>2. No Medical Advice Disclaimer</h2>
                                <p>2.1 All information provided by SkinWise—including disease likelihoods, possible conditions, and suggested remedies—is for informational and educational purposes only.</p>
                                <p>2.2 The AI results must not be considered a medical diagnosis.</p>
                                <p>2.3 You should always consult a licensed dermatologist, doctor, or medical professional for any concerns related to your skin, or well-being.</p>
                                <p>2.4 You understand that SkinWise does not hold any medical certifications, licenses, or permits, and is not legally authorized to practice medicine.</p>

                                <h2>3. User Responsibilities</h2>
                                <p>3.1 You agree that you are solely responsible for how you use the information provided by the platform.</p>
                                <p>3.2 You acknowledge that uploading images and relying on AI predictions is entirely at your own risk.</p>
                                <p>3.3 You agree that you will not use the service as a replacement for professional medical advice or for emergency situations.</p>
                                <p>3.4 You confirm that you are at least 18 years old or have parental/guardian consent to use the service.</p>

                                <h2>4. Accuracy and Limitations of AI</h2>
                                <p>4.1 AI technology may sometimes provide incorrect, incomplete, or misleading information.</p>
                                <p>4.2 Factors such as lighting, image quality, angle, skin tone, and camera resolution may affect analysis results.</p>
                                <p>4.3 SkinWise makes no guarantees regarding the accuracy, reliability, completeness, or timeliness of AI-generated results.</p>
                                <p>4.4 The AI may fail to identify serious conditions, including but not limited to infections, skin cancers, allergic reactions, or chronic medical issues.</p>
                                <p>4.5 You accept that the AI might suggest conditions that are not applicable to you.</p>

                                <h2>5. Limitation of Liability</h2>
                                <p>5.1 SkinWise, its owners, developers, team members, and affiliates are not liable for:</p>
                                <ul>
                                    <li>Any personal injury,</li>
                                    <li>Missed or delayed diagnosis,</li>
                                    <li>Emotional distress,</li>
                                    <li>Loss of health,</li>
                                    <li>Medical complications,</li>
                                    <li>Financial loss,</li>
                                    <li>Misinterpretation of AI results.</li>
                                </ul>
                                <p>5.2 By using the service, you agree that SkinWise is not responsible for any decisions you make after receiving AI-generated information.</p>
                                <p>5.3 Under no circumstances will SkinWise be liable for any direct, indirect, incidental, special, or consequential damages arising out of your use of the platform.</p>

                                <h2>6. Not a Substitute for Professional Care</h2>
                                <p>6.1 Always consult a doctor for:</p>
                                <ul>
                                    <li>Persistent symptoms</li>
                                    <li>Emergency conditions</li>
                                    <li>Skin infections</li>
                                    <li>Suspicious moles</li>
                                    <li>Severe allergies</li>
                                    <li>Rash spreading</li>
                                    <li>Pain, bleeding, fever, or inflammation</li>
                                </ul>
                                <p>6.2 If you think you may have a medical emergency, contact your nearest hospital or emergency services immediately.</p>

                                <h2>7. User Data & Privacy</h2>
                                <p>7.1 SkinWise may collect and process uploaded skin images solely for analysis and service improvement.</p>
                                <p>7.2 Your images may be stored temporarily or permanently depending on system requirements.</p>
                                <p>7.3 We do not sell your images or personal data to third parties for marketing purposes.</p>
                                <p>7.4 By uploading images, you grant SkinWise permission to use them for:</p>
                                <ul>
                                    <li>AI processing</li>
                                    <li>Model improvement</li>
                                    <li>Research and analysis (non-identifiable)</li>
                                </ul>
                                <p>7.5 You are responsible for ensuring that uploaded images belong to you or that you have permission to upload them.</p>

                                <h2>8. User Conduct</h2>
                                <p>You agree that you will not:</p>
                                <ul>
                                    <li>Upload images of others without consent,</li>
                                    <li>Upload explicit, abusive, or inappropriate content,</li>
                                    <li>Use the service for unlawful or harmful purposes,</li>
                                    <li>Attempt to reverse-engineer the platform.</li>
                                </ul>

                                <h2>9. Service Changes and Updates</h2>
                                <p>9.1 SkinWise may modify, update, suspend, or discontinue parts of or the entire service at any time without prior notice.</p>
                                <p>9.2 Continued use after changes means you accept the updated Terms.</p>

                                <h2>10. Termination of Use</h2>
                                <p>We reserve the right to suspend or terminate access to the service if we detect misuse, violation of policies, unauthorized activity, or any harmful behavior.</p>

                                <h2>11. No Guarantee of Availability</h2>
                                <p>11.1 SkinWise does not guarantee continuous, uninterrupted access to the platform.</p>
                                <p>11.2 Technical issues, upgrades, or external factors may cause service downtime.</p>

                                <h2>12. Consent</h2>
                                <p>By checking the “I Agree” box or using SkinWise, you confirm that:</p>
                                <ul>
                                    <li>You fully understand the nature of the service,</li>
                                    <li>You accept that this is an AI tool, not a medical service,</li>
                                    <li>You voluntarily assume all risks associated with the use of the platform.</li>
                                </ul>

                                <h2>13. Governing Law</h2>
                                <p>These Terms & Conditions are governed by the laws of India, without regard to conflict of law principles.</p>
                            </div>
                        </ScrollArea>
                         <DialogFooter>
                            <DialogClose asChild>
                                <Button>Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Button
                onClick={handleAnalyzeClick}
                disabled={!imagePreview || isAnalyzing || !canAnalyze || !termsAgreed}
                className="w-full text-lg font-bold bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white shadow-lg disabled:bg-gray-400 disabled:shadow-none"
                size="lg"
            >
                {isAnalyzing ? (
                <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Analyzing...
                </>
                ) : (
                <>
                    <Sparkles className="mr-3 h-6 w-6" />
                    Analyze My Skin
                </>
                )}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
