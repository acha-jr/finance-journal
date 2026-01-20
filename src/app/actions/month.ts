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
