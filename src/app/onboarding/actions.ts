'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function completeOnboarding(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const balance = parseFloat(formData.get('balance') as string)
    const monthStr = formData.get('month') as string // "2025-12"

    if (isNaN(balance) || !monthStr) {
        // validation error
        throw new Error('Invalid input')
    }

    // Create the first month
    // We use the start of the month as the reference
    const [year, month] = monthStr.split('-')
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })

    const { error } = await supabase.from('months').insert({
        user_id: user.id,
        name: monthName, // "December 2025"
        opening_balance: balance,
        closing_balance: balance, // Starts same as opening
        status: 'active'
    })

    if (error) {
        console.error('Onboarding error:', error)
        throw new Error(error.message)
    }

    revalidatePath('/')
    redirect('/')
}
