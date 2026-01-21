'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface TransactionData {
    type: 'credit' | 'debit'
    amount: number
    description: string
    category: string
    date?: string
}

export async function addTransaction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get active month
    const { data: activeMonth } = await supabase
        .from('months')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

    if (!activeMonth) throw new Error('No active month found')

    const type = formData.get('type') as 'credit' | 'debit'
    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string
    const category = formData.get('category') as string || 'Misc'
    const date = formData.get('date') as string || new Date().toISOString().split('T')[0]
    const accountId = formData.get('accountId') as string

    if (!accountId) throw new Error('Account ID is required')

    // 1. Insert the transaction
    const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        month_id: activeMonth.id,
        account_id: accountId,
        type,
        amount,
        description,
        category,
        transaction_date: date
    })

    if (error) {
        console.error('Error adding transaction:', error)
        return { error: error.message }
    }

    // 2. Update Account Balance
    // Credit (income) adds to balance, Debit (expense) subtracts
    const balanceChange = type === 'credit' ? amount : -amount

    const { data: account } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', accountId)
        .single()

    if (account) {
        await supabase
            .from('accounts')
            .update({ balance: Number(account.balance) + balanceChange })
            .eq('id', accountId)
    }

    revalidatePath('/')
    return { success: true }
}

export async function updateTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const id = formData.get('id') as string
    if (!id) throw new Error('Transaction ID required')

    const type = formData.get('type') as 'credit' | 'debit'
    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string
    const category = formData.get('category') as string || 'Misc'
    const date = formData.get('date') as string
    const accountId = formData.get('accountId') as string

    // 1. Get the old transaction to revert its effect on balance
    const { data: oldTx } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single()

    if (!oldTx) throw new Error('Transaction not found')

    // 2. Revert old balance (on old account)
    if (oldTx.account_id) {
        const oldBalanceChange = oldTx.type === 'credit' ? -Number(oldTx.amount) : Number(oldTx.amount)
        const { data: oldAccount } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', oldTx.account_id)
            .single()

        if (oldAccount) {
            await supabase
                .from('accounts')
                .update({ balance: Number(oldAccount.balance) + oldBalanceChange })
                .eq('id', oldTx.account_id)
        }
    }

    // 3. Update the transaction
    const { error } = await supabase
        .from('transactions')
        .update({
            type,
            amount,
            description,
            category,
            transaction_date: date,
            account_id: accountId
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating transaction:', error)
        return { error: error.message }
    }

    // 4. Apply new balance (on new account)
    if (accountId) {
        const newBalanceChange = type === 'credit' ? amount : -amount
        const { data: newAccount } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', accountId)
            .single()

        if (newAccount) {
            await supabase
                .from('accounts')
                .update({ balance: Number(newAccount.balance) + newBalanceChange })
                .eq('id', accountId)
        }
    }

    revalidatePath('/')
    return { success: true }
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Get the transaction to revert its effect on balance
    const { data: tx } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single()

    if (!tx) throw new Error('Transaction not found')

    // 2. Revert the balance
    if (tx.account_id) {
        const balanceChange = tx.type === 'credit' ? -Number(tx.amount) : Number(tx.amount)
        const { data: account } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', tx.account_id)
            .single()

        if (account) {
            await supabase
                .from('accounts')
                .update({ balance: Number(account.balance) + balanceChange })
                .eq('id', tx.account_id)
        }
    }

    // 3. Delete the transaction
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting transaction:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function parseTransaction(text: string): Promise<TransactionData> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

    const genAI = new GoogleGenerativeAI(apiKey)
    // Using gemini-2.0-flash-exp as requested for better reasoning
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp', generationConfig: { responseMimeType: "application/json" } })

    const prompt = `
    You are a financial assistant parsing transaction texts for a user in Nigeria.
    Extract transaction details from the following text: "${text}"
    
    Return a JSON object with:
    - type: "credit" (income/deposit) or "debit" (expense/withdrawal).
    - amount: number (numeric value only, no currency symbols).
    - description: string. CRITICAL: Extract the VENDOR (e.g., Spotify, Uber, Bolt) or the PURPOSE (e.g., Airtime, Food). Do NOT include generic phrases like "debited for", "paid to". Keep it short and title case.
    - category: string (Start with one of: Food, Transport, Subscriptions, Family, Data/Airtime, Salary, Business, Shopping. Use "Misc" if standard ones don't fit).
    - date: string (YYYY-MM-DD format). Default to "${new Date().toISOString().split('T')[0]}" if no specific date is mentioned.
    
    Examples:
    - "Paid 4500 for bolt" -> { "type": "debit", "amount": 4500, "description": "Bolt Ride", "category": "Transport", ... }
    - "got debited 800 for my spotify sub" -> { "type": "debit", "amount": 800, "description": "Spotify Subscription", "category": "Subscriptions", ... }
    - "Received 50k from Ubong" -> { "type": "credit", "amount": 50000, "description": "From Ubong", "category": "Salary", ... }
    - "Bought airtime 2k" -> { "type": "debit", "amount": 2000, "description": "Airtime Purchase", "category": "Data/Airtime", ... }
  `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const jsonString = response.text()
        const data = JSON.parse(jsonString)

        return {
            type: data.type || 'debit',
            amount: Number(data.amount) || 0,
            description: data.description || 'Unknown transaction',
            category: data.category || 'Misc',
            date: data.date || new Date().toISOString().split('T')[0]
        }
    } catch (error) {
        console.error('Gemini parsing error:', error)
        // Fallback to basic regex if AI fails
        const amountMatch = text.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/)
        const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : 0
        return {
            type: 'debit',
            amount,
            description: text.substring(0, 20),
            category: 'Misc',
            date: new Date().toISOString().split('T')[0]
        }
    }
}
