interface DashboardHeaderProps {
    monthName: string
    balance: number
    openingBalance: number
}

export function DashboardHeader({ monthName, balance, openingBalance }: DashboardHeaderProps) {
    const percentageLeft = openingBalance > 0 ? (balance / openingBalance) * 100 : 0
    const isPositive = balance >= 0

    return (
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
            <div className="w-full max-w-3xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{monthName}</h2>
                        <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Balance</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Opening (BBF)</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">₦{openingBalance.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Remaining</p>
                        <p className={`font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                            {percentageLeft.toFixed(1)}% left
                        </p>
                    </div>
                </div>
            </div>
        </header>
    )
}
