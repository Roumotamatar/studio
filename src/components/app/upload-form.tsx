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
import type { AnalysisResultType } from '@/app/page';


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

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.size > 16 * 1024 * 1024) {
        onAnalysisError("Image size cannot exceed 16MB.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imageFile || !imagePreview || !user || !userData) return;
    
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

      const remedyResult = await suggestRemedies({
        detectedCondition: classificationResult.diseaseClassification,
      });
      if (!remedyResult?.suggestedRemedies) {
        throw new Error('Could not generate remedies.');
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
        remedies: remedyResult.suggestedRemedies,
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
                <Label htmlFor="terms" className="text-sm text-gray-600">
                    Check this box to indicate you have read and agree with our <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms & Conditions</a>
                </Label>
            </div>

            <Button
                onClick={handleAnalyzeClick}
                disabled={!imageFile || isAnalyzing || !canAnalyze || !termsAgreed}
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
