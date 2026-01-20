import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/Header'
import { TransactionList } from '@/components/dashboard/TransactionList'
import { SummaryFooter } from '@/components/dashboard/SummaryFooter'
import { MonthlyReport } from '@/components/dashboard/MonthlyReport'
import { FloatingAddButton } from '@/components/dashboard/FloatingAddButton'
import { MigrationBanner } from '@/components/dashboard/MigrationBanner'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch Active Month
  const { data: activeMonth } = await supabase
    .from('months')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Redirect to Onboarding if no active month
  if (!activeMonth) {
    redirect('/onboarding')
  }

  // Fetch Accounts
  const { data: accountsRaw } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })

  // Proper casting for the AccountData type
  const accounts = (accountsRaw || []) as any[]

  // Fetch Transactions for this month
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('month_id', activeMonth.id)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  const credits = transactions?.filter(t => t.type === 'credit') || []
  const debits = transactions?.filter(t => t.type === 'debit') || []

  // Calculate totals
  const totalCredits = credits.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalDebits = debits.reduce((sum, t) => sum + Number(t.amount), 0)

  // Total Balance is now sum of all accounts
  const currentBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900 pb-24 md:pb-6 relative">
      <DashboardHeader
        monthName={activeMonth.name}
        accounts={accounts}
        totalBalance={currentBalance}
      />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 space-y-8">
        <TransactionList type="credit" title="Money In" transactions={credits} accounts={accounts} />
        <TransactionList type="debit" title="Money Out" transactions={debits} accounts={accounts} />
      </main>

      <SummaryFooter
        totalCredits={totalCredits}
        totalDebits={totalDebits}
        currentBalance={currentBalance}
      />

      <MonthlyReport monthId={activeMonth.id} />

      <FloatingAddButton accounts={accounts} />
    </div>
  )
}
