'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
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
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  return (
    <Card className="w-full transform transition-all duration-500 ease-in-out shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">Check Your Skin</CardTitle>
        <CardDescription>
          Upload a clear photo of a skin condition for an AI-powered analysis.
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

        {!imagePreview ? (
          <div
            className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background/50 text-muted-foreground transition-colors hover:border-primary hover:bg-accent/10"
            onClick={triggerFileSelect}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-primary" />
              <p className='font-medium'>Click to upload an image</p>
              <p className="text-xs">PNG, JPG, etc. up to 10MB</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-64">
             <Image
              src={imagePreview}
              alt="Selected skin image"
              fill
              className="rounded-lg object-cover"
            />
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button variant="secondary" onClick={triggerFileSelect}>Change Image</Button>
            </div>
          </div>
        )}

      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button
          onClick={handleAnalyzeClick}
          disabled={!imageFile || isAnalyzing}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
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
              Analyze My Skin
            </>
          )}
        </Button>
        {imagePreview && !isAnalyzing && (
            <Button
              onClick={handleRemoveImage}
              variant="link"
              className="text-muted-foreground"
            >
              Remove Image
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
