import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  TrendingUp, TrendingDown, Wallet, ShoppingCart,
  Plus, Trash2, CheckSquare, Square, ChevronDown, ChevronUp,
} from 'lucide-react'

import {
  useTransactions, useAddTransaction, useDeleteTransaction,
  useBudgets, useUpsertBudget, useDeleteBudget,
  useShoppingLists, useCreateShoppingList, useDeleteShoppingList, useCompleteShoppingList,
  useShoppingItems, useAddShoppingItem, useToggleShoppingItem, useDeleteShoppingItem,
} from '@/hooks/usePersonal'
import {
  transactionSchema, budgetSchema, shoppingListSchema, shoppingItemSchema,
  CATEGORY_LABELS, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHOD_LABELS,
  type TransactionValues, type BudgetValues, type ShoppingListValues, type ShoppingItemValues,
} from '@/lib/validators/personal.schema'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Transaction, Budget, ShoppingList, ShoppingItem } from '@/types/domain.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function currentDateISO() {
  return new Date().toISOString().slice(0, 10)
}

// ─── Add Transaction Dialog ───────────────────────────────────────────────────

function AddTransactionDialog({ month, open, onOpenChange }: {
  month: string; open: boolean; onOpenChange: (v: boolean) => void
}) {
  const add = useAddTransaction(month)
  const form = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'expense', category: 'food', amount: 0, date: currentDateISO(), tags: [] },
  })
  const type = form.watch('type')
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  async function onSubmit(values: TransactionValues) {
    try {
      await add.mutateAsync({
        type:          values.type,
        category:      values.category,
        amount:        Math.round(values.amount * 100),
        description:   values.description || undefined,
        date:          values.date,
        paymentMethod: values.paymentMethod,
        tags:          values.tags,
      })
      toast.success('Transaction added')
      onOpenChange(false)
      form.reset({ type: 'expense', category: 'food', amount: 0, date: currentDateISO(), tags: [] })
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Add transaction</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(['income', 'expense', 'transfer'] as const).map((t) => (
                <button key={t} type="button"
                  onClick={() => { form.setValue('type', t); form.setValue('category', t === 'income' ? 'salary' : 'food') }}
                  className={[
                    'py-2 rounded-lg text-xs font-medium capitalize transition-colors',
                    type === t
                      ? t === 'income' ? 'bg-teal-700 text-white' : t === 'expense' ? 'bg-red-800 text-white' : 'bg-blue-800 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200',
                  ].join(' ')}>
                  {t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs">Category</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500">
                      {categories.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
                    </select>
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs">Amount (KES)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00"
                      {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs">Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500" />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs">Method</FormLabel>
                  <FormControl>
                    <select {...field} value={field.value ?? ''} className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500">
                      <option value="">Any</option>
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 text-xs">Description (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Supermarket run" {...field} className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500" />
                </FormControl>
              </FormItem>
            )} />
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400">Cancel</Button>
              <Button type="submit" disabled={add.isPending} className="bg-teal-600 hover:bg-teal-500 text-white">
                {add.isPending ? 'Adding…' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────

function TransactionsTab() {
  const [month, setMonth] = useState(currentMonth())
  const [typeFilter, setTypeFilter] = useState<Transaction['type'] | 'all'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data: txns = [], isLoading } = useTransactions({
    month,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  })
  const deleteTx = useDeleteTransaction(month)

  const income   = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net      = income - expenses

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
          className="bg-slate-800 border-slate-700 text-slate-100 w-36 focus-visible:ring-teal-500" />
        <div className="flex gap-1">
          {(['all', 'income', 'expense'] as const).map((f) => (
            <button key={f} onClick={() => setTypeFilter(f)}
              className={['px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                typeFilter === f ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200',
              ].join(' ')}>
              {f}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}
          className="ml-auto bg-teal-600 hover:bg-teal-500 text-white gap-1.5 text-xs">
          <Plus size={13} /> Add
        </Button>
      </div>

      {/* Summary */}
      {txns.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Income',   value: income,   color: 'text-teal-300', icon: TrendingUp },
            { label: 'Expenses', value: expenses, color: 'text-red-300',  icon: TrendingDown },
            { label: 'Net',      value: net,      color: net >= 0 ? 'text-teal-300' : 'text-red-300', icon: Wallet },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={13} className={color} />
                <p className="text-xs text-slate-500">{label}</p>
              </div>
              <p className={`text-lg font-bold tabular-nums ${color}`}>{formatCurrency(value, 'KES')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Transaction list */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="animate-pulse p-4 space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-12 bg-slate-800 rounded" />)}
          </div>
        ) : !txns.length ? (
          <div className="p-4">
            <EmptyState icon={Wallet} title="No transactions" description="Add your first income or expense for this month." />
          </div>
        ) : (
          txns.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
              <div className={`w-2 h-8 rounded-full shrink-0 ${tx.type === 'income' ? 'bg-teal-500' : tx.type === 'expense' ? 'bg-red-500' : 'bg-blue-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">
                  {CATEGORY_LABELS[tx.category] ?? tx.category}
                  {tx.description && <span className="text-slate-400"> — {tx.description}</span>}
                </p>
                <p className="text-xs text-slate-500">{formatDate(tx.date)}</p>
              </div>
              <p className={`text-sm font-semibold tabular-nums shrink-0 ${tx.type === 'income' ? 'text-teal-300' : tx.type === 'expense' ? 'text-red-300' : 'text-slate-300'}`}>
                {tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''}{formatCurrency(tx.amount, 'KES')}
              </p>
              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(tx.id)}
                className="p-1 text-slate-600 hover:text-red-400 shrink-0">
                <Trash2 size={13} />
              </Button>
            </div>
          ))
        )}
      </div>

      <AddTransactionDialog month={month} open={showAdd} onOpenChange={setShowAdd} />
      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete transaction?"
        description="This will permanently remove this transaction record."
        confirmLabel="Delete" destructive
        isPending={deleteTx.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteTx.mutateAsync(deleteTarget)
            toast.success('Transaction deleted')
            setDeleteTarget(null)
          } catch (err) {
            toast.error((err as { message: string }).message)
          }
        }}
      />
    </div>
  )
}

// ─── Add/Edit Budget Dialog ───────────────────────────────────────────────────

function BudgetDialog({ month, existing, open, onOpenChange }: {
  month: string; existing?: Budget; open: boolean; onOpenChange: (v: boolean) => void
}) {
  const upsert = useUpsertBudget(month)
  const form = useForm<BudgetValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category:       existing?.category ?? 'food',
      budgetedAmount: existing ? existing.budgetedAmount / 100 : 0,
      notes:          existing?.notes ?? '',
    },
  })

  async function onSubmit(values: BudgetValues) {
    try {
      await upsert.mutateAsync({ month, category: values.category, budgetedAmount: Math.round(values.budgetedAmount * 100), notes: values.notes })
      toast.success('Budget saved')
      onOpenChange(false)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-slate-100">{existing ? 'Edit budget' : 'Add budget'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 text-xs">Category</FormLabel>
                <FormControl>
                  <select {...field} className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500">
                    {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="budgetedAmount" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 text-xs">Monthly budget (KES)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0.00"
                    {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400">Cancel</Button>
              <Button type="submit" disabled={upsert.isPending} className="bg-teal-600 hover:bg-teal-500 text-white">
                {upsert.isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Budgets Tab ──────────────────────────────────────────────────────────────

function BudgetsTab() {
  const [month, setMonth] = useState(currentMonth())
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Budget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data: budgets = [], isLoading } = useBudgets(month)
  const { data: txns = [] } = useTransactions({ month, type: 'expense' })
  const deleteBudget = useDeleteBudget(month)

  // Compute actual spent per category from transactions
  const actualByCategory = txns.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.category] = (acc[tx.category] ?? 0) + tx.amount
    return acc
  }, {})

  const totalBudgeted = budgets.reduce((s, b) => s + b.budgetedAmount, 0)
  const totalActual   = budgets.reduce((s, b) => s + (actualByCategory[b.category] ?? 0), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
          className="bg-slate-800 border-slate-700 text-slate-100 w-36 focus-visible:ring-teal-500" />
        <Button size="sm" onClick={() => setShowAdd(true)}
          className="ml-auto bg-teal-600 hover:bg-teal-500 text-white gap-1.5 text-xs">
          <Plus size={13} /> Add category
        </Button>
      </div>

      {/* Summary bar */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Total budgeted</p>
            <p className="text-xl font-bold text-slate-100 tabular-nums">{formatCurrency(totalBudgeted, 'KES')}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Spent so far</p>
            <p className={`text-xl font-bold tabular-nums ${totalActual > totalBudgeted ? 'text-red-300' : 'text-teal-300'}`}>
              {formatCurrency(totalActual, 'KES')}
            </p>
          </div>
        </div>
      )}

      {/* Budget rows */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="animate-pulse p-4 space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-14 bg-slate-800 rounded" />)}
          </div>
        ) : !budgets.length ? (
          <div className="p-4">
            <EmptyState icon={Wallet} title="No budgets set" description='Click "Add category" to set a monthly budget for a spending category.' />
          </div>
        ) : (
          budgets.map((b) => {
            const actual  = actualByCategory[b.category] ?? 0
            const pct     = b.budgetedAmount > 0 ? Math.min(100, Math.round((actual / b.budgetedAmount) * 100)) : 0
            const over    = actual > b.budgetedAmount
            return (
              <div key={b.id} className="px-4 py-3 border-b border-slate-800 last:border-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm text-slate-200">{CATEGORY_LABELS[b.category] ?? b.category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold tabular-nums ${over ? 'text-red-300' : 'text-slate-300'}`}>
                      {formatCurrency(actual, 'KES')} <span className="text-slate-500 font-normal">/ {formatCurrency(b.budgetedAmount, 'KES')}</span>
                    </span>
                    <button onClick={() => setEditTarget(b)} className="text-slate-500 hover:text-slate-300 text-xs">Edit</button>
                    <button onClick={() => setDeleteTarget(b.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full">
                  <div className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-teal-500'}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{pct}% used · {formatCurrency(Math.max(0, b.budgetedAmount - actual), 'KES')} remaining</p>
              </div>
            )
          })
        )}
      </div>

      <BudgetDialog month={month} open={showAdd} onOpenChange={setShowAdd} />
      {editTarget && (
        <BudgetDialog month={month} existing={editTarget} open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)} />
      )}
      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Remove budget?" description="This will remove the budget for this category."
        confirmLabel="Remove" destructive isPending={deleteBudget.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return
          try { await deleteBudget.mutateAsync(deleteTarget); toast.success('Budget removed'); setDeleteTarget(null) }
          catch (err) { toast.error((err as { message: string }).message) }
        }}
      />
    </div>
  )
}

