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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCcw, Info, Sparkles, Pill, Shield, Thermometer, Sun, Moon, Utensils } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisResultType } from '@/app/page';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import FollowUpChat from './follow-up-chat';
import ProductChecker from './product-checker';

interface AnalysisResultProps {
  result: AnalysisResultType;
  imagePreview: string | null;
  onReset: () => void;
}

const severityStyles = {
  Mild: "bg-green-100 text-green-800 border-green-200",
  Moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Severe: "bg-red-100 text-red-800 border-red-200",
}

export default function AnalysisResult({ result, imagePreview, onReset }: AnalysisResultProps) {

  return (
    <Card className="w-full max-w-3xl animate-in fade-in-50 slide-in-from-bottom-5 duration-700 shadow-2xl bg-background/80 backdrop-blur-sm border-2 border-white">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent to-orange-400">Analysis Complete</CardTitle>
        <CardDescription>Here are the results from our AI analysis. You have {result.remainingTrials} trials remaining.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-primary/10 rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Info className="mr-2 h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="remedies" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Sparkles className="mr-2 h-4 w-4" />Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {imagePreview && (
                <div className="overflow-hidden rounded-xl border-4 border-white shadow-2xl">
                  <Image
                    src={imagePreview}
                    alt="Analyzed skin image"
                    width={600}
                    height={400}
                    className="h-auto w-full object-contain"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-6 text-center shadow-inner">
                    <h3 className="text-base font-medium text-muted-foreground flex items-center justify-center gap-2"><Shield className="h-4 w-4"/>Detected Condition</h3>
                    <p className="text-3xl font-bold text-primary">{result.classification}</p>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-6 text-center shadow-inner">
                    <h3 className="text-base font-medium text-muted-foreground flex items-center justify-center gap-2"><Thermometer className="h-4 w-4"/>Assessed Severity</h3>
                    <div className="text-3xl font-bold text-primary">
                        <Badge className={cn("text-2xl px-4 py-1", severityStyles[result.severity])}>
                            {result.severity}
                        </Badge>
                    </div>
                  </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="remedies" className="mt-6 space-y-8">
             <div className="space-y-4 text-left">
              <h3 className="mb-4 text-2xl font-semibold text-foreground text-center">Suggested Remedies</h3>
                <div className="flex flex-col gap-4">
                  {result.remedies.map((remedy, index) => (
                    <Card key={index} className="bg-white/70">
                      <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
                        <div className="p-2 bg-accent/20 rounded-full">
                           <Pill className="h-5 w-5 text-accent" />
                        </div>
                        <CardTitle className="text-lg">{remedy.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-foreground/80">
                        {remedy.description || "No further details provided."}
                      </CardContent>
                    </Card>
                  ))}
                </div>
            </div>
            
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-foreground text-center">Daily Routine</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="flex items-center gap-2 font-semibold text-lg text-primary"><Sun className="h-5 w-5 text-orange-400"/>Morning (AM)</h4>
                        <ul className="space-y-2 list-disc list-inside text-foreground/80">
                            {result.routine.am.map((step, index) => <li key={`am-${index}`}>{step}</li>)}
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <h4 className="flex items-center gap-2 font-semibold text-lg text-primary"><Moon className="h-5 w-5 text-blue-400"/>Evening (PM)</h4>
                         <ul className="space-y-2 list-disc list-inside text-foreground/80">
                            {result.routine.pm.map((step, index) => <li key={`pm-${index}`}>{step}</li>)}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4 text-left">
              <h3 className="mb-4 text-2xl font-semibold text-foreground text-center">Diet & Lifestyle Tips</h3>
                <div className="flex flex-col gap-4">
                  {result.lifestyle.map((tip, index) => (
                    <Card key={index} className="bg-white/70">
                      <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
                        <div className="p-2 bg-green-500/20 rounded-full">
                           <Utensils className="h-5 w-5 text-green-600" />
                        </div>
                        <CardTitle className="text-lg">{tip.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-foreground/80">
                        {tip.description || "No further details provided."}
                      </CardContent>
                    </Card>
                  ))}
                </div>
            </div>

            <ProductChecker diagnosedCondition={result.classification} />
          </TabsContent>
        </Tabs>
        
        <FollowUpChat analysisResult={result} />

        <Alert variant="default" className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertTriangle className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-300">Important Disclaimer</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            This AI analysis is for informational purposes only and is not a substitute for professional medical advice. Please consult a qualified healthcare provider for an accurate diagnosis and treatment plan.
          </AlertDescription>
        </Alert>

      </CardContent>
      <CardFooter>
        <Button onClick={onReset} className="w-full text-lg" variant="outline" size="lg">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Start New Analysis
        </Button>
      </CardFooter>
    </Card>
  );
}
