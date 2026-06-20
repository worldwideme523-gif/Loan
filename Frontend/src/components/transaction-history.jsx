import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowUpRight, ArrowDownLeft, Banknote, CheckCircle2, Clock, XCircle, Wallet, Send, FileText, RefreshCw } from 'lucide-react'

const typeConfig = {
  loan_approved: { icon: CheckCircle2, label: 'Loan Approved', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  repayment: { icon: ArrowUpRight, label: 'Repayment', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  repayment_received: { icon: CheckCircle2, label: 'Repayment Received', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  wallet_transfer: { icon: Send, label: 'Wallet Withdrawal', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  funds_added: { icon: Wallet, label: 'Funds Added', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  loan_applied: { icon: FileText, label: 'Loan Application', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
}

function buildTransactions({ applications, repayments, activeLoan, user }) {
  const txs = []

  applications?.forEach(app => {
    if (app.status === 'approved') {
      txs.push({
        id: `app-approved-${app._id}`,
        date: app.updatedAt || app.createdAt,
        type: 'loan_approved',
        amount: app.amount,
        status: 'completed',
        description: `Loan of $${app.amount?.toLocaleString()} approved`,
      })
    } else if (app.status === 'pending') {
      txs.push({
        id: `app-pending-${app._id}`,
        date: app.createdAt,
        type: 'loan_applied',
        amount: app.amount,
        status: 'pending',
        description: `Loan application for $${app.amount?.toLocaleString()}`,
      })
    }
  })

  if (activeLoan && activeLoan.withdrawnToWallet) {
    txs.push({
      id: `transfer-${activeLoan._id}`,
      date: activeLoan.updatedAt || activeLoan.approvalDate,
      type: 'wallet_transfer',
      amount: activeLoan.approvedAmount,
      status: 'completed',
      description: `Withdrew $${activeLoan.approvedAmount?.toLocaleString()} to wallet`,
    })
  }

  repayments?.forEach(r => {
    txs.push({
      id: `repay-${r._id}`,
      date: r.createdAt,
      type: r.status === 'received' ? 'repayment_received' : 'repayment',
      amount: r.amount,
      status: r.status === 'received' ? 'completed' : r.status === 'pending' ? 'pending' : 'failed',
      description: `Repayment of $${r.amount?.toLocaleString()}${r.status === 'received' ? ' received' : ' pending verification'}`,
    })
  })

  if (user?.walletBalance > 0 && !txs.some(t => t.type === 'funds_added')) {
  }

  return txs.sort((a, b) => new Date(b.date) - new Date(a.date))
}

function StatusBadge({ status }) {
  const map = {
    completed: { label: 'Completed', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    failed: { label: 'Failed', variant: 'destructive' },
  }
  const s = map[status] || map.pending
  return <Badge variant={s.variant} className="text-[10px] h-5 px-1.5">{s.label}</Badge>
}

export function TransactionHistory({ applications, repayments, activeLoan, user }) {
  const [showAll, setShowAll] = useState(false)
  const transactions = useMemo(() => buildTransactions({ applications, repayments, activeLoan, user }), [applications, repayments, activeLoan, user])
  const displayed = showAll ? transactions : transactions.slice(0, 5)

  if (transactions.length === 0) {
    return (
      <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Transaction History</CardTitle>
          <CardDescription className="text-sm">Your recent financial activity</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <RefreshCw className="size-8 mb-3 opacity-40" />
            <p className="text-sm">No transactions yet</p>
            <p className="text-xs mt-1">Your financial activity will appear here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg md:text-xl">Transaction History</CardTitle>
            <CardDescription className="text-sm">Your recent financial activity</CardDescription>
          </div>
          <Badge variant="secondary" className="text-[10px] h-5">{transactions.length} total</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-t md:border-t-0">
                <TableHead className="px-4 md:px-6 py-3">Type</TableHead>
                <TableHead className="px-4 md:px-6 py-3 text-right">Amount</TableHead>
                <TableHead className="px-4 md:px-6 py-3 hidden sm:table-cell">Date</TableHead>
                <TableHead className="px-4 md:px-6 py-3">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map(tx => {
                const cfg = typeConfig[tx.type] || typeConfig.loan_applied
                const Icon = cfg.icon
                const isCredit = tx.type === 'loan_approved' || tx.type === 'repayment_received' || tx.type === 'funds_added'
                return (
                  <TableRow key={tx.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="px-4 md:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                          <Icon className={`size-4 ${cfg.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{cfg.label}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-[300px]">{tx.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={`px-4 md:px-6 py-3 text-sm font-medium text-right ${isCredit ? 'text-emerald-600' : ''}`}>
                      {isCredit ? '+' : '-'}${tx.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 md:px-6 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {new Date(tx.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 md:px-6 py-3">
                      <StatusBadge status={tx.status} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        {transactions.length > 5 && (
          <div className="px-4 md:px-6 py-3 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Show Less' : `View All ${transactions.length} Transactions`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
