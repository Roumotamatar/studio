import { Stethoscope } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <div className="bg-primary/10 p-2 rounded-lg">
        <Stethoscope className="h-6 w-6 text-primary" />
      </div>
      <span className="text-xl font-bold text-foreground">SkinWise</span>
    </div>
  );
}
