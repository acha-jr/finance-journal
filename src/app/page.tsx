import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureCurrentMonth } from '@/app/actions/month'
import Loading from '@/app/loading'
import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/Header'
import { TransactionList } from '@/components/dashboard/TransactionList'
import { SummaryFooter } from '@/components/dashboard/SummaryFooter'
import { MonthlyReport } from '@/components/dashboard/MonthlyReport'
import { FloatingAddButton } from '@/components/dashboard/FloatingAddButton'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { monthId } = await searchParams

  // Use monthId or 'default' as key to reset Suspense boundary on navigation
  const suspenseKey = Array.isArray(monthId) ? monthId[0] : monthId || 'default'

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900 pb-24 md:pb-6 relative">
      <Suspense key={suspenseKey} fallback={<Loading />}>
        <DashboardFetcher monthId={monthId} />
      </Suspense>
    </div>
  )
}

async function DashboardFetcher({ monthId }: { monthId?: string | string[] }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ensure correct month is active based on real time
  await ensureCurrentMonth()

  // Fetch target month (or active if no ID provided)
  let activeMonth

  const targetId = Array.isArray(monthId) ? monthId[0] : monthId

  if (targetId) {
    const { data } = await supabase
      .from('months')
      .select('*')
      .eq('id', targetId)
      .single()
    activeMonth = data
  } else {
    // Default to active month
    const { data } = await supabase
      .from('months')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    activeMonth = data
  }

  // Redirect to Onboarding if no active month found at all
  if (!activeMonth) {
    redirect('/onboarding')
  }

  // Fetch Neighboring Months for Navigation
  const { data: allMonths } = await supabase
    .from('months')
    .select('id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) // Newest first

  const sortedMonths = (allMonths || []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // Oldest to Newest
  const currentIndex = sortedMonths.findIndex(m => m.id === activeMonth.id)

  const prevMonthId = currentIndex > 0 ? sortedMonths[currentIndex - 1].id : null
  const nextMonthId = currentIndex < sortedMonths.length - 1 ? sortedMonths[currentIndex + 1].id : null

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
    <>
      <DashboardHeader
        monthName={activeMonth.name}
        accounts={accounts}
        totalBalance={currentBalance}
        prevMonthId={prevMonthId}
        nextMonthId={nextMonthId}
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

      <MonthlyReport monthId={activeMonth.id} initialReport={activeMonth.report} />

      <FloatingAddButton accounts={accounts} />
    </>
  )
}
