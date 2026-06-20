import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { TransactionHistory } from '@/components/transaction-history';
import { ChartBarGroup } from '@/components/chart-bar';
import { ChartDonut } from '@/components/chart-pie';
import { Wallet, Mail, TriangleAlert, LayoutDashboard, HandCoins, ArrowLeftRight, MessageSquareText, FileCheck, Banknote, TrendingUp, PieChart, Send, CreditCard, CalendarDays, BadgeDollarSign, Loader2, CheckCircle } from 'lucide-react';
import LoanCalculator from '../../components/LoanCalculator';
import CountdownTimer from '../../components/CountdownTimer';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeLoan, setActiveLoan] = useState(null);
  const [applications, setApplications] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [applyAmount, setApplyAmount] = useState('');
  const [applyTerm, setApplyTerm] = useState('6');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchApplications();
    fetchActiveLoan();
    fetchRepaymentRequests();
  }, []);

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

  const handleRepayment = async () => {
    if (!activeLoan) return;
    try {
      await axiosInstance.post('/api/repayment/request', {
        loanId: activeLoan._id,
        amount: repaymentAmount,
      });
      setMessage({ type: 'success', text: 'Repayment request submitted. Admin will verify.' });
      setRepaymentAmount('');
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
    applications: { label: 'Applications', color: '#3b82f6' },
    repayments: { label: 'Repayments', color: '#10b981' },
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        items={navItems}
        user={user}
        role="User"
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onLogout={() => { logout(); navigate('/'); }}
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

              {activeLoan && activeLoan.status === 'approved' && (
                <Card className="shadow-sm border-0 ring-1 ring-foreground/5 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl">Active Loan</CardTitle>
                    <CardDescription className="text-sm">Your approved loan details</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-3">
                        <p className="text-xs text-emerald-700 font-medium">Amount</p>
                        <p className="text-lg font-bold text-emerald-800">${activeLoan.approvedAmount?.toLocaleString()}</p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
                        <p className="text-xs text-blue-700 font-medium">Term</p>
                        <p className="text-lg font-bold text-blue-800">{activeLoan.termMonths} months</p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-violet-50 to-violet-100 p-3">
                        <p className="text-xs text-violet-700 font-medium">Interest Rate</p>
                        <p className="text-lg font-bold text-violet-800">{activeLoan.interestRate * 100}%</p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 p-3">
                        <p className="text-xs text-amber-700 font-medium">Total to Repay</p>
                        <p className="text-lg font-bold text-amber-800">${activeLoan.totalPayable?.toLocaleString()}</p>
                      </div>
                    </div>
                    {activeLoan.withdrawalAvailableDate && (
                      <CountdownTimer targetDate={activeLoan.withdrawalAvailableDate} />
                    )}
                  </CardContent>
                </Card>
              )}

              {pendingApps > 0 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <TriangleAlert className="size-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
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
                    colors={["#8b5cf6", "#10b981", "#f59e0b"]}
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
              </div>
            </div>
          )}

          {activeTab === 'apply' && (
            <div className="max-w-3xl mx-auto w-full">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 shadow-2xl border border-emerald-500/10">
                <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative px-6 sm:px-8 py-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 shadow-lg shadow-emerald-500/25">
                      <HandCoins className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Apply for a Loan</h3>
                      <p className="text-sm text-emerald-200/70">Minimum $100,000 &ndash; Maximum $20,000,000</p>
                    </div>
                  </div>

                  <form onSubmit={handleApplyLoan} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2.5">
                        <Label className="text-sm font-medium text-emerald-200 flex items-center gap-2">
                          <BadgeDollarSign className="size-4 text-emerald-400" />
                          Loan Amount
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <span className="text-lg font-bold text-emerald-300">$</span>
                          </div>
                          <Input
                            id="amount"
                            type="number"
                            value={applyAmount}
                            onChange={(e) => setApplyAmount(e.target.value)}
                            min="100000"
                            max="20000000"
                            required
                            className="pl-10 h-12 text-lg font-semibold bg-white/5 border-emerald-400/20 text-white placeholder-emerald-300/40 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-emerald-300/60 px-1">
                          <span>Min: $100,000</span>
                          <span>Max: $20,000,000</span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Label className="text-sm font-medium text-emerald-200 flex items-center gap-2">
                          <CalendarDays className="size-4 text-emerald-400" />
                          Repayment Plan
                        </Label>
                        <Select value={applyTerm} onValueChange={setApplyTerm}>
                          <SelectTrigger className="h-12 bg-white/5 border-emerald-400/20 text-white focus-visible:ring-emerald-400 focus-visible:border-emerald-400">
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-emerald-400/20">
                            <SelectItem value="6" className="text-white focus:bg-emerald-500/20 focus:text-white">Short Term (6 months) &ndash; 7% interest</SelectItem>
                            <SelectItem value="12" className="text-white focus:bg-emerald-500/20 focus:text-white">Mid-Short Term (12 months) &ndash; 10% interest</SelectItem>
                            <SelectItem value="24" className="text-white focus:bg-emerald-500/20 focus:text-white">Long Term (24 months) &ndash; 15% interest</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          {[
                            { value: '6', label: 'Short', rate: '7%' },
                            { value: '12', label: 'Mid', rate: '10%' },
                            { value: '24', label: 'Long', rate: '15%' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setApplyTerm(opt.value)}
                              className={`flex-1 text-xs font-medium py-2 px-2 rounded-lg border transition-all duration-200 ${
                                applyTerm === opt.value
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-md'
                                  : 'bg-white/5 text-emerald-200/60 border-emerald-400/10 hover:bg-white/10 hover:border-emerald-400/30'
                              }`}
                            >
                              {opt.label}<br/><span className="opacity-70">{opt.rate}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-base rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 border-0 relative overflow-hidden group"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Send className="size-5 group-hover:translate-x-0.5 transition-transform" />
                        Submit Application
                      </span>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-700" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'repay' && (
            <div className="max-w-3xl mx-auto w-full">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 shadow-2xl border border-blue-500/10">
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative px-6 sm:px-8 py-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 shadow-lg shadow-blue-500/25">
                      <ArrowLeftRight className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Make a Repayment</h3>
                      <p className="text-sm text-blue-200/70">Submit your repayment for admin verification</p>
                    </div>
                  </div>

                  {activeLoan && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                      <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 p-3">
                        <p className="text-[10px] text-blue-300/70 font-medium uppercase tracking-wider">Approved</p>
                        <p className="text-base font-bold text-blue-300">${activeLoan.approvedAmount?.toLocaleString()}</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20 p-3">
                        <p className="text-[10px] text-cyan-300/70 font-medium uppercase tracking-wider">Remaining</p>
                        <p className="text-base font-bold text-cyan-300">${activeLoan.remainingDebt?.toLocaleString()}</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 p-3 col-span-2 sm:col-span-1">
                        <p className="text-[10px] text-violet-300/70 font-medium uppercase tracking-wider">Term</p>
                        <p className="text-base font-bold text-violet-300">{activeLoan.termMonths} months</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2.5">
                      <Label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                        <BadgeDollarSign className="size-4 text-blue-400" />
                        Amount Repaid
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <span className="text-lg font-bold text-blue-300">$</span>
                        </div>
                        <Input
                          id="repayAmount"
                          type="number"
                          value={repaymentAmount}
                          onChange={(e) => setRepaymentAmount(e.target.value)}
                          className="pl-10 h-12 text-lg font-semibold bg-white/5 border-blue-400/20 text-white placeholder-blue-300/40 focus-visible:ring-blue-400 focus-visible:border-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleRepayment}
                      disabled={!activeLoan}
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold text-base rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 border-0 relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="size-5 group-hover:scale-110 transition-transform" />
                        Submit Repayment Request
                      </span>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-700" />
                    </Button>

                    {!activeLoan && (
                      <p className="text-xs text-center text-blue-300/50">You need an active loan to make a repayment.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="max-w-3xl mx-auto w-full">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950 to-pink-950 shadow-2xl border border-purple-500/10">
                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative px-6 sm:px-8 py-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg shadow-purple-500/25">
                      <MessageSquareText className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Contact Support</h3>
                      <p className="text-sm text-purple-200/70">Send a message to the admin team</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2.5">
                      <Label className="text-sm font-medium text-purple-200 flex items-center gap-2">
                        <Mail className="size-4 text-purple-400" />
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="What is this regarding?"
                        className="h-12 bg-white/5 border-purple-400/20 text-white placeholder-purple-300/40 focus-visible:ring-purple-400 focus-visible:border-purple-400"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-sm font-medium text-purple-200 flex items-center gap-2">
                        <MessageSquareText className="size-4 text-purple-400" />
                        Message
                      </Label>
                      <Textarea
                        id="msg"
                        rows={5}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Describe your inquiry or issue..."
                        className="bg-white/5 border-purple-400/20 text-white placeholder-purple-300/40 focus-visible:ring-purple-400 focus-visible:border-purple-400 resize-none"
                      />
                    </div>

                    <Button
                      onClick={handleContact}
                      className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold text-base rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 border-0 relative overflow-hidden group"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Send className="size-5 group-hover:translate-x-0.5 transition-transform" />
                        Send Message
                      </span>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-700" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default UserDashboard;
