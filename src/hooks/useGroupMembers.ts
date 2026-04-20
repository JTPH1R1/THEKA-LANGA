import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
  getGroupMembers,
  getMyMembership,
  getJoinRequests,
  getMyJoinRequest,
  requestToJoin,
  withdrawJoinRequest,
  approveJoinRequest,
  denyJoinRequest,
  exitGroup,
  suspendMember,
  reinstateMember,
} from '@/lib/api/members.api'
import { useSession } from '@/hooks/useSession'

export function useGroupMembers(groupId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.groupMembers(groupId),
    queryFn: () => getGroupMembers(groupId),
    enabled: isAuthenticated && !!groupId,
    staleTime: 60_000,
  })
}

export function useMyMembership(groupId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: [...queryKeys.groupMembers(groupId), 'mine'],
    queryFn: () => getMyMembership(groupId),
    enabled: isAuthenticated && !!groupId,
    staleTime: 60_000,
  })
}

export function useJoinRequests(groupId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.joinRequests(groupId),
    queryFn: () => getJoinRequests(groupId),
    enabled: isAuthenticated && !!groupId,
    staleTime: 30_000,
  })
}

export function useMyJoinRequest(groupId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: [...queryKeys.joinRequests(groupId), 'mine'],
    queryFn: () => getMyJoinRequest(groupId),
    enabled: isAuthenticated && !!groupId,
  })
}

export function useRequestToJoin(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (message?: string) => requestToJoin(groupId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.joinRequests(groupId) })
    },
  })
}

export function useWithdrawJoinRequest(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => withdrawJoinRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.joinRequests(groupId) })
    },
  })
}

export function useApproveJoinRequest(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => approveJoinRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.joinRequests(groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(groupId) })
    },
  })
}

export function useDenyJoinRequest(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      denyJoinRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.joinRequests(groupId) })
    },
  })
}

export function useExitGroup(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => exitGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.groups({ mine: true }) })
    },
  })
}

export function useSuspendMember(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (profileId: string) => suspendMember(groupId, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(groupId) })
    },
  })
}

export function useReinstateMember(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (profileId: string) => reinstateMember(groupId, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(groupId) })
    },
  })
}
