import { login } from './actions'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const checkEmail = resolvedParams?.check_email === 'true'
    const error = resolvedParams?.error === 'true'

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Finance Journal
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Sign in to access your journal
                    </p>
                </div>

                {checkEmail ? (
                    <div className="rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <p className="text-center font-medium">Check your email for the magic link.</p>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full rounded-lg border border-gray-300 bg-transparent px-3 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:text-white sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 text-center">
                                Something went wrong. Please try again.
                            </div>
                        )}

                        <div>
                            <button
                                formAction={login}
                                className="group relative flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Sign in with Magic Link
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
