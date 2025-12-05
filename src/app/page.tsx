'use client';

import { useState } from 'react';
import type { analyzeSkinCondition } from './actions';
import { Logo } from '@/components/app/logo';
import UploadForm from '@/components/app/upload-form';
import LoadingIndicator from '@/components/app/loading-indicator';
import AnalysisResult from '@/components/app/analysis-result';
import ErrorDisplay from '@/components/app/error-display';
import { useToast } from '@/hooks/use-toast';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { LogOut } from 'lucide-react';


type AnalysisResultType = Awaited<ReturnType<typeof analyzeSkinCondition>>;
type AnalysisState = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  useAuthRedirect();
  const { auth } = useFirebase();

  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [imageData, setImageData] = useState<{
    previewUrl: string | null;
  }>({ previewUrl: null });
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalysisStart = () => {
    setAnalysisState('loading');
    setError(null);
    setResult(null);
  };
  
  const handleAnalysisSuccess = (res: AnalysisResultType, previewUrl: string) => {
    setResult(res);
    setImageData({ previewUrl });
    setAnalysisState('success');
  };

  const handleAnalysisError = (errorMessage: string) => {
    setError(errorMessage);
    setAnalysisState('error');
    toast({
      variant: "destructive",
      title: "Analysis Failed",
      description: errorMessage,
    });
  };

  const handleReset = () => {
    setAnalysisState('idle');
    setResult(null);
    setError(null);
    setImageData({ previewUrl: null });
  };
  
  const handleSignOut = async () => {
    await auth.signOut();
  };


  return (
    <div className="flex min-h-screen w-full flex-col items-center text-foreground">
      <header className="w-full border-b border-white/20">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Logo />
           <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-3xl space-y-8">
           {analysisState === 'idle' && (
            <UploadForm 
              onAnalysisStart={handleAnalysisStart}
              onAnalysisSuccess={handleAnalysisSuccess}
              onAnalysisError={handleAnalysisError}
            />
          )}
          {analysisState === 'loading' && <LoadingIndicator />}
          {analysisState === 'success' && result && (
            <AnalysisResult
              result={result}
              imagePreview={imageData.previewUrl}
              onReset={handleReset}
            />
          )}
          {analysisState === 'error' && <ErrorDisplay message={error} onReset={handleReset} />}
        </div>
      </main>
      <footer className="w-full py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-700">
          <p>
            SkinWise is an AI-powered tool and does not provide medical advice.
            Consult a healthcare professional for any health concerns.
          </p>
        </div>
      </footer>
    </div>
  );
}
