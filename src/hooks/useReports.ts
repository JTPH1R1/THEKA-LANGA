import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
  getCycleSummaryData,
  getMemberStatementData,
  getLoanBookData,
} from '@/lib/api/reports.api'

export function useCycleSummaryData(groupId: string, cyclePeriod: string) {
  return useQuery({
    queryKey: queryKeys.reportCycleSummary(groupId, cyclePeriod),
    queryFn:  () => getCycleSummaryData(groupId, cyclePeriod),
    enabled:  !!groupId && !!cyclePeriod,
    staleTime: 60_000,
  })
}

export function useMemberStatementData(groupId: string, memberId: string) {
  return useQuery({
    queryKey: queryKeys.reportMemberStatement(groupId, memberId),
    queryFn:  () => getMemberStatementData(groupId, memberId),
    enabled:  !!groupId && !!memberId,
    staleTime: 60_000,
  })
}

export function useLoanBookData(groupId: string) {
  return useQuery({
    queryKey: queryKeys.reportLoanBook(groupId),
    queryFn:  () => getLoanBookData(groupId),
    enabled:  !!groupId,
    staleTime: 60_000,
  })
}
