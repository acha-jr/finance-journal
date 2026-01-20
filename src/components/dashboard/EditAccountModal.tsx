'use client'

import { useState } from 'react'
import { updateAccount, deleteAccount, AccountData } from '@/app/actions/account'

interface EditAccountModalProps {
    account: AccountData | null
    isOpen: boolean
    onClose: () => void
}

export function EditAccountModal({ account, isOpen, onClose }: EditAccountModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen || !account) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)
        formData.append('id', account.id)

        try {
            await updateAccount(formData)
            onClose()
        } catch (error) {
            console.error(error)
            alert('Failed to update account')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure? Transactions linked to this account will be kept but unlinked.')) return

        setIsSubmitting(true)
        try {
            await deleteAccount(account.id)
            onClose()
        } catch (error) {
            console.error(error)
            alert('Failed to delete account')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl animate-in zoom-in-95">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Account</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Name</label>
                        <input name="name" type="text" defaultValue={account.name} required className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Type</label>
                            <select name="type" defaultValue={account.type} className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm focus:ring-2 focus:ring-indigo-500">
                                <option value="bank">Bank</option>
                                <option value="mobile_money">Mobile Money</option>
                                <option value="cash">Cash</option>
                                <option value="savings">Savings</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Balance</label>
                            <input name="balance" type="number" step="0.01" defaultValue={account.balance} required className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="is_default" id="edit_is_default" defaultChecked={account.is_default} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <label htmlFor="edit_is_default" className="text-sm text-gray-600 dark:text-gray-400">Set as default account</label>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={handleDelete} disabled={isSubmitting} className="flex-none px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 !cursor-pointer disabled:!cursor-wait">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
