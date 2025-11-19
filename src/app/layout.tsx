import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})


export const metadata: Metadata = {
  title: 'SkinWise',
  description: 'AI-powered skin disease detection and remedy suggestion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased animated-gradient",
        fontSans.variable
      )}>
        <div className="min-h-screen bg-white/50 backdrop-blur-sm">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
