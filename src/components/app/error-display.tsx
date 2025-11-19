import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorDisplayProps {
  message: string | null;
  onReset: () => void;
}

export default function ErrorDisplay({ message, onReset }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-destructive/10 border border-destructive/20 p-8 text-destructive shadow-sm animate-in fade-in-50 duration-500">
      <AlertTriangle className="h-12 w-12" />
      <div className="text-center">
        <h2 className="text-xl font-semibold font-headline">Analysis Failed</h2>
        <p className="text-destructive/80">
          {message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      <Button onClick={onReset} variant="destructive" className="bg-destructive text-destructive-foreground">
        <RefreshCcw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
