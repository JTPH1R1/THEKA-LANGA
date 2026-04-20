import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { queryKeys } from '@/lib/query-keys'
import {
  getMyGroups,
  getPublicGroups,
  getGroupById,
  getGroupRules,
  createGroup,
  updateGroupRules,
} from '@/lib/api/groups.api'
import { useSession } from '@/hooks/useSession'
import type { GroupInfoValues } from '@/lib/validators/group.schema'
import type { FullRulesValues } from '@/lib/validators/group-rules.schema'

export function useMyGroups() {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.groups({ mine: true }),
    queryFn: getMyGroups,
    enabled: isAuthenticated,
    staleTime: 2 * 60_000,
  })
}

export function usePublicGroups(filters?: { search?: string; status?: string }) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.groups(filters),
    queryFn: () => getPublicGroups(filters),
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}

export function useGroupDetail(groupId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.groupDetail(groupId),
    queryFn: () => getGroupById(groupId),
    enabled: isAuthenticated && !!groupId,
    staleTime: 2 * 60_000,
  })
}

export function useGroupRules(groupId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.groupRules(groupId),
    queryFn: () => getGroupRules(groupId),
    enabled: isAuthenticated && !!groupId,
    staleTime: 5 * 60_000,
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  const { user } = useSession()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ info, rules }: { info: GroupInfoValues & { slug: string }; rules: FullRulesValues }) =>
      createGroup(info, rules),
    onSuccess: (groupId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups({ mine: true }) })
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(user?.id ?? '') })
      navigate(`/groups/${groupId}`)
    },
  })
}

export function useUpdateGroupRules(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rules: Partial<FullRulesValues>) => updateGroupRules(groupId, rules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupRules(groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.groupDetail(groupId) })
    },
  })
}
