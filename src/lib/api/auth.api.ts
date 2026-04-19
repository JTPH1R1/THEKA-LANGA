import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthError {
  message: string
}

function normaliseError(error: unknown): AuthError {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: string }).message
    // Map Supabase error messages to user-friendly text
    if (msg.includes('Invalid login credentials')) return { message: 'Incorrect email or password.' }
    if (msg.includes('Email not confirmed')) return { message: 'Please verify your email before signing in.' }
    if (msg.includes('User already registered')) return { message: 'An account with this email already exists.' }
    if (msg.includes('Password should be')) return { message: 'Password must be at least 6 characters.' }
    if (msg.includes('rate limit') || msg.includes('too many')) return { message: 'Too many attempts. Please wait a few minutes and try again.' }
    return { message: msg }
  }
  return { message: 'An unexpected error occurred. Please try again.' }
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ session: Session; user: User }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw normaliseError(error)
  return { session: data.session!, user: data.user! }
}

export async function signInWithMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  })
  if (error) throw normaliseError(error)
}

export async function signUp(
  email: string,
  password: string,
  fullLegalName: string
): Promise<{ user: User }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_legal_name: fullLegalName },
    },
  })
  if (error) throw normaliseError(error)
  if (!data.user) throw { message: 'Registration failed. Please try again.' }
  return { user: data.user }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw normaliseError(error)
}

export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/new-password`,
  })
  if (error) throw normaliseError(error)
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw normaliseError(error)
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw normaliseError(error)
  return data.session
}
