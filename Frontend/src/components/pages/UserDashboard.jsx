import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../config/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SectionCards } from '@/components/section-cards';
import { TransactionHistory } from '@/components/transaction-history';
import { ChartArea } from '@/components/chart-area';
import { ChartBar, ChartBarGroup } from '@/components/chart-bar';
import { ChartDonut } from '@/components/chart-pie';
import { Wallet, Send, Mail, TriangleAlert, LayoutDashboard, HandCoins, ArrowLeftRight, MessageSquareText, Clock, FileCheck, Banknote, TrendingUp, PieChart, Activity } from 'lucide-react';
import LoanCalculator from '../../components/LoanCalculator';
import CountdownTimer from '../../components/CountdownTimer';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [activeLoan, setActiveLoan] = useState(null);
  const [applications, setApplications] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [externalWallet, setExternalWallet] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [applyAmount, setApplyAmount] = useState('');
  const [applyTerm, setApplyTerm] = useState('6');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentTx, setRepaymentTx] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    fetchApplications();
    fetchActiveLoan();
    fetchRepaymentRequests();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axiosInstance.get('/api/user/dashboard');
      setExternalWallet(res.data.user.externalWalletAddress || '');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axiosInstance.get('/api/loan/my-applications');
      setApplications(res.data);
    } catch (err) {}
  };

  const fetchActiveLoan = async () => {
    try {
      const res = await axiosInstance.get('/api/loan/my-loan');
      setActiveLoan(res.data);
    } catch (err) {}
  };

  const fetchRepaymentRequests = async () => {
    try {
      const res = await axiosInstance.get('/api/repayment/my-requests');
      setRepayments(res.data);
    } catch (err) {}
  };

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/loan/apply', { amount: applyAmount, termMonths: Number(applyTerm), purpose: 'Investment' });
      setMessage({ type: 'success', text: 'Loan application submitted!' });
      fetchApplications();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' });
    }
  };

  const handleUpdateWallet = async () => {
    try {
      await axiosInstance.put('/api/user/wallet-address', { externalWalletAddress: externalWallet });
      setMessage({ type: 'success', text: 'Wallet address updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Update failed' });
    }
  };

  const handleTransfer = async () => {
    try {
      const res = await axiosInstance.post('/api/user/transfer-to-wallet');
      setMessage({ type: 'success', text: res.data.message });
      fetchDashboardData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message });
    }
  };

  const handleRepayment = async () => {
    if (!activeLoan) return;
    try {
      await axiosInstance.post('/api/repayment/request', {
        loanId: activeLoan._id,
        amount: repaymentAmount,
        transactionHash: repaymentTx
      });
      setMessage({ type: 'success', text: 'Repayment request submitted. Admin will verify.' });
      setRepaymentAmount('');
      setRepaymentTx('');
      fetchRepaymentRequests();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message });
    }
  };

  const handleContact = async () => {
    try {
      await axiosInstance.post('/api/user/contact-admin', { subject: contactSubject, message: contactMessage });
      setMessage({ type: 'success', text: 'Email sent to admin!' });
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send email' });
    }
  };

  const repaymentAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9';
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const approvedApps = applications.filter(a => a.status === 'approved').length;
  const totalRepaid = repayments.filter(r => r.status === 'received').reduce((s, r) => s + r.amount, 0);
  const totalRepaymentPending = repayments.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'apply', label: 'Apply for Loan', icon: HandCoins },
    { id: 'repay', label: 'Repayment', icon: ArrowLeftRight },
    { id: 'contact', label: 'Contact Admin', icon: MessageSquareText },
  ];

  const sectionCards = [
    {
      label: 'Available Balance',
      value: `$${user?.walletBalance?.toLocaleString() || 0}`,
      icon: Wallet,
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Applications',
      value: applications.length,
      icon: FileCheck,
      sub: `${pendingApps} pending`,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Active Loan',
      value: activeLoan ? `$${activeLoan.approvedAmount?.toLocaleString()}` : 'No active loan',
      icon: Banknote,
      gradient: 'from-violet-500 to-violet-600',
    },
    {
      label: 'Total Repaid',
      value: `$${totalRepaid.toLocaleString()}`,
      icon: TrendingUp,
      gradient: 'from-amber-500 to-amber-600',
    },
  ];

  const monthlyActivity = useMemo(() => {
    const months = {}
    const addToMonth = (dateStr, key) => {
      const d = new Date(dateStr)
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!months[m]) months[m] = { name: m, applications: 0, repayments: 0 }
      months[m][key]++
    }
    applications?.forEach(a => addToMonth(a.createdAt, 'applications'))
    repayments?.forEach(r => addToMonth(r.createdAt, 'repayments'))
    return Object.values(months).sort((a, b) => a.name.localeCompare(b.name)).slice(-6)
  }, [applications, repayments])

  const portfolioData = useMemo(() => {
    const data = []
    if (activeLoan?.approvedAmount) {
      data.push({ name: 'Loan Amount', value: activeLoan.approvedAmount - totalRepaid })
      data.push({ name: 'Repaid', value: totalRepaid })
      data.push({ name: 'Pending Repayment', value: totalRepaymentPending })
    }
    return data
  }, [activeLoan, totalRepaid, totalRepaymentPending])

  const barChartConfig = {
    applications: { label: 'Applications', color: 'hsl(var(--primary))' },
    repayments: { label: 'Repayments', color: 'hsl(var(--chart-2))' },
  }

  const gradientCards = [
    { title: 'Total Balance', value: `$${user?.walletBalance?.toLocaleString() || 0}`, gradient: 'from-emerald-600 to-emerald-400', icon: Wallet },
    { title: 'Total Spent', value: `$${totalRepaid.toLocaleString()}`, gradient: 'from-blue-600 to-blue-400', icon: TrendingUp },
  ]

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        items={navItems}
        user={user}
        role="User"
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onLogout={logout}
      />
      <SidebarInset className="text-left">
        <SiteHeader
          section="Dashboard"
          page={navItems.find(n => n.id === activeTab)?.label}
          user={user}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {message.text && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="[&>svg]:text-foreground">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4 md:gap-6">

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {sectionCards.map((card, i) => (
                  <Card key={i} className={`bg-gradient-to-br ${card.gradient} text-white border-0 shadow-sm`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-white/80">{card.label}</CardTitle>
                      <card.icon className="size-4 text-white/60" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                      {card.sub && <p className="text-xs text-white/70 mt-1">{card.sub}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {activeLoan && activeLoan.status === 'approved' && !activeLoan.withdrawnToWallet && (
                <Card className="shadow-sm border-0 ring-1 ring-foreground/5 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl">Active Loan</CardTitle>
                    <CardDescription className="text-sm">Your approved loan details</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-950/20 p-3">
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Amount</p>
                        <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">${activeLoan.approvedAmount?.toLocaleString()}</p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-950/20 p-3">
                        <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Term</p>
                        <p className="text-lg font-bold text-blue-800 dark:text-blue-300">{activeLoan.termMonths} months</p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-950/20 p-3">
                        <p className="text-xs text-violet-700 dark:text-violet-400 font-medium">Interest Rate</p>
                        <p className="text-lg font-bold text-violet-800 dark:text-violet-300">{activeLoan.interestRate * 100}%</p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-950/20 p-3">
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Total to Repay</p>
                        <p className="text-lg font-bold text-amber-800 dark:text-amber-300">${activeLoan.totalPayable?.toLocaleString()}</p>
                      </div>
                    </div>
                    <CountdownTimer targetDate={activeLoan.withdrawalAvailableDate} />
                    {new Date() >= new Date(activeLoan.withdrawalAvailableDate) && (
                      <Button onClick={handleTransfer} className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white border-0">
                        <Send className="mr-2 size-4" /> Transfer to Wallet
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {pendingApps > 0 && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                  <TriangleAlert className="size-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-300">
                    Your loan application is pending review. You will be notified when approved.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
                <ChartBarGroup
                  title="Monthly Activity"
                  description="Your applications and repayments over time"
                  data={monthlyActivity.length > 0 ? monthlyActivity : [{ name: 'No data', applications: 0, repayments: 0 }]}
                  config={barChartConfig}
                  height={280}
                />
                {portfolioData.length > 0 ? (
                  <ChartDonut
                    title="Portfolio Breakdown"
                    description="Loan amount vs repaid vs pending"
                    data={portfolioData}
                    nameKey="name"
                    valueKey="value"
                    colors={["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"]}
                    height={280}
                  />
                ) : (
                  <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
                    <CardHeader className="p-4 md:p-6">
                      <CardTitle className="text-lg md:text-xl">Portfolio Overview</CardTitle>
                      <CardDescription className="text-sm">Start your loan journey to see insights</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0 md:pt-0 flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <PieChart className="size-10 mb-3 opacity-30" />
                      <p className="text-sm">No active loans</p>
                      <p className="text-xs mt-1">Apply for a loan to see your portfolio breakdown</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <TransactionHistory
                applications={applications}
                repayments={repayments}
                activeLoan={activeLoan}
                user={user}
              />

              <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
                <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl">Loan Calculator</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <LoanCalculator />
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
                  <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl">Wallet Settings</CardTitle>
                    <CardDescription className="text-sm">Set your external crypto address for withdrawals</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="wallet">External Wallet Address</Label>
                      <Input id="wallet" value={externalWallet} onChange={(e) => setExternalWallet(e.target.value)} placeholder="0x..." />
                    </div>
                    <Button onClick={handleUpdateWallet} className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white border-0">Update Wallet</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'apply' && (
            <Card className="shadow-sm border-0 ring-1 ring-foreground/5 max-w-2xl">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Apply for a Loan</CardTitle>
                <CardDescription className="text-sm">Minimum $100,000 &ndash; Maximum $20,000,000</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <form onSubmit={handleApplyLoan} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input id="amount" type="number" value={applyAmount} onChange={(e) => setApplyAmount(e.target.value)} min="100000" max="20000000" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="term">Repayment Plan</Label>
                    <Select value={applyTerm} onValueChange={setApplyTerm}>
                      <SelectTrigger id="term"><SelectValue placeholder="Select term" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">Short Term (6 months) &ndash; 7% interest</SelectItem>
                        <SelectItem value="12">Mid-Short Term (12 months) &ndash; 10% interest</SelectItem>
                        <SelectItem value="24">Long Term (24 months) &ndash; 15% interest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0">Submit Application</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'repay' && (
            <Card className="shadow-sm border-0 ring-1 ring-foreground/5 max-w-2xl">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Make a Repayment</CardTitle>
                <CardDescription className="text-sm">Send crypto to the address below and submit the transaction hash</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                <div className="rounded-lg bg-gradient-to-br from-muted to-muted/50 p-3 md:p-4 border">
                  <p className="text-xs md:text-sm font-medium mb-2 text-muted-foreground">Repayment Crypto Address:</p>
                  <code className="block bg-background text-primary p-2 md:p-3 rounded text-xs md:text-sm break-all border font-mono">{repaymentAddress}</code>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repayAmount">Amount Repaid ($)</Label>
                  <Input id="repayAmount" type="number" value={repaymentAmount} onChange={(e) => setRepaymentAmount(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="txHash">Transaction Hash</Label>
                  <Input id="txHash" value={repaymentTx} onChange={(e) => setRepaymentTx(e.target.value)} placeholder="0x..." />
                </div>
                <Button onClick={handleRepayment} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">Submit Repayment Request</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'contact' && (
            <Card className="shadow-sm border-0 ring-1 ring-foreground/5 max-w-2xl">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Contact Support</CardTitle>
                <CardDescription className="text-sm">Send a message to the admin team</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="msg">Message</Label>
                  <Textarea id="msg" rows={4} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} />
                </div>
                <Button onClick={handleContact} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  <Mail className="mr-2 size-4" /> Send Email
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default UserDashboard;
