import Link from 'next/link'
import { AccountsList } from './AccountsList'
import { AccountData } from '@/app/actions/account'

interface DashboardHeaderProps {
    monthName: string
    accounts: AccountData[]
    totalBalance: number
    prevMonthId?: string | null
    nextMonthId?: string | null
}

export function DashboardHeader({ monthName, accounts, totalBalance, prevMonthId, nextMonthId }: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-md dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 pb-2">
            <div className="w-full max-w-3xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href={prevMonthId ? `/?monthId=${prevMonthId}` : '#'}
                            className={`p-1 rounded-full transition-colors ${prevMonthId
                                ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer'
                                : 'text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50 pointer-events-none'
                                }`}
                            aria-disabled={!prevMonthId}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </Link>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{monthName}</h1>

                        <Link
                            href={nextMonthId ? `/?monthId=${nextMonthId}` : '#'}
                            className={`p-1 rounded-full transition-colors ${nextMonthId
                                ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer'
                                : 'text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50 pointer-events-none'
                                }`}
                            aria-disabled={!nextMonthId}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </Link>
                    </div>

                    <div className="text-xs font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500">
                        {new Date().toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                </div>

                <AccountsList accounts={accounts} totalBalance={totalBalance} />
            </div>
        </header>
    )
}
