import { FirebaseError } from 'firebase/app'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(inputs.filter(Boolean).join(' '))
}

export function generateDefaultUserName(userCount: number): string {
  const nextNumber = userCount + 1
  const suffix = nextNumber < 10 ? `0${nextNumber}` : `${nextNumber}`

  return `nhaplieu${suffix}`
}

export function getSignupErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/operation-not-allowed':
        return 'Email/password signup is not enabled in Firebase Console.'
      case 'auth/configuration-not-found':
        return 'Firebase Authentication is not configured for this project. Enable Authentication and Email/Password sign-in in Firebase Console.'
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.'
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase Authentication settings.'
      default:
        return error.message
    }
  }

  return error instanceof Error ? error.message : 'Failed to create an account'
}
