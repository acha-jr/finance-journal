'use client'

import { useState } from 'react'
import { AddTransactionModal, type Transaction } from '@/components/transactions/AddTransactionModal'

interface TransactionListProps {
    type: 'credit' | 'debit'
    title: string
    transactions: Transaction[]
}

export function TransactionList({ type, title, transactions }: TransactionListProps) {
    const isCredit = type === 'credit'
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider pl-1">{title}</h3>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                {transactions.map((tx) => (
                    <button
                        key={tx.id}
                        onClick={() => setSelectedTransaction(tx)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                    >
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{tx.description}</p>
                            <div className="flex gap-2 text-xs text-gray-500">
                                <span>{tx.transaction_date}</span>
                                {tx.category && <span className="text-gray-400">• {tx.category}</span>}
                            </div>
                        </div>
                        <div className={`font-semibold ${isCredit ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                            {isCredit ? '+' : ''}₦{Number(tx.amount).toLocaleString()}
                        </div>
                    </button>
                ))}

                {transactions.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No transactions yet
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {selectedTransaction && (
                <AddTransactionModal
                    isOpen={!!selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    initialData={selectedTransaction}
                />
            )}
        </div>
    )
}
