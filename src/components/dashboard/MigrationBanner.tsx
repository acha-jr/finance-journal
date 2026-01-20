'use client'

import { useState } from 'react'
import { migrateToAccounts } from '@/app/actions/migrate'

export function MigrationBanner() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
    const [msg, setMsg] = useState('')

    const handleMigrate = async () => {
        setStatus('loading')
        try {
            const result = await migrateToAccounts()
            if (result.error) {
                setStatus('error')
                setMsg(result.error)
            } else {
                setStatus('done')
            }
        } catch (e: any) {
            setStatus('error')
            setMsg(e.message)
        }
    }

    if (status === 'done') return null // Hide on success

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 p-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-blue-900 dark:text-blue-100">Action Required: Update Database</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        We need to move your current balance to the new "Accounts" system.
                    </p>
                    {status === 'error' && <p className="text-xs text-red-600 font-bold mt-1">{msg}</p>}
                </div>
                <button
                    onClick={handleMigrate}
                    disabled={status === 'loading'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                >
                    {status === 'loading' ? 'Migrating...' : 'Migrate Now'}
                </button>
            </div>
        </div>
    )
}
