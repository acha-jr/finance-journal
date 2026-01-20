'use client'

import { useState } from 'react'
import { updateOpeningBalance } from '@/app/actions/month'

interface BalanceDisplayProps {
    monthId: string
    amount: number
}

export function BalanceDisplay({ monthId, amount }: BalanceDisplayProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)
        const newBalance = parseFloat(formData.get('balance') as string)

        if (!isNaN(newBalance)) {
            await updateOpeningBalance(monthId, newBalance)
        }

        setIsSubmitting(false)
        setIsEditing(false)
    }

    if (isEditing) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
                <form
                    onSubmit={handleSubmit}
                    className="relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl w-full max-w-xs animate-in zoom-in-95 duration-200"
                >
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Update Opening Balance</label>
                    <div className="flex gap-2">
                        <input
                            name="balance"
                            type="number"
                            step="0.01"
                            defaultValue={amount}
                            autoFocus
                            className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-900 border-0 rounded-lg px-3 py-2 font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className="group flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 -m-1 p-1 rounded-lg transition-colors text-left"
        >
            <span className="font-semibold text-gray-700 dark:text-gray-300">₦{amount.toLocaleString()}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
        </button>
    )
}