// ─── Shopping Items Panel ─────────────────────────────────────────────────────

function ShoppingItemsPanel({ list }: { list: ShoppingList }) {
  const [showAdd, setShowAdd] = useState(false)
  const { data: items = [] } = useShoppingItems(list.id)
  const toggleItem  = useToggleShoppingItem(list.id)
  const deleteItem  = useDeleteShoppingItem(list.id)
  const addItem     = useAddShoppingItem(list.id)
  const form        = useForm<ShoppingItemValues>({
    resolver: zodResolver(shoppingItemSchema),
    defaultValues: { name: '', quantity: 1 },
  })

  async function onAddItem(values: ShoppingItemValues) {
    try {
      await addItem.mutateAsync({
        listId:         list.id,
        name:           values.name,
        quantity:       values.quantity,
        unit:           values.unit || undefined,
        estimatedPrice: values.estimatedPrice ? Math.round(values.estimatedPrice * 100) : undefined,
      })
      form.reset({ name: '', quantity: 1 })
      setShowAdd(false)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  const checked   = items.filter((i) => i.isChecked)
  const unchecked = items.filter((i) => !i.isChecked)

  return (
    <div className="space-y-3 mt-3">
      {/* Items list */}
      <div className="space-y-1">
        {[...unchecked, ...checked].map((item: ShoppingItem) => (
          <div key={item.id} className={['flex items-center gap-2.5 py-1.5', item.isChecked ? 'opacity-50' : ''].join(' ')}>
            <button onClick={() => toggleItem.mutate({ id: item.id, checked: !item.isChecked })}
              className="text-slate-400 hover:text-teal-400 shrink-0 transition-colors">
              {item.isChecked ? <CheckSquare size={16} className="text-teal-400" /> : <Square size={16} />}
            </button>
            <span className={['text-sm flex-1', item.isChecked ? 'line-through text-slate-500' : 'text-slate-200'].join(' ')}>
              {item.name}
              {item.quantity !== 1 && <span className="text-slate-400"> × {item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>}
            </span>
            {item.estimatedPrice != null && (
              <span className="text-xs text-slate-500 tabular-nums">{formatCurrency(item.estimatedPrice, 'KES')}</span>
            )}
            <button onClick={() => deleteItem.mutate(item.id)} className="text-slate-600 hover:text-red-400 shrink-0">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add item inline */}
      {showAdd ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAddItem)} className="flex gap-2">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Item name" autoFocus {...field}
                    className="bg-slate-800 border-slate-700 text-slate-100 h-8 text-sm focus-visible:ring-teal-500" />
                </FormControl>
              </FormItem>
            )} />
            <Button type="submit" size="sm" disabled={addItem.isPending} className="h-8 bg-teal-600 hover:bg-teal-500 text-white text-xs">Add</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdd(false)} className="h-8 text-slate-400 text-xs">Cancel</Button>
          </form>
        </Form>
      ) : (
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors">
          <Plus size={12} /> Add item
        </button>
      )}

      {items.length > 0 && (
        <p className="text-xs text-slate-500">{checked.length}/{items.length} checked</p>
      )}
    </div>
  )
}

