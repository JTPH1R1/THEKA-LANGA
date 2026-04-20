import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
  getDashboardKpis,
  getMyGroupSummaries,
  getActivityFeed,
  getNextContributionsDue,
} from '@/lib/api/dashboard.api'
import { useSession } from '@/hooks/useSession'

export function useDashboardKpis() {
  const { user, isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.dashboardKpis(user?.id ?? ''),
    queryFn:  getDashboardKpis,
    enabled:  isAuthenticated && !!user?.id,
    staleTime: 60_000,
  })
}

export function useMyGroupSummaries() {
  const { user, isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.groups({ my: true, summaries: true }),
    queryFn:  getMyGroupSummaries,
    enabled:  isAuthenticated && !!user?.id,
    staleTime: 60_000,
  })
}

export function useActivityFeed() {
  const { user, isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.activityFeed(user?.id ?? ''),
    queryFn:  () => getActivityFeed(20),
    enabled:  isAuthenticated && !!user?.id,
    staleTime: 60_000,
  })
}

export function useNextContributionsDue() {
  const { user, isAuthenticated } = useSession()
  return useQuery({
    queryKey: ['next-contributions', user?.id ?? ''],
    queryFn:  getNextContributionsDue,
    enabled:  isAuthenticated && !!user?.id,
    staleTime: 60_000,
  })
}
