'use server'

import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateMonthlyReport(monthId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Fetch Month Details and Transactions
    const { data: month } = await supabase
        .from('months')
        .select('*')
        .eq('id', monthId)
        .single()

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('month_id', monthId)
        .order('transaction_date', { ascending: true })

    if (!transactions || transactions.length === 0) {
        return { report: "No transactions found for this month yet. Start spending (or saving) to see insights!" }
    }

    // 2. Format Data for AI
    const summary = transactions.map(t =>
        `- ${t.date || t.transaction_date}: ${t.type.toUpperCase()} ₦${t.amount} for ${t.description} (${t.category})`
    ).join('\n')

    const prompt = `
    Analyze the following financial transactions for the month of "${month.name}".
    Opening Balance: ₦${month.opening_balance}
    
    Transactions:
    ${summary}

    Please provide a concise but insightful financial report in Markdown format.
    Include:
    1. **Overview**: Total spent vs Total income (Net flow).
    2. **Spending Habits**: What are the top 2-3 categories taking the most money?
    3. **Observations**: Any unusual or large expenses? Recurring patterns?
    4. **Recommendation**: One actionable tip for next month based on this data.

    Keep the tone friendly, encouraging, but professional. Use emojis sparingly.
    Currency: Naira (₦).
  `

    // 3. Call Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

    try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

        const result = await model.generateContent(prompt)
        const response = await result.response
        const report = response.text()

        return { report }
    } catch (error) {
        console.error('AI Analysis Error:', error)
        return { error: 'Failed to generate report. Please try again later.' }
    }
}
