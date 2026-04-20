import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getMyProfile, updateMyProfile, uploadAvatar } from '@/lib/api/profiles.api'
import { useSession } from '@/hooks/useSession'

export function useMyProfile() {
  const { user, isAuthenticated } = useSession()

  return useQuery({
    queryKey: queryKeys.profile(user?.id ?? ''),
    queryFn: getMyProfile,
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60_000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user } = useSession()

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.profile(user?.id ?? ''), updated)
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const { user } = useSession()

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(user?.id ?? '') })
    },
  })
}

/** True if the user has completed the one-time profile setup (preferred_name is set) */
export function useProfileComplete() {
  const { data: profile, isLoading } = useMyProfile()
  return {
    isComplete: !!profile?.preferredName,
    isLoading,
    profile,
  }
}
