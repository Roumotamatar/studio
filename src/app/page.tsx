'use client';

import { useState } from 'react';
import { Logo } from '@/components/app/logo';
import UploadForm from '@/components/app/upload-form';
import LoadingIndicator from '@/components/app/loading-indicator';
import AnalysisResult from '@/components/app/analysis-result';
import ErrorDisplay from '@/components/app/error-display';
import { useToast } from '@/hooks/use-toast';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { Button } from '@/components/ui/button';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { LogOut } from 'lucide-react';
import { doc } from 'firebase/firestore';


export interface AnalysisResultType {
  classification: string;
  remedies: string;
  remainingTrials: number;
};
type AnalysisState = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  useAuthRedirect();
  const { auth, user, firestore } = useFirebase();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData } = useDoc<{ trialCount: number; hasPaid: boolean }>(userDocRef);

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

  const remainingTrials = userData?.trialCount ?? 0;
  const hasPaid = userData?.hasPaid ?? false;
  const canAnalyze = hasPaid || remainingTrials > 0;

  return (
    <div className="flex min-h-screen w-full flex-col items-center text-foreground">
      <header className="w-full border-b border-white/20">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Logo />
           <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground/80">
              {hasPaid ? 'Premium Member' : `Trials left: ${remainingTrials}`}
            </span>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-3xl space-y-8">
           {analysisState === 'idle' && (
            <>
              <div className="text-center">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl">Check Your Skin Instantly <br /> with AI Skin Image Search&trade;</h1>
                  <p className="mt-4 text-lg text-gray-600">
                    Enjoy 3 free tries, then unlock full access for only <span className="font-bold text-primary">$1.29</span>
                  </p>
              </div>
              <UploadForm 
                onAnalysisStart={handleAnalysisStart}
                onAnalysisSuccess={handleAnalysisSuccess}
                onAnalysisError={handleAnalysisError}
                canAnalyze={canAnalyze}
                userData={userData}
              />
            </>
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
