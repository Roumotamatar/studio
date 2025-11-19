import { Stethoscope } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <Stethoscope className="h-7 w-7" />
      <span className="text-xl font-bold text-foreground">SkinWise</span>
    </div>
  );
}
