import { Loader2 } from 'lucide-react';

export default function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-card p-8 shadow-sm animate-in fade-in-50 duration-500">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <div className="text-center">
        <h2 className="text-xl font-semibold font-headline">Analyzing Image...</h2>
        <p className="text-muted-foreground">Our AI is examining your photo. This may take a moment.</p>
      </div>
    </div>
  );
}
