'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/app/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { 
  initiateEmailSignUp,
  initiateEmailSignIn,
  initiateGoogleSignIn,
} from '@/firebase/non-blocking-login';
import { FirebaseError } from 'firebase/app';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.921,35.619,44,29.566,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { auth, isUserLoading, user } = useFirebase();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleAuthError = (error: FirebaseError, googleSignIn = false) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password.';
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists.';
        break;
      case 'auth/weak-password':
        errorMessage = 'The password is too weak.';
        break;
      case 'auth/account-exists-with-different-credential':
        errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
        break;
      case 'auth/popup-closed-by-user':
          errorMessage = 'The sign-in window was closed. Please try again.';
          break;
    }
    
    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description: errorMessage,
    });

    if (googleSignIn) {
      setIsGoogleLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const handleEmailAuthAction = (action: 'signIn' | 'signUp', data: FormValues) => {
    setIsLoading(true);
    
    const onSignInSuccess = () => {
      // No toast on sign-in, redirect is handled by useEffect
      setIsLoading(false);
    };

    const onSignUpSuccess = () => {
      toast({
        title: 'Success!',
        description: `Sign up successful, please sign in now`,
      });
      auth.signOut(); 
      setIsLoading(false);
    };

    if (action === 'signIn') {
      initiateEmailSignIn(auth, data.email, data.password, onSignInSuccess, (err) => handleAuthError(err));
    } else {
      initiateEmailSignUp(auth, data.email, data.password, onSignUpSuccess, (err) => handleAuthError(err));
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    const onSuccess = () => {
      // Redirect is handled by the useEffect
      setIsGoogleLoading(false);
    };
    initiateGoogleSignIn(auth, onSuccess, (err) => handleAuthError(err, true));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
       <div className="absolute top-8 left-8">
          <Logo />
        </div>
      <Card className="w-full max-w-md shadow-2xl bg-background/80 backdrop-blur-sm border-2 border-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent to-orange-400">
            Welcome to SkinWise
          </CardTitle>
          <CardDescription>
            Your personal AI-powered skin health assistant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-primary/10 rounded-lg">
              <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
              </TabsTrigger>
            </TabsList>
            <Form {...form}>
              <form>
                <TabsContent value="signin" className="mt-6 space-y-4">
                   <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email here" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      className="w-full" 
                      disabled={isLoading || isGoogleLoading}
                      onClick={form.handleSubmit((data) => handleEmailAuthAction('signIn', data))}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                </TabsContent>
                 <TabsContent value="signup" className="mt-6 space-y-4">
                   <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email here" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      className="w-full" 
                      disabled={isLoading || isGoogleLoading}
                      onClick={form.handleSubmit((data) => handleEmailAuthAction('signUp', data))}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                </TabsContent>
              </form>
            </Form>
          </Tabs>
           <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GoogleIcon className="mr-2 h-5 w-5" />
                  )}
                  Sign in with Google
                </Button>
              </div>
        </CardContent>
      </Card>
    </div>
  );
}
