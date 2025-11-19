'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Sparkles, Image as ImageIcon, X, Info, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { analyzeSkinCondition } from '@/app/actions';
import type { analyzeSkinCondition as analyzeSkinConditionType } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
       <Card className="w-full transform transition-all duration-700 ease-in-out shadow-2xl bg-background/80 backdrop-blur-sm border-2 border-white animate-in fade-in-50 slide-in-from-bottom-5">
        <CardContent className="p-6 space-y-4">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/bmp,image/tiff"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative w-full h-80 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                <Image
                  src={imagePreview}
                  alt="Selected skin image"
                  fill
                  className="object-contain"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-4">
                  <Button variant="secondary" onClick={triggerFileSelect}>Change Image</Button>
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
              className="group flex h-80 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 transition-colors hover:border-accent/50 hover:bg-accent/10"
              onClick={triggerFileSelect}
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg group-hover:scale-110 transition-transform">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <div>
                    <p className='font-semibold text-lg text-gray-700'>Drop your image here, or click to browse</p>
                    <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG, GIF, BMP, TIFF up to 16MB</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center items-center gap-3 pt-2">
            <Badge variant="secondary" className="bg-teal-100 text-teal-800 border-teal-200">Clear photos work best</Badge>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">High contrast preferred</Badge>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleAnalyzeClick}
        disabled={!imageFile || isAnalyzing}
        className="w-full text-lg font-bold bg-gradient-to-r from-accent to-orange-400 hover:from-accent/90 hover:to-orange-400/90 text-white shadow-lg"
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

      <Alert className="bg-blue-50 border-blue-200 text-blue-800">
        <Lightbulb className="h-4 w-4 !text-blue-500" />
        <AlertTitle className="font-semibold">Tips for Best Results</AlertTitle>
        <AlertDescription className="text-sm">
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Use a clear, well-lit photo.</li>
            <li>Ensure the skin area is in focus.</li>
            <li>Avoid blurry or distant images.</li>
            <li>Capture the entire area of concern.</li>
          </ul>
        </AlertDescription>
      </Alert>

    </div>
  );
}
