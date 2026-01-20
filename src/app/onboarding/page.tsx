import { completeOnboarding } from './actions'

export default function OnboardingPage() {
    const currentMonth = new Date().toISOString().slice(0, 7) // "2025-01"

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
            <div className="w-full max-w-lg space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Welcome
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        Let's set up your journal.
                    </p>
                </div>

                <form action={completeOnboarding} className="mt-8 space-y-8">

                    <div className="space-y-4">
                        <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            What is your current account balance?
                        </label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">₦</span>
                            </div>
                            <input
                                type="number"
                                name="balance"
                                id="balance"
                                className="block w-full rounded-xl border-gray-300 pl-8 py-4 text-2xl font-bold focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="0.00"
                                step="0.01"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Which month are we starting from?
                        </label>
                        <input
                            type="month"
                            name="month"
                            id="month"
                            defaultValue={currentMonth}
                            className="block w-full rounded-xl border-gray-300 py-4 px-4 text-lg focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Start Journaling
                    </button>
                </form>
            </div>
        </div>
    )
}
