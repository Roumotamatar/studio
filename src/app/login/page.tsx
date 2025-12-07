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
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { 
  initiateEmailSignUp,
  initiateEmailSignIn,
  initiateGoogleSignIn,
} from '@/firebase/non-blocking-login';
import { FirebaseError } from 'firebase/app';
import { Separator } from '@/components/ui/separator';
import { doc, serverTimestamp } from 'firebase/firestore';
import { sendEmailVerification, User } from 'firebase/auth';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.921,35.619,44,29.566,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );

const emailFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;
type AuthAction = 'signin' | 'signup';
const OWNER_EMAIL = "pompomtamatar9832@gmail.com";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authAction, setAuthAction] = useState<AuthAction>('signin');
  
  const { toast } = useToast();
  const router = useRouter();
  const { auth, firestore, isUserLoading, user } = useFirebase();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: '', password: '' },
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
        errorMessage = 'An account already exists with this email. Please sign in using the method you originally used.';
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

    setIsLoading(false);
    if (googleSignIn) {
      setIsGoogleLoading(false);
    }
  };
  
  const createUserProfile = (user: User) => {
    const userRef = doc(firestore, 'users', user.uid);
    const isOwner = user.email === OWNER_EMAIL;
    
    setDocumentNonBlocking(userRef, {
      id: user.uid,
      email: user.email,
      trialCount: isOwner ? Infinity : 3,
      hasPaid: isOwner,
      createdAt: serverTimestamp(),
    }, { merge: true });
  }

  const handleEmailAuthAction = (data: EmailFormValues) => {
    setIsLoading(true);
    
    const onSignInSuccess = () => setIsLoading(false);
    
    const onSignUpSuccess = async (userCredential: any) => {
      const newUser = userCredential.user as User;
      try {
        await sendEmailVerification(newUser);
        createUserProfile(newUser);
        toast({
          title: 'Verification Email Sent',
          description: "We've sent a verification link to your email. Please check your inbox to continue.",
        });
        auth.signOut();
      } catch (error) {
        console.error("Error sending verification email:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not send verification email. Please try signing up again.",
        });
      } finally {
        setIsLoading(false);
        setAuthAction('signin');
      }
    };

    if (authAction === 'signin') {
      initiateEmailSignIn(auth, data.email, data.password, onSignInSuccess, (err) => handleAuthError(err));
    } else {
      initiateEmailSignUp(auth, data.email, data.password, onSignUpSuccess, (err) => handleAuthError(err));
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    const onSuccess = (userCredential: any) => {
      createUserProfile(userCredential.user);
      setIsGoogleLoading(false)
    };
    initiateGoogleSignIn(auth, onSuccess, (err) => handleAuthError(err, true));
  };
  
  const renderEmailForm = () => (
    <>
      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(handleEmailAuthAction)} className="space-y-4">
            <FormField
              control={emailForm.control}
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
              control={emailForm.control}
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
              type="submit" 
              className="w-full" 
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {authAction === 'signin' ? (
                  <> <LogIn className="mr-2 h-4 w-4" /> Sign In</>
              ) : (
                  <> <UserPlus className="mr-2 h-4 w-4" /> Create Account</>
              )}
            </Button>
        </form>
      </Form>
      <div className="mt-6 text-center text-sm">
        {authAction === 'signin' ? (
          <>
            Don't have an account?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => setAuthAction('signup')}>
              Sign Up
            </Button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => setAuthAction('signin')}>
              Sign In
            </Button>
          </>
        )}
      </div>
    </>
  );

  const getTitle = () => {
    if (authAction === 'signup') return 'Create an Account';
    return 'Welcome Back!';
  };

  const getDescription = () => {
    if (authAction === 'signup') return 'Your personal AI-powered skin health assistant.';
    return 'Sign in to access your dashboard.';
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
       <div className="absolute top-8 left-8">
          <Logo />
        </div>
      <Card className="w-full max-w-md shadow-2xl bg-background/80 backdrop-blur-sm border-2 border-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent to-orange-400">
             {getTitle()}
          </CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderEmailForm()}
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
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleIcon className="mr-2 h-5 w-5" />
                    )}
                    Google
                  </Button>
                </div>
              </div>
        </CardContent>
      </Card>
    </div>
  );
}

    

    