// ─── Shopping Tab ─────────────────────────────────────────────────────────────

function ShoppingTab() {
  const [showCreate, setShowCreate] = useState(false)
  const [expandedList, setExpandedList] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data: lists = [], isLoading } = useShoppingLists()
  const createList  = useCreateShoppingList()
  const deleteList  = useDeleteShoppingList()
  const completeList= useCompleteShoppingList()

  const form = useForm<ShoppingListValues>({
    resolver: zodResolver(shoppingListSchema),
    defaultValues: { name: '', plannedDate: '' },
  })

  async function onCreate(values: ShoppingListValues) {
    try {
      const list = await createList.mutateAsync({ name: values.name, plannedDate: values.plannedDate || undefined })
      setShowCreate(false)
      setExpandedList(list.id)
      form.reset({ name: '', plannedDate: '' })
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  const active   = lists.filter((l) => !l.isComplete)
  const complete = lists.filter((l) => l.isComplete)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Shopping lists</h3>
        <Button size="sm" onClick={() => setShowCreate(true)} className="bg-teal-600 hover:bg-teal-500 text-white gap-1.5 text-xs">
          <Plus size={13} /> New list
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onCreate)} className="bg-slate-900 border border-teal-800/40 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs">List name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Weekly groceries" autoFocus {...field}
                      className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
              <FormField control={form.control} name="plannedDate" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs">Planned date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500" />
                  </FormControl>
                </FormItem>
              )} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createList.isPending} className="bg-teal-600 hover:bg-teal-500 text-white text-sm">
                {createList.isPending ? 'Creating…' : 'Create list'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="text-slate-400 text-sm">Cancel</Button>
            </div>
          </form>
        </Form>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2].map((i) => <div key={i} className="h-16 bg-slate-900 border border-slate-800 rounded-xl" />)}
        </div>
      ) : !lists.length ? (
        <EmptyState icon={ShoppingCart} title="No shopping lists" description='Create a list to track what to buy and compare estimated vs actual costs.' />
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-2">
              {active.map((list) => (
                <div key={list.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <button onClick={() => setExpandedList(expandedList === list.id ? null : list.id)}
                      className="flex-1 flex items-center gap-2 text-left">
                      <span className="text-sm font-medium text-slate-200">{list.name}</span>
                      {list.plannedDate && <span className="text-xs text-slate-500">{formatDate(list.plannedDate)}</span>}
                      {expandedList === list.id ? <ChevronUp size={14} className="text-slate-500 ml-auto" /> : <ChevronDown size={14} className="text-slate-500 ml-auto" />}
                    </button>
                    <Button size="sm" variant="ghost" onClick={async () => {
                      try { await completeList.mutateAsync(list.id); toast.success('List completed') }
                      catch (err) { toast.error((err as { message: string }).message) }
                    }} className="h-7 px-2 text-teal-400 hover:text-teal-300 text-xs shrink-0">
                      Done
                    </Button>
                    <button onClick={() => setDeleteTarget(list.id)} className="text-slate-600 hover:text-red-400 shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {expandedList === list.id && (
                    <div className="px-4 pb-4 border-t border-slate-800">
                      <ShoppingItemsPanel list={list} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {complete.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Completed lists ({complete.length})</p>
              <div className="space-y-2">
                {complete.map((list) => (
                  <div key={list.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 opacity-60">
                    <span className="text-sm text-slate-300 flex-1 line-through">{list.name}</span>
                    {list.completedAt && <span className="text-xs text-slate-500">{formatDate(list.completedAt)}</span>}
                    <button onClick={() => setDeleteTarget(list.id)} className="text-slate-600 hover:text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete list?" description="This will delete the list and all its items."
        confirmLabel="Delete" destructive isPending={deleteList.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return
          try { await deleteList.mutateAsync(deleteTarget); toast.success('List deleted'); setDeleteTarget(null) }
          catch (err) { toast.error((err as { message: string }).message) }
        }}
      />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'transactions', label: 'Transactions', icon: Wallet },
  { id: 'budgets',      label: 'Budgets',      icon: TrendingDown },
  { id: 'shopping',     label: 'Shopping',     icon: ShoppingCart },
] as const

type TabId = typeof TABS[number]['id']

export function PersonalPage() {
  const [tab, setTab] = useState<TabId>('transactions')

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-100">Personal Finance</h1>
        <p className="text-sm text-slate-400 mt-0.5">Track your income, expenses, budgets, and shopping</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-slate-800 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab === id
                ? 'border-teal-500 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200',
            ].join(' ')}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'transactions' && <TransactionsTab />}
      {tab === 'budgets'      && <BudgetsTab />}
      {tab === 'shopping'     && <ShoppingTab />}
    </div>
  )
}
