interface SummaryFooterProps {
    totalCredits: number
    totalDebits: number
    currentBalance: number
}

export function SummaryFooter({ totalCredits, totalDebits, currentBalance }: SummaryFooterProps) {
    const netChange = totalCredits - totalDebits
    const isPositive = netChange >= 0

    return (
        <footer className="bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 py-8 mb-safe">
            <div className="w-full max-w-3xl mx-auto px-4">
                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-100 dark:divide-gray-700">
                    <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Total Credits</p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">₦{totalCredits.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Total Debits</p>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">₦{totalDebits.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Net Change</p>
                        <p className={`text-sm font-semibold ${isPositive ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}₦{netChange.toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    {/* Logic for difference from last month would go here, omitting for MVP */}
                    <p className="text-xs text-gray-400">Month End Balance: <span className={currentBalance >= 0 ? "text-green-500" : "text-red-500"}>₦{currentBalance.toLocaleString()}</span></p>
                </div>
            </div>
        </footer>
    )
}
