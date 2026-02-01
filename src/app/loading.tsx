export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900 pb-24 md:pb-6 relative animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <header className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-md dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 pb-2">
                <div className="w-full max-w-3xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    </div>
                    {/* Accounts Skeleton */}
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="min-w-[140px] h-[80px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 p-3 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 space-y-8">
                {/* Transaction List Skeleton */}
                <div className="space-y-4">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                </div>
                            </div>
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
