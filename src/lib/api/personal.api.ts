import { supabase, db } from '@/lib/supabase'
import type { Transaction, Budget, ShoppingList, ShoppingItem } from '@/types/domain.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getUid(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const uid = data.session?.user.id
  if (!uid) throw new Error('Not authenticated')
  return uid
}

function toTransaction(r: Record<string, unknown>): Transaction {
  return {
    id:            r.id as string,
    profileId:     r.profile_id as string,
    type:          r.type as Transaction['type'],
    category:      r.category as string,
    subcategory:   r.subcategory as string | null,
    amount:        r.amount as number,
    description:   r.description as string | null,
    date:          r.date as string,
    tags:          (r.tags as string[] | null) ?? [],
    paymentMethod: r.payment_method as Transaction['paymentMethod'],
    isRecurring:   r.is_recurring as boolean,
    createdAt:     r.created_at as string,
    updatedAt:     r.updated_at as string,
  }
}

function toBudget(r: Record<string, unknown>): Budget {
  return {
    id:             r.id as string,
    profileId:      r.profile_id as string,
    month:          r.month as string,
    category:       r.category as string,
    budgetedAmount: r.budgeted_amount as number,
    notes:          r.notes as string | null,
    createdAt:      r.created_at as string,
    updatedAt:      r.updated_at as string,
  }
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function getTransactions(params: {
  month?: string           // YYYY-MM — filters by date range
  type?: Transaction['type']
  category?: string
}): Promise<Transaction[]> {
  const uid = await getUid()

  let query = db.personal()
    .from('transactions')
    .select('*')
    .eq('profile_id', uid)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (params.month) {
    const [y, m] = params.month.split('-').map(Number)
    const from   = `${params.month}-01`
    const lastDay = new Date(y, m, 0).getDate()
    const to     = `${params.month}-${String(lastDay).padStart(2, '0')}`
    query = query.gte('date', from).lte('date', to)
  }
  if (params.type)     query = query.eq('type', params.type)
  if (params.category) query = query.eq('category', params.category)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => toTransaction(r as Record<string, unknown>))
}

export async function addTransaction(params: {
  type:          Transaction['type']
  category:      string
  amount:        number          // cents
  description?:  string
  date:          string
  paymentMethod?: Transaction['paymentMethod']
  tags?:         string[]
}): Promise<Transaction> {
  const uid = await getUid()
  const { data, error } = await db.personal()
    .from('transactions')
    .insert({
      profile_id:     uid,
      type:           params.type,
      category:       params.category,
      amount:         params.amount,
      description:    params.description ?? null,
      date:           params.date,
      payment_method: params.paymentMethod ?? null,
      tags:           params.tags ?? [],
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toTransaction(data as Record<string, unknown>)
}

export async function deleteTransaction(id: string): Promise<void> {
  const uid = await getUid()
  const { error } = await db.personal()
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('profile_id', uid)
  if (error) throw new Error(error.message)
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export async function getBudgets(month: string): Promise<Budget[]> {
  const uid = await getUid()
  const { data, error } = await db.personal()
    .from('budgets')
    .select('*')
    .eq('profile_id', uid)
    .eq('month', month)
    .order('category')

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => toBudget(r as Record<string, unknown>))
}

export async function upsertBudget(params: {
  month:          string
  category:       string
  budgetedAmount: number   // cents
  notes?:         string
}): Promise<Budget> {
  const uid = await getUid()
  const { data, error } = await db.personal()
    .from('budgets')
    .upsert(
      {
        profile_id:      uid,
        month:           params.month,
        category:        params.category,
        budgeted_amount: params.budgetedAmount,
        notes:           params.notes ?? null,
      },
      { onConflict: 'profile_id,month,category' }
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toBudget(data as Record<string, unknown>)
}

export async function deleteBudget(id: string): Promise<void> {
  const uid = await getUid()
  const { error } = await db.personal()
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('profile_id', uid)
  if (error) throw new Error(error.message)
}

// ─── Shopping lists ───────────────────────────────────────────────────────────

export async function getShoppingLists(): Promise<ShoppingList[]> {
  const uid = await getUid()
  const { data, error } = await db.personal()
    .from('shopping_lists')
    .select('*')
    .eq('profile_id', uid)
    .order('is_complete')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id:             r.id as string,
    profileId:      r.profile_id as string,
    name:           r.name as string,
    plannedDate:    r.planned_date as string | null,
    isComplete:     r.is_complete as boolean,
    completedAt:    r.completed_at as string | null,
    totalEstimated: r.total_estimated as number,
    totalActual:    r.total_actual as number,
    createdAt:      r.created_at as string,
    updatedAt:      r.updated_at as string,
  }))
}

