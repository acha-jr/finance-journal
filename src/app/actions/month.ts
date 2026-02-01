'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOpeningBalance(monthId: string, newBalance: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('months')
        .update({ opening_balance: newBalance })
        .eq('id', monthId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating opening balance:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function ensureCurrentMonth() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const now = new Date()
    const currentMonthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    // Check if the current month already exists
    const { data: existingMonth } = await supabase
        .from('months')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', currentMonthName)
        .single()

    if (existingMonth) {
        // Ensure it's active if it exists
        if (existingMonth.status !== 'active') {
            await supabase.from('months').update({ status: 'completed' }).eq('user_id', user.id).eq('status', 'active')
            await supabase.from('months').update({ status: 'active' }).eq('id', existingMonth.id)
        }
        return existingMonth
    }

    // If not, deactivate current active month
    await supabase
        .from('months')
        .update({ status: 'completed' })
        .eq('user_id', user.id)
        .eq('status', 'active')

    // Create new active month
    const { data: newMonth, error } = await supabase
        .from('months')
        .insert({
            user_id: user.id,
            name: currentMonthName,
            status: 'active'
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating new month:', JSON.stringify(error, null, 2))
        throw new Error(`Failed to create new month: ${error.message || 'Unknown error'}`)
    }

    return newMonth
}
