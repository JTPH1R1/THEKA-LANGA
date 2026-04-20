import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
  getGroupContributions,
  getMyGroupContributions,
  getDistinctPeriods,
  generateContributionSchedule,
  recordContributionPayment,
  waiveContribution,
} from '@/lib/api/contributions.api'
import { useSession } from '@/hooks/useSession'
import type { ContributionStatus } from '@/types/domain.types'

export function useGroupContributions(params: {
  groupId: string
  cyclePeriod?: string
  status?: ContributionStatus
}) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.contributions(params.groupId, {
      cyclePeriod: params.cyclePeriod,
      status: params.status,
    }),
    queryFn:  () => getGroupContributions(params),
    enabled:  isAuthenticated && !!params.groupId,
    staleTime: 30_000,
  })
}

export function useMyGroupContributions(groupId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: [...queryKeys.contributions(groupId, {}), 'mine'],
    queryFn:  () => getMyGroupContributions(groupId),
    enabled:  isAuthenticated && !!groupId,
    staleTime: 30_000,
  })
}

export function useDistinctPeriods(groupId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: [...queryKeys.contributions(groupId, {}), 'periods'],
    queryFn:  () => getDistinctPeriods(groupId),
    enabled:  isAuthenticated && !!groupId,
    staleTime: 60_000,
  })
}

export function useGenerateContributionSchedule(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: generateContributionSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contributions(groupId, {}) })
    },
  })
}

export function useRecordContributionPayment(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recordContributionPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contributions(groupId, {}) })
      queryClient.invalidateQueries({ queryKey: queryKeys.groupSummary(groupId) })
    },
  })
}

export function useWaiveContribution(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: waiveContribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contributions(groupId, {}) })
    },
  })
}
