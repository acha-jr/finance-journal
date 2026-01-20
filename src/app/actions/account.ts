'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AccountData {
    id: string
    name: string
    type: 'bank' | 'mobile_money' | 'cash' | 'savings' | 'other'
    balance: number
    color?: string
    is_default: boolean
}

export async function getAccounts() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })

    return data as AccountData[]
}

export async function createAccount(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const balance = parseFloat(formData.get('balance') as string)
    const isDefault = formData.get('is_default') === 'on'

    if (!name || isNaN(balance)) {
        throw new Error('Invalid input')
    }

    // If setting as default, unset others
    if (isDefault) {
        await supabase
            .from('accounts')
            .update({ is_default: false })
            .eq('user_id', user.id)
    }

    const { error } = await supabase.from('accounts').insert({
        user_id: user.id,
        name,
        type,
        balance,
        is_default: isDefault
    })

    if (error) throw new Error(error.message)

    revalidatePath('/')
    return { success: true }
}

export async function updateAccount(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const balance = parseFloat(formData.get('balance') as string)
    const isDefault = formData.get('is_default') === 'on'

    if (!id || !name || isNaN(balance)) {
        throw new Error('Invalid input')
    }

    if (isDefault) {
        await supabase
            .from('accounts')
            .update({ is_default: false })
            .eq('user_id', user.id)
    }

    const { error } = await supabase
        .from('accounts')
        .update({ name, type, balance, is_default: isDefault })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)

    revalidatePath('/')
    return { success: true }
}

export async function deleteAccount(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Set associated transactions to NULL (keep history, but detach)
    await supabase.from('transactions').update({ account_id: null }).eq('account_id', id)

    const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)

    revalidatePath('/')
    return { success: true }
}
