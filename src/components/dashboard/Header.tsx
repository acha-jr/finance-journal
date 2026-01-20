import { AccountsList } from './AccountsList'
import { AccountData } from '@/app/actions/account'

interface DashboardHeaderProps {
    monthName: string
    accounts: AccountData[]
    totalBalance: number
}

export function DashboardHeader({ monthName, accounts, totalBalance }: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-md dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 pb-2">
            <div className="w-full max-w-3xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{monthName}</h1>
                    <div className="text-xs font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500">
                        {new Date().toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                </div>

                <AccountsList accounts={accounts} totalBalance={totalBalance} />
            </div>
        </header>
    )
}
