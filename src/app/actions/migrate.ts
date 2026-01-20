'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function migrateToAccounts() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Check if any accounts exist already
    const { count } = await supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    if (count && count > 0) {
        return { error: 'Migration already done or accounts exist.' }
    }

    // 2. Calculate Current Global Balance
    // We need the active month's opening balance + all transactions ever (or just this month? technically effectively current balance)
    // Simpler approach: Get the "Active Month" opening balance, and apply all transactions linked to it.

    const { data: activeMonth } = await supabase
        .from('months')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

    if (!activeMonth) {
        // Fallback if no active month, just start fresh
        await supabase.from('accounts').insert({
            user_id: user.id,
            name: 'Main Account',
            type: 'bank',
            balance: 0,
            is_default: true
        })
        return { success: true, message: 'Created empty Main Account' }
    }

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('month_id', activeMonth.id)

    const totalCredits = transactions?.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const totalDebits = transactions?.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const currentBalance = Number(activeMonth.opening_balance) + totalCredits - totalDebits

    // 3. Create Main Account
    const { data: newAccount, error: createError } = await supabase
        .from('accounts')
        .insert({
            user_id: user.id,
            name: 'Main Account',
            type: 'bank',
            balance: currentBalance, // Set current real balance
            is_default: true,
            color: 'bg-indigo-600'
        })
        .select()
        .single()

    if (createError || !newAccount) throw new Error(createError?.message || 'Failed to create account')

    // 4. Link ALL existing transactions to this account
    // (Even past months? Ideally yes, but for now let's ensure at least the active month is linked)
    const { error: updateError } = await supabase
        .from('transactions')
        .update({ account_id: newAccount.id })
        .eq('user_id', user.id) // Update ALL user transactions
        .is('account_id', null)  // Only those not linked

    if (updateError) throw new Error(updateError.message)

    revalidatePath('/')
    return { success: true }
}
