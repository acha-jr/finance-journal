'use client'

import { useState } from 'react'
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal'

export function FloatingAddButton() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40">
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:bg-indigo-700 hover:scale-105 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                </button>
            </div>

            <AddTransactionModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    )
}
