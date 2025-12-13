'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Sparkles, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { analyzeIngredients, AnalyzeIngredientsOutput } from '@/ai/flows/analyze-ingredients';
import { useToast } from '@/hooks/use-toast';
import LoadingIndicator from './loading-indicator';
import ErrorDisplay from './error-display';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type IngredientAnalysisState = 'idle' | 'loading' | 'success' | 'error';


const IngredientResultDisplay = ({ result, imagePreview, onReset }: { result: AnalyzeIngredientsOutput; imagePreview: string | null; onReset: () => void }) => {
  return (
    <Card className="w-full animate-in fade-in-50 slide-in-from-bottom-5 duration-700 shadow-2xl bg-background/80 backdrop-blur-sm border-2 border-white">
        <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-accent to-orange-400">Ingredient Analysis Complete</CardTitle>
            {imagePreview && (
                <div className="pt-4">
                    <Image
                        src={imagePreview}
                        alt="Ingredient list"
                        width={600}
                        height={400}
                        className="rounded-lg object-contain max-h-48 w-full"
                    />
                </div>
            )}
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg mb-2">AI Summary</h3>
                <p className="text-muted-foreground bg-primary/5 p-3 rounded-md border border-primary/20">{result.summary}</p>
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-2">Full Ingredient List</h3>
                <Accordion type="multiple" className="w-full">
                    {result.ingredients.map((ing, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-left hover:no-underline">
                                <div className="flex items-center gap-2">
                                    {ing.isBad ? <AlertCircle className="h-5 w-5 text-destructive" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
                                    <span className="font-medium">{ing.name}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <Badge variant="outline">{ing.description}</Badge>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={onReset} variant="outline" className="w-full">Analyze Another Product</Button>
        </CardFooter>
    </Card>
  );
};


export default function IngredientAnalysis() {
  const [analysisState, setAnalysisState] = useState<IngredientAnalysisState>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeIngredientsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Could not get canvas context');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await resizeImage(file);
        setImagePreview(dataUrl);
      } catch (e) {
        setError('Failed to process image.');
        setAnalysisState('error');
      }
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imagePreview) return;
    setAnalysisState('loading');
    setError(null);
    try {
      const analysisResult = await analyzeIngredients({ photoDataUri: imagePreview });
      setResult(analysisResult);
      setAnalysisState('success');
    } catch (e: any) {
      const msg = 'Failed to analyze ingredients. The AI may not have been able to read the text. Please try a clearer image.';
      setError(msg);
      setAnalysisState('error');
      toast({ variant: 'destructive', title: 'Analysis Failed', description: msg });
    }
  };

  const handleReset = () => {
    setAnalysisState('idle');
    setImagePreview(null);
    setResult(null);
    setError(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };
  
  if (analysisState === 'loading') return <LoadingIndicator />;
  if (analysisState === 'error' && error) return <ErrorDisplay message={error} onReset={handleReset} />;
  if (analysisState === 'success' && result) return <IngredientResultDisplay result={result} imagePreview={imagePreview} onReset={handleReset} />;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
        <p className="mt-4 text-lg text-gray-600">
            Take a clear, well-lit photo of a product's ingredient list to get an AI-powered breakdown.
        </p>
        <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
        />
        {imagePreview ? (
            <div className="relative w-full h-60 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                <Image
                src={imagePreview}
                alt="Ingredient list preview"
                fill
                className="object-contain"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-4">
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
                    <Button variant="destructive" size="sm" onClick={() => setImagePreview(null)}><X className="mr-2 h-4 w-4" />Remove</Button>
                </div>
            </div>
        ) : (
            <div
                className="group flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 transition-colors cursor-pointer hover:border-primary/50 hover:bg-primary/10"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                        <Camera className="h-8 w-8" />
                    </div>
                     <p className='font-semibold text-base text-gray-700'>Press here to add/take a photo</p>
                </div>
            </div>
        )}
        <Button
            onClick={handleAnalyzeClick}
            disabled={!imagePreview}
            className="w-full text-lg font-bold"
            size="lg"
        >
            <Sparkles className="mr-3 h-6 w-6" />
            Analyze Ingredients
        </Button>
    </div>
  );
}