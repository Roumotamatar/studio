'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

type SuccessCallback = (userCredential: UserCredential) => void;
type ErrorCallback = (error: FirebaseError) => void;

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(
  authInstance: Auth,
  onSuccess?: SuccessCallback,
  onError?: ErrorCallback
): void {
  signInAnonymously(authInstance)
    .then(onSuccess)
    .catch(onError);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string,
  onSuccess?: SuccessCallback,
  onError?: ErrorCallback
): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(onSuccess)
    .catch(onError);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string,
  onSuccess?: SuccessCallback,
  onError?: ErrorCallback
): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .then(onSuccess)
    .catch(onError);
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(
  authInstance: Auth,
  onSuccess?: SuccessCallback,
  onError?: ErrorCallback
): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(authInstance, provider)
    .then(onSuccess)
    .catch(onError);
}
