'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { analyzeSkinCondition } from '@/app/actions';
import type { analyzeSkinCondition as analyzeSkinConditionType } from '@/app/actions';

interface UploadFormProps {
  onAnalysisStart: () => void;
  onAnalysisSuccess: (result: Awaited<ReturnType<typeof analyzeSkinConditionType>>, previewUrl: string) => void;
  onAnalysisError: (error: string) => void;
}

export default function UploadForm({ onAnalysisStart, onAnalysisSuccess, onAnalysisError }: UploadFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imageFile || !imagePreview) return;

    setIsAnalyzing(true);
    onAnalysisStart();
    
    try {
      const result = await analyzeSkinCondition(imagePreview);
      onAnalysisSuccess(result, imagePreview);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      onAnalysisError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <Card className="w-full transform transition-all duration-500 ease-in-out">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Check Your Skin</CardTitle>
        <CardDescription>
          Upload a photo of a skin condition for an AI-powered analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <div
          className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background/50 text-muted-foreground transition-colors hover:border-primary hover:bg-accent/10"
          onClick={triggerFileSelect}
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Selected skin image"
              width={256}
              height={256}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10" />
              <p>Click to upload an image</p>
              <p className="text-xs">PNG, JPG, etc.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleAnalyzeClick}
          disabled={!imageFile || isAnalyzing}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Analyze
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
