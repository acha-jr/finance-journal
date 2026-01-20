'use client'

import { useState } from 'react'
import { AccountData } from '@/app/actions/account'
import { AddAccountModal } from './AddAccountModal'
import { EditAccountModal } from './EditAccountModal'
import { cn } from '@/lib/utils'

interface AccountsListProps {
    accounts: AccountData[]
    totalBalance: number
}

export function AccountsList({ accounts, totalBalance }: AccountsListProps) {
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<AccountData | null>(null)

    return (
        <div className="space-y-6">
            <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Total Balance</p>
                <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1">
                    ₦{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
            </div>

            <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
                    {accounts.map(account => (
                        <div
                            key={account.id}
                            onClick={() => setEditingAccount(account)}
                            className="flex-none w-40 snap-start bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-28 cursor-pointer hover:border-indigo-300 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <span className={cn(
                                    "p-1.5 rounded-lg text-white text-xs",
                                    account.type === 'bank' ? "bg-blue-500" :
                                        account.type === 'mobile_money' ? "bg-purple-500" :
                                            account.type === 'cash' ? "bg-green-500" : "bg-gray-500"
                                )}>
                                    {account.type === 'bank' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" /><line x1="12" x2="12" y1="19" y2="21" /><line x1="2" x2="22" y1="13" y2="13" /><line x1="2" x2="22" y1="17" y2="17" /><line x1="2" x2="22" y1="9" y2="9" /><line x1="2" x2="2" y1="7" y2="7" /><line x1="22" x2="22" y1="7" y2="7" /></svg>}
                                    {account.type === 'mobile_money' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>}
                                    {account.type === 'cash' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                                    {account.type === 'other' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
                                </span>
                                {account.is_default && <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded-full">Default</span>}
                            </div>
                            <div>
                                <h4 className="text-xs font-medium text-gray-500 truncate">{account.name}</h4>
                                <p className="text-base font-bold text-gray-900 dark:text-white truncate">₦{account.balance.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}

                    {/* Add Account Button */}
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex-none w-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
            </div>

            <AddAccountModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
            <EditAccountModal account={editingAccount} isOpen={!!editingAccount} onClose={() => setEditingAccount(null)} />
        </div>
    )
}
