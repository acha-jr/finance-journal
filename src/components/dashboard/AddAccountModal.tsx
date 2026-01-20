'use client'

import { useState } from 'react'
import { createAccount } from '@/app/actions/account'

interface AddAccountModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AddAccountModal({ isOpen, onClose }: AddAccountModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)

        try {
            await createAccount(formData)
            onClose()
        } catch (error) {
            console.error(error)
            alert('Failed to create account')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl animate-in zoom-in-95">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Account / Wallet</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Name</label>
                        <input name="name" type="text" placeholder="e.g. GTBank, Cash, Opay" required className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Type</label>
                            <select name="type" className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm focus:ring-2 focus:ring-indigo-500">
                                <option value="bank">Bank</option>
                                <option value="mobile_money">Mobile Money</option>
                                <option value="cash">Cash</option>
                                <option value="savings">Savings</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Current Balance</label>
                            <input name="balance" type="number" step="0.01" placeholder="0.00" required className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="is_default" id="is_default" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <label htmlFor="is_default" className="text-sm text-gray-600 dark:text-gray-400">Set as default account</label>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 !cursor-pointer disabled:!cursor-wait">
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
