import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  signInWithPassword,
  signInWithMagicLink,
  signUp,
  signOut,
  resetPassword,
  updatePassword,
} from '@/lib/api/auth.api'

export function useSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithPassword(email, password),
  })
}

export function useMagicLink() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => signInWithMagicLink(email),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: ({
      email,
      password,
      fullLegalName,
    }: {
      email: string
      password: string
      fullLegalName: string
    }) => signUp(email, password, fullLegalName),
  })
}

export function useSignOut() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => navigate('/auth/login', { replace: true }),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => resetPassword(email),
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: ({ password }: { password: string }) => updatePassword(password),
  })
}
