import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
  getGroupElections,
  getElectionCandidates,
  getMyVote,
  openElection,
  nominateCandidate,
  acceptNomination,
  declineNomination,
  castVote,
  openVoting,
  closeElection,
} from '@/lib/api/elections.api'
import { useSession } from '@/hooks/useSession'

export function useGroupElections(groupId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.elections(groupId),
    queryFn: () => getGroupElections(groupId),
    enabled: isAuthenticated && !!groupId,
    staleTime: 30_000,
  })
}

export function useElectionCandidates(electionId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.candidates(electionId),
    queryFn: () => getElectionCandidates(electionId),
    enabled: isAuthenticated && !!electionId,
    staleTime: 30_000,
  })
}

export function useMyVote(electionId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: ['my-vote', electionId],
    queryFn: () => getMyVote(electionId),
    enabled: isAuthenticated && !!electionId,
  })
}

export function useOpenElection(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      position: 'chair' | 'treasurer' | 'secretary'
      nominationsCloseAt: string
    }) => openElection({ groupId, ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.elections(groupId) })
    },
  })
}

export function useNominateCandidate(electionId: string, _groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ candidateId, manifesto }: { candidateId: string; manifesto?: string }) =>
      nominateCandidate(electionId, candidateId, manifesto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates(electionId) })
    },
  })
}

export function useAcceptNomination(electionId: string, _groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => acceptNomination(electionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates(electionId) })
    },
  })
}

export function useDeclineNomination(electionId: string, _groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => declineNomination(electionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates(electionId) })
    },
  })
}

export function useCastVote(electionId: string, _groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (candidateId: string) => castVote(electionId, candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vote', electionId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates(electionId) })
    },
  })
}

export function useOpenVoting(electionId: string, groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => openVoting(electionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.elections(groupId) })
    },
  })
}

export function useCloseElection(electionId: string, groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => closeElection(electionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.elections(groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.groupDetail(groupId) })
    },
  })
}
