'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Camera, Sparkles, X, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { checkProductSuitability, CheckProductSuitabilityOutput } from '@/ai/flows/check-product-suitability';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface ProductCheckerProps {
    diagnosedCondition: string;
}

type AnalysisState = 'idle' | 'loading' | 'success' | 'error';


const ResultDisplay = ({ result, onReset }: { result: CheckProductSuitabilityOutput; onReset: () => void }) => {
    return (
        <div className="w-full space-y-4 animate-in fade-in-50 duration-500">
            <Card className={cn("border-2", result.isGoodMatch ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50")}>
                <CardHeader className="text-center">
                    <CardTitle className={cn("flex items-center justify-center gap-2 text-2xl", result.isGoodMatch ? "text-green-700" : "text-red-700")}>
                        {result.isGoodMatch ? <ThumbsUp /> : <ThumbsDown />}
                        {result.isGoodMatch ? "Good Match!" : "Not a Good Match"}
                    </CardTitle>
                    <CardDescription className={cn(result.isGoodMatch ? "text-green-600" : "text-red-600")}>
                        {result.summary}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full">
                        {result.ingredientAnalyses.map((ing, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-left hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        {ing.isHarmful ? <AlertCircle className="h-5 w-5 text-destructive" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
                                        <span className="font-medium">{ing.name}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-muted-foreground">{ing.reason}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
            <Button onClick={onReset} variant="outline" className="w-full">Check another product</Button>
        </div>
    );
};


export default function ProductChecker({ diagnosedCondition }: ProductCheckerProps) {
    const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [result, setResult] = useState<CheckProductSuitabilityOutput | null>(null);
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
                setAnalysisState('idle'); // Ready to analyze
            } catch (e) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to process image.' });
            }
        }
    };

    const handleAnalyzeClick = async () => {
        if (!imagePreview) return;
        setAnalysisState('loading');
        setResult(null);
        try {
            const analysisResult = await checkProductSuitability({
                diagnosedCondition,
                productIngredientsImageUri: imagePreview
            });
            setResult(analysisResult);
            setAnalysisState('success');
        } catch (e: any) {
            const msg = 'Failed to analyze ingredients. The AI may not have been able to read the text. Please try a clearer image.';
            setAnalysisState('error');
            toast({ variant: 'destructive', title: 'Analysis Failed', description: msg });
        }
    };

    const handleReset = () => {
        setAnalysisState('idle');
        setImagePreview(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-semibold text-foreground">Check Your Product</CardTitle>
                <CardDescription>Is your skincare product a good fit? Upload its ingredients to find out.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {analysisState === 'loading' && (
                    <div className="flex flex-col items-center justify-center gap-2 text-primary">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Checking product...</p>
                    </div>
                )}

                {analysisState === 'success' && result && (
                    <ResultDisplay result={result} onReset={handleReset} />
                )}

                {analysisState !== 'loading' && analysisState !== 'success' && (
                     <>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        {imagePreview ? (
                            <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-white shadow-md">
                                <Image
                                    src={imagePreview}
                                    alt="Ingredient list preview"
                                    fill
                                    className="object-contain"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-4">
                                    <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>Change</Button>
                                    <Button size="sm" variant="destructive" onClick={handleReset}><X className="mr-1 h-4 w-4" />Remove</Button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="group flex h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 transition-colors cursor-pointer hover:border-primary/50 hover:bg-primary/10"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="text-center space-y-2">
                                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                                        <Camera className="h-6 w-6" />
                                    </div>
                                    <p className='font-medium text-sm text-gray-600'>Upload Ingredient Photo</p>
                                </div>
                            </div>
                        )}
                        <Button
                            onClick={handleAnalyzeClick}
                            disabled={!imagePreview}
                            className="w-full"
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Check Suitability
                        </Button>
                        {analysisState === 'error' && (
                            <p className="text-sm text-destructive text-center">Analysis failed. Please try again with a clearer image.</p>
                        )}
                    </>
                )}

            </CardContent>
        </Card>
    );
}
