import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
  getMyKycProfile,
  getMyKycDocuments,
  completeLevel1,
  submitLevel2,
  submitLevel3,
} from '@/lib/api/kyc.api'
import { useSession } from '@/hooks/useSession'

export function useMyKycProfile() {
  const { user, isAuthenticated } = useSession()

  return useQuery({
    queryKey: queryKeys.kycProfile(user?.id ?? ''),
    queryFn: getMyKycProfile,
    enabled: isAuthenticated && !!user?.id,
    staleTime: 2 * 60_000,
  })
}

export function useMyKycDocuments() {
  const { user, isAuthenticated } = useSession()

  return useQuery({
    queryKey: queryKeys.kycDocuments(user?.id ?? ''),
    queryFn: getMyKycDocuments,
    enabled: isAuthenticated && !!user?.id,
  })
}

export function useCompleteLevel1() {
  const queryClient = useQueryClient()
  const { user } = useSession()

  return useMutation({
    mutationFn: completeLevel1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kycProfile(user?.id ?? '') })
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(user?.id ?? '') })
    },
  })
}

export function useSubmitLevel2() {
  const queryClient = useQueryClient()
  const { user } = useSession()

  return useMutation({
    mutationFn: submitLevel2,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kycProfile(user?.id ?? '') })
      queryClient.invalidateQueries({ queryKey: queryKeys.kycDocuments(user?.id ?? '') })
    },
  })
}

export function useSubmitLevel3() {
  const queryClient = useQueryClient()
  const { user } = useSession()

  return useMutation({
    mutationFn: submitLevel3,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kycProfile(user?.id ?? '') })
    },
  })
}
