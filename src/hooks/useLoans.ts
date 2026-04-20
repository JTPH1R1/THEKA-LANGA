import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
  getGroupLoans,
  getMyGroupLoans,
  getLoanGuarantors,
  getLoanRepayments,
  getMyGuarantorRequests,
  applyForLoan,
  approveLoan,
  rejectLoan,
  disburseLoan,
  recordLoanRepayment,
  respondToGuarantor,
} from '@/lib/api/loans.api'
import { useSession } from '@/hooks/useSession'
import type { LoanStatus } from '@/types/domain.types'

export function useGroupLoans(groupId: string, status?: LoanStatus) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.loans(groupId, { status }),
    queryFn:  () => getGroupLoans({ groupId, status }),
    enabled:  isAuthenticated && !!groupId,
    staleTime: 30_000,
  })
}

export function useMyGroupLoans(groupId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: [...queryKeys.loans(groupId, {}), 'mine'],
    queryFn:  () => getMyGroupLoans(groupId),
    enabled:  isAuthenticated && !!groupId,
    staleTime: 30_000,
  })
}

export function useLoanGuarantors(loanId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.loanGuarantors(loanId),
    queryFn:  () => getLoanGuarantors(loanId),
    enabled:  isAuthenticated && !!loanId,
    staleTime: 30_000,
  })
}

export function useLoanRepayments(loanId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.loanRepayments(loanId),
    queryFn:  () => getLoanRepayments(loanId),
    enabled:  isAuthenticated && !!loanId,
    staleTime: 30_000,
  })
}

export function useMyGuarantorRequests() {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: ['guarantor-requests'],
    queryFn:  getMyGuarantorRequests,
    enabled:  isAuthenticated,
    staleTime: 60_000,
  })
}

export function useApplyForLoan(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: applyForLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans(groupId, {}) })
    },
  })
}

export function useApproveLoan(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans(groupId, {}) })
    },
  })
}

export function useRejectLoan(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ loanId, reason }: { loanId: string; reason: string }) =>
      rejectLoan(loanId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans(groupId, {}) })
    },
  })
}

export function useDisburseLoan(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: disburseLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans(groupId, {}) })
    },
  })
}

export function useRecordLoanRepayment(groupId: string, loanId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recordLoanRepayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans(groupId, {}) })
      queryClient.invalidateQueries({ queryKey: queryKeys.loanRepayments(loanId) })
    },
  })
}

export function useRespondToGuarantor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ loanId, accepted }: { loanId: string; accepted: boolean }) =>
      respondToGuarantor(loanId, accepted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guarantor-requests'] })
    },
  })
}
