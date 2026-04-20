import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
  getAdminStats, getAdminUsers, blacklistUser, unblacklistUser,
  getAdminGroups, freezeGroup, unfreezeGroup,
  getKycQueue, approveKyc, rejectKyc,
  getAuditLog, getJobLog, getSystemErrors,
} from '@/lib/api/admin.api'

// ─── Stats ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn:  getAdminStats,
    staleTime: 30_000,
  })
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function useAdminUsers(params: { search?: string; kycLevel?: number; blacklisted?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.adminUsers(params),
    queryFn:  () => getAdminUsers(params),
    staleTime: 30_000,
  })
}

export function useBlacklistUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ profileId, reason }: { profileId: string; reason: string }) =>
      blacklistUser(profileId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers({}) }),
  })
}

export function useUnblacklistUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (profileId: string) => unblacklistUser(profileId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers({}) }),
  })
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export function useAdminGroups(status?: string) {
  return useQuery({
    queryKey: queryKeys.adminGroups({ status }),
    queryFn:  () => getAdminGroups(status),
    staleTime: 30_000,
  })
}

export function useFreezeGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: freezeGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminGroups({}) }),
  })
}

export function useUnfreezeGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unfreezeGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminGroups({}) }),
  })
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export function useKycQueue() {
  return useQuery({
    queryKey: ['admin', 'kyc-queue'],
    queryFn:  getKycQueue,
    staleTime: 30_000,
  })
}

export function useApproveKyc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveKyc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kyc-queue'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}

export function useRejectKyc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ profileId, reason }: { profileId: string; reason: string }) =>
      rejectKyc(profileId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kyc-queue'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}

// ─── Audit log ────────────────────────────────────────────────────────────────

export function useAuditLog(params: { tableName?: string; action?: string; offset?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.auditLog(params),
    queryFn:  () => getAuditLog(params),
    staleTime: 30_000,
  })
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export function useJobLog() {
  return useQuery({
    queryKey: queryKeys.adminJobs(),
    queryFn:  getJobLog,
    staleTime: 30_000,
  })
}

export function useSystemErrors() {
  return useQuery({
    queryKey: queryKeys.adminErrors(),
    queryFn:  getSystemErrors,
    staleTime: 30_000,
  })
}
