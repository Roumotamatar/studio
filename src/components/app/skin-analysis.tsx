'use client';

import { useState } from 'react';
import UploadForm from '@/components/app/upload-form';
import LoadingIndicator from '@/components/app/loading-indicator';
import AnalysisResult from '@/components/app/analysis-result';
import ErrorDisplay from '@/components/app/error-display';
import { useToast } from '@/hooks/use-toast';

export interface AnalysisResultType {
  classification: string;
  remedies: string;
  remainingTrials: number;
  severity: 'Mild' | 'Moderate' | 'Severe';
};
type AnalysisState = 'idle' | 'loading' | 'success' | 'error';

interface SkinAnalysisProps {
    userData: { trialCount: number; hasPaid: boolean; } | null | undefined;
}

export default function SkinAnalysis({ userData }: SkinAnalysisProps) {
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
  
  const canAnalyze = userData?.hasPaid || (userData?.trialCount ?? 0) > 0;

  return (
    <div className="w-full max-w-3xl space-y-8 mx-auto">
        {analysisState === 'idle' && (
        <>
            <p className="mt-4 text-lg text-gray-600">
                Got a skin concern? Upload a photo for an AI-powered analysis. <br/>
                Enjoy 3 free tries, then unlock full access for only <span className="font-bold text-primary">$1.29</span>
            </p>
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
  );
}
