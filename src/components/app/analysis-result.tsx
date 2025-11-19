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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCcw, Info, Sparkles, Pill } from 'lucide-react';
import type { analyzeSkinCondition } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AnalysisResultProps {
  result: Awaited<ReturnType<typeof analyzeSkinCondition>>;
  imagePreview: string | null;
  onReset: () => void;
}

const formatRemedies = (remedies: string) => {
  // Handles lists that are newline-separated, and may or may not have '-', '*', or '1.' prefixes.
  return remedies
    .split('\n')
    .map(line => line.trim().replace(/^(-|\*|\d+\.)/, '').trim())
    .filter(line => line.length > 0)
    .map(line => {
      const [title, ...descriptionParts] = line.split(':');
      const description = descriptionParts.join(':').trim();
      return { title: title.trim(), description };
    });
};

export default function AnalysisResult({ result, imagePreview, onReset }: AnalysisResultProps) {
  const remediesList = formatRemedies(result.remedies);

  return (
    <Card className="w-full animate-in fade-in-50 slide-in-from-bottom-5 duration-700 shadow-2xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">Analysis Complete</CardTitle>
        <CardDescription>Here are the results from our AI analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-primary/10">
            <TabsTrigger value="overview"><Info className="mr-2 h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="remedies"><Sparkles className="mr-2 h-4 w-4" />Remedies</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {imagePreview && (
                <div className="overflow-hidden rounded-lg border-2 border-primary/20 shadow-lg">
                  <Image
                    src={imagePreview}
                    alt="Analyzed skin image"
                    width={500}
                    height={500}
                    className="h-auto w-full object-contain"
                  />
                </div>
              )}
              <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 p-4 text-center shadow-inner">
                <h3 className="text-sm font-medium text-muted-foreground">Detected Condition</h3>
                <p className="text-2xl font-bold text-primary">{result.classification}</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="remedies" className="mt-6">
             <div className="space-y-4 text-left">
              <h3 className="mb-4 text-xl font-semibold text-foreground text-center">Suggested Remedies</h3>
                <Accordion type="single" collapsible className="w-full">
                {remediesList.map((remedy, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <Pill className="h-5 w-5 text-accent" />
                        <span className="font-semibold">{remedy.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-10 text-foreground/80">
                      {remedy.description || "No further details provided."}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>

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