export async function createShoppingList(params: {
  name:        string
  plannedDate?: string
}): Promise<ShoppingList> {
  const uid = await getUid()
  const { data, error } = await db.personal()
    .from('shopping_lists')
    .insert({ profile_id: uid, name: params.name, planned_date: params.plannedDate ?? null })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return {
    id:             data.id as string,
    profileId:      data.profile_id as string,
    name:           data.name as string,
    plannedDate:    data.planned_date as string | null,
    isComplete:     data.is_complete as boolean,
    completedAt:    data.completed_at as string | null,
    totalEstimated: data.total_estimated as number,
    totalActual:    data.total_actual as number,
    createdAt:      data.created_at as string,
    updatedAt:      data.updated_at as string,
  }
}

export async function deleteShoppingList(id: string): Promise<void> {
  const uid = await getUid()
  const { error } = await db.personal()
    .from('shopping_lists')
    .delete()
    .eq('id', id)
    .eq('profile_id', uid)
  if (error) throw new Error(error.message)
}

export async function completeShoppingList(id: string): Promise<void> {
  const uid = await getUid()
  const { error } = await db.personal()
    .from('shopping_lists')
    .update({ is_complete: true, completed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('profile_id', uid)
  if (error) throw new Error(error.message)
}

// ─── Shopping items ───────────────────────────────────────────────────────────

export async function getShoppingItems(listId: string): Promise<ShoppingItem[]> {
  const { data, error } = await db.personal()
    .from('shopping_items')
    .select('*')
    .eq('list_id', listId)
    .order('sort_order')
    .order('created_at')

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id:             r.id as string,
    listId:         r.list_id as string,
    name:           r.name as string,
    quantity:       r.quantity as number,
    unit:           r.unit as string | null,
    estimatedPrice: r.estimated_price as number | null,
    actualPrice:    r.actual_price as number | null,
    category:       r.category as string | null,
    isChecked:      r.is_checked as boolean,
    checkedAt:      r.checked_at as string | null,
    sortOrder:      r.sort_order as number,
    createdAt:      r.created_at as string,
  }))
}

export async function addShoppingItem(params: {
  listId:         string
  name:           string
  quantity:       number
  unit?:          string
  estimatedPrice?: number   // cents
  category?:      string
}): Promise<ShoppingItem> {
  const { data, error } = await db.personal()
    .from('shopping_items')
    .insert({
      list_id:         params.listId,
      name:            params.name,
      quantity:        params.quantity,
      unit:            params.unit ?? null,
      estimated_price: params.estimatedPrice ?? null,
      category:        params.category ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return {
    id:             data.id as string,
    listId:         data.list_id as string,
    name:           data.name as string,
    quantity:       data.quantity as number,
    unit:           data.unit as string | null,
    estimatedPrice: data.estimated_price as number | null,
    actualPrice:    data.actual_price as number | null,
    category:       data.category as string | null,
    isChecked:      data.is_checked as boolean,
    checkedAt:      data.checked_at as string | null,
    sortOrder:      data.sort_order as number,
    createdAt:      data.created_at as string,
  }
}

export async function toggleShoppingItem(id: string, checked: boolean): Promise<void> {
  const { error } = await db.personal()
    .from('shopping_items')
    .update({ is_checked: checked, checked_at: checked ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateShoppingItemPrice(id: string, actualPrice: number): Promise<void> {
  const { error } = await db.personal()
    .from('shopping_items')
    .update({ actual_price: actualPrice })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteShoppingItem(id: string): Promise<void> {
  const { error } = await db.personal()
    .from('shopping_items')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}
