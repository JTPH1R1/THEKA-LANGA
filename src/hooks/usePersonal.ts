import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
  getTransactions, addTransaction, deleteTransaction,
  getBudgets, upsertBudget, deleteBudget,
  getShoppingLists, createShoppingList, deleteShoppingList, completeShoppingList,
  getShoppingItems, addShoppingItem, toggleShoppingItem, updateShoppingItemPrice, deleteShoppingItem,
} from '@/lib/api/personal.api'
import { useSession } from '@/hooks/useSession'
import type { Transaction } from '@/types/domain.types'

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useTransactions(params: {
  month?: string
  type?: Transaction['type']
  category?: string
}) {
  const { user, isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.personalTransactions(user?.id ?? '', {
      month: params.month, type: params.type, category: params.category,
    }),
    queryFn:  () => getTransactions(params),
    enabled:  isAuthenticated && !!user?.id,
    staleTime: 30_000,
  })
}

export function useAddTransaction(month: string) {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalTransactions(user?.id ?? '', {}) })
      queryClient.invalidateQueries({ queryKey: queryKeys.personalBudgets(user?.id ?? '', month) })
    },
  })
}

export function useDeleteTransaction(month: string) {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalTransactions(user?.id ?? '', {}) })
      queryClient.invalidateQueries({ queryKey: queryKeys.personalBudgets(user?.id ?? '', month) })
    },
  })
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export function useBudgets(month: string) {
  const { user, isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.personalBudgets(user?.id ?? '', month),
    queryFn:  () => getBudgets(month),
    enabled:  isAuthenticated && !!user?.id && !!month,
    staleTime: 60_000,
  })
}

export function useUpsertBudget(month: string) {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalBudgets(user?.id ?? '', month) })
    },
  })
}

export function useDeleteBudget(month: string) {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalBudgets(user?.id ?? '', month) })
    },
  })
}

// ─── Shopping lists ───────────────────────────────────────────────────────────

export function useShoppingLists() {
  const { user, isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.shoppingLists(user?.id ?? ''),
    queryFn:  getShoppingLists,
    enabled:  isAuthenticated && !!user?.id,
    staleTime: 30_000,
  })
}

export function useCreateShoppingList() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createShoppingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists(user?.id ?? '') })
    },
  })
}

export function useDeleteShoppingList() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteShoppingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists(user?.id ?? '') })
    },
  })
}

export function useCompleteShoppingList() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: completeShoppingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists(user?.id ?? '') })
    },
  })
}

// ─── Shopping items ───────────────────────────────────────────────────────────

export function useShoppingItems(listId: string) {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: queryKeys.shoppingList(listId),
    queryFn:  () => getShoppingItems(listId),
    enabled:  isAuthenticated && !!listId,
    staleTime: 10_000,
  })
}

export function useAddShoppingItem(listId: string) {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addShoppingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList(listId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists(user?.id ?? '') })
    },
  })
}

export function useToggleShoppingItem(listId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) => toggleShoppingItem(id, checked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList(listId) })
    },
  })
}

export function useUpdateShoppingItemPrice(listId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, actualPrice }: { id: string; actualPrice: number }) => updateShoppingItemPrice(id, actualPrice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList(listId) })
    },
  })
}

export function useDeleteShoppingItem(listId: string) {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteShoppingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList(listId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists(user?.id ?? '') })
    },
  })
}
