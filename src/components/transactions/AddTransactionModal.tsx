'use client'

import { useState, useRef, useEffect } from 'react'
import { addTransaction, updateTransaction, deleteTransaction, parseTransaction } from '@/app/actions/transaction'
import { AccountData } from '@/app/actions/account'
import { cn } from '@/lib/utils'

export interface Transaction {
    id: string
    description: string
    amount: number
    transaction_date: string
    type: 'credit' | 'debit'
    category?: string
    account_id?: string
}

interface AddTransactionProps {
    isOpen: boolean
    onClose: () => void
    initialData?: Transaction | null
    accounts?: AccountData[]
}

export function AddTransactionModal({ isOpen, onClose, initialData, accounts = [] }: AddTransactionProps) {
    const [type, setType] = useState<'credit' | 'debit'>('debit')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isParsing, setIsParsing] = useState(false)

    // Form Refs to manually set values after AI parsing
    const amountRef = useRef<HTMLInputElement>(null)
    const descriptionRef = useRef<HTMLInputElement>(null)
    const categoryRef = useRef<HTMLInputElement>(null)
    const dateRef = useRef<HTMLInputElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    const parseInputRef = useRef<HTMLTextAreaElement>(null)

    // Reset form when modal opens/closes or initialData changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setType(initialData.type)
            } else {
                setType('debit') // Default
            }
        }
    }, [isOpen, initialData])

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)
        formData.append('type', type)

        try {
            if (initialData) {
                formData.append('id', initialData.id)
                await updateTransaction(formData)
            } else {
                await addTransaction(formData)
            }
            onClose()
        } catch (error) {
            console.error(error)
            alert('Something went wrong')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!initialData || !confirm('Are you sure you want to delete this transaction?')) return
        setIsSubmitting(true)
        await deleteTransaction(initialData.id)
        setIsSubmitting(false)
        onClose()
    }

    const handleParse = async () => {
        const text = parseInputRef.current?.value
        if (!text) return

        setIsParsing(true)
        try {
            const result = await parseTransaction(text)

            // Update form state
            setType(result.type)
            if (amountRef.current) amountRef.current.value = result.amount.toString()
            if (descriptionRef.current) descriptionRef.current.value = result.description
            if (categoryRef.current) categoryRef.current.value = result.category
            if (dateRef.current && result.date) dateRef.current.value = result.date

        } catch (error) {
            console.error('Parsing failed', error)
            alert('Failed to parse transaction. Please try again.')
        } finally {
            setIsParsing(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div
                ref={modalRef}
                className="relative w-full max-w-lg transform rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl transition-all animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {initialData ? 'Edit Transaction' : 'New Transaction'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Smart Paste Section (Only for new transactions) */}
                {!initialData && (
                    <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                            Smart Paste (AI)
                        </label>
                        <div className="flex gap-2">
                            <textarea
                                ref={parseInputRef}
                                placeholder="Paste SMS or describe... e.g. 'Spent 5k at Shoprite for food'"
                                className="flex-1 min-h-[60px] text-sm bg-white dark:bg-gray-900 border-0 rounded-lg p-3 resize-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleParse();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleParse}
                                disabled={isParsing}
                                className="flex-none px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center min-w-[80px]"
                            >
                                {isParsing ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Parse'}
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType('credit')}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                                type === 'credit'
                                    ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
                            )}
                        >
                            Income
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('debit')}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                                type === 'debit'
                                    ? "bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
                            )}
                        >
                            Expense
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">₦</span>
                            <input
                                ref={amountRef}
                                type="number"
                                name="amount"
                                step="0.01"
                                placeholder="0.00"
                                defaultValue={initialData?.amount}
                                required
                                autoFocus={!initialData} // Only autofocus on new
                                className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl px-4 pl-10 py-4 text-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-gray-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Source Account</label>
                            <select
                                name="accountId"
                                defaultValue={initialData?.account_id || accounts.find(a => a.is_default)?.id}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-shadow appearance-none"
                                required
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name} (₦{acc.balance.toLocaleString()})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Description</label>
                            <input
                                ref={descriptionRef}
                                type="text"
                                name="description"
                                placeholder="e.g. Chowdeck, Salary..."
                                defaultValue={initialData?.description}
                                required
                                className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl px-4 py-3 text-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-shadow"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Category</label>
                                <input
                                    ref={categoryRef}
                                    type="text"
                                    name="category"
                                    list="categories"
                                    placeholder="Select..."
                                    defaultValue={initialData?.category}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                />
                                <datalist id="categories">
                                    <option value="Food" />
                                    <option value="Transport" />
                                    <option value="Subscriptions" />
                                    <option value="Family" />
                                    <option value="Data/Airtime" />
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date</label>
                                <input
                                    ref={dateRef}
                                    type="date"
                                    name="date"
                                    defaultValue={initialData?.transaction_date || new Date().toISOString().split('T')[0]}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {initialData && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="flex-none px-4 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    "flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-50",
                                    isSubmitting ? "!cursor-wait" : "cursor-pointer disabled:cursor-not-allowed"
                                )}
                            >
                                {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Save Transaction')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
