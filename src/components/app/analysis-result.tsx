'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ListChecks, RefreshCcw } from 'lucide-react';
import type { analyzeSkinCondition } from '@/app/actions';

interface AnalysisResultProps {
  result: Awaited<ReturnType<typeof analyzeSkinCondition>>;
  imagePreview: string | null;
  onReset: () => void;
}

const formatRemedies = (remedies: string) => {
  return remedies
    .split('\n')
    .map(line => line.trim().replace(/^-|^\*/, '').trim())
    .filter(line => line.length > 0);
};

export default function AnalysisResult({ result, imagePreview, onReset }: AnalysisResultProps) {
  const remediesList = formatRemedies(result.remedies);

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Analysis Complete</CardTitle>
        <CardDescription>Here are the results from our AI analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {imagePreview && (
          <div className="overflow-hidden rounded-lg border">
            <Image
              src={imagePreview}
              alt="Analyzed skin image"
              width={500}
              height={500}
              className="h-auto w-full object-contain"
            />
          </div>
        )}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Detected Condition</h3>
            <p className="text-lg font-semibold text-primary">{result.classification}</p>
          </div>
          <Separator />
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Suggested Remedies</h3>
            <ul className="space-y-2">
              {remediesList.map((remedy, index) => (
                <li key={index} className="flex items-start gap-3">
                  <ListChecks className="mt-1 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-left">{remedy}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Alert variant="default" className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-300">Important Disclaimer</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            This AI analysis is for informational purposes only and is not a substitute for professional medical advice. Please consult a qualified healthcare provider for an accurate diagnosis and treatment plan.
          </AlertDescription>
        </Alert>

      </CardContent>
      <CardFooter>
        <Button onClick={onReset} className="w-full" variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Start New Analysis
        </Button>
      </CardFooter>
    </Card>
  );
}
