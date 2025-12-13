'use client';

import { useState } from 'react';
import { Logo } from '@/components/app/logo';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { Button } from '@/components/ui/button';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { LogOut, MailCheck, Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import UploadForm from '@/components/app/upload-form';
import LoadingIndicator from '@/components/app/loading-indicator';
import AnalysisResult from '@/components/app/analysis-result';
import ErrorDisplay from '@/components/app/error-display';

export interface AnalysisResultType {
  classification: string;
  remedies: string;
  remainingTrials: number;
  severity: 'Mild' | 'Moderate' | 'Severe';
};

type AnalysisState = 'idle' | 'loading' | 'success' | 'error';


const VerifyEmailScreen = () => {
  const { auth, user } = useFirebase();
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResendVerification = async () => {
    if (!user) return;
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Verification Email Sent',
        description: 'A new verification link has been sent to your email address.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send verification email. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md text-center shadow-2xl bg-background/80 backdrop-blur-sm border-2 border-white">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="h-8 w-8" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <strong>{user?.email}</strong>. Please check your inbox (and spam folder) to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive an email?
          </p>
          <Button onClick={handleResendVerification} disabled={isResending} className="w-full">
            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resend Verification Link
          </Button>
           <Button variant="ghost" onClick={() => auth.signOut()} className="w-full">
            Use a different account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};


export default function Home() {
  useAuthRedirect();
  const { auth, user, firestore, isUserLoading } = useFirebase();
  const { toast } = useToast();
  
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [imageData, setImageData] = useState<{
    previewUrl: string | null;
  }>({ previewUrl: null });
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData } = useDoc<{ trialCount: number; hasPaid: boolean }>(userDocRef);

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
  
  const canAnalyze = userData?.hasPaid || (userData?.trialCount ?? 0) > 0;

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in but email is not verified (and not a Google user), show verification screen
  if (user && !user.emailVerified && user.providerData.some(p => p.providerId === 'password')) {
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
        <main className="flex flex-1 flex-col items-center justify-center p-4 text-center w-full">
           <VerifyEmailScreen />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center text-foreground">
      <header className="w-full border-b border-white/20">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Logo />
           <div className="flex items-center gap-4">
              {userData && (
                <span className="text-sm font-medium text-foreground/80">
                  {userData.hasPaid ? 'Premium Member' : `Trials left: ${userData.trialCount}`}
                </span>
              )}
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center w-full">
        <div className="w-full max-w-3xl space-y-8">
           {analysisState === 'idle' && (
              <>
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl">Your Personal AI Health Assistant</h1>
                    <p className="mt-4 text-lg text-gray-600">
                      Got a skin concern? Upload a photo for an AI-powered analysis. <br/>
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
