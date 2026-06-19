import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../config/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Send, Mail, LogOut, TriangleAlert, LayoutDashboard, HandCoins, ArrowLeftRight, MessageSquareText, User, Clock, FileCheck, Banknote, Menu } from 'lucide-react';
import LoanCalculator from '../../components/LoanCalculator';
import CountdownTimer from '../../components/CountdownTimer';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [loan, setLoan] = useState(null);
  const [activeLoan, setActiveLoan] = useState(null);
  const [applications, setApplications] = useState([]);
  const [externalWallet, setExternalWallet] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [applyAmount, setApplyAmount] = useState('');
  const [applyTerm, setApplyTerm] = useState('6');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentTx, setRepaymentTx] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchApplications();
    fetchActiveLoan();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axiosInstance.get('/api/user/dashboard');
      setLoan(res.data.loan);
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

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'apply', label: 'Apply for Loan', icon: HandCoins },
    { id: 'repay', label: 'Repayment', icon: ArrowLeftRight },
    { id: 'contact', label: 'Contact Admin', icon: MessageSquareText },
  ];

  const sidebar = (
    <aside className="w-64 lg:w-72 border-r bg-card flex flex-col h-full">
      <div className="p-4 md:p-5 border-b">
        <div className="flex items-center gap-3">
          <div className="size-9 md:size-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-lg md:text-xl">S</span>
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground">Sedgwiick</h1>
            <p className="text-[11px] md:text-xs text-muted-foreground">Client Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        <Card className="shadow-none">
          <CardContent className="p-3 md:p-4 flex items-center gap-3">
            <div className="size-10 md:size-12 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="size-5 md:size-6 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <Badge variant="outline" className="mt-1.5 text-[10px] md:text-[11px] h-5">User</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-1 md:pt-2 space-y-2.5 md:space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Wallet className="size-3.5 md:size-4 text-muted-foreground shrink-0" />
                <span className="text-[11px] md:text-xs text-muted-foreground truncate">Balance</span>
              </div>
              <span className="text-sm font-semibold text-foreground">${user?.walletBalance?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck className="size-3.5 md:size-4 text-muted-foreground shrink-0" />
                <span className="text-[11px] md:text-xs text-muted-foreground truncate">Applications</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{applications.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="size-3.5 md:size-4 text-muted-foreground shrink-0" />
                <span className="text-[11px] md:text-xs text-muted-foreground truncate">Pending</span>
              </div>
              <Badge variant={pendingApps > 0 ? 'warning' : 'outline'} className="text-[10px] h-5 px-1.5 shrink-0">{pendingApps}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Banknote className="size-3.5 md:size-4 text-muted-foreground shrink-0" />
                <span className="text-[11px] md:text-xs text-muted-foreground truncate">Active Loan</span>
              </div>
              <Badge variant={activeLoan ? 'success' : 'outline'} className="text-[10px] h-5 px-1.5 shrink-0">{activeLoan ? 'Yes' : 'No'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Navigation</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-1 md:pt-2 space-y-0.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-3 md:p-4">
            <Button variant="outline" size="sm" className="w-full" onClick={logout}>
              <LogOut className="mr-2 size-3.5 md:size-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex text-left">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:z-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebar}
      </div>

      <div className="hidden lg:block">{sidebar}</div>

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-14 md:h-16">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setSidebarOpen(true)}>
                <Menu className="size-5" />
              </Button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                <LayoutDashboard className="size-4 shrink-0" />
                <span className="truncate">Dashboard / <span className="text-foreground font-medium">{navItems.find(n => n.id === activeTab)?.label}</span></span>
              </div>
              <div className="sm:hidden flex items-center gap-1.5 min-w-0">
                <div className="size-7 rounded-md bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-bold text-xs">S</span>
                </div>
                <span className="text-sm font-semibold text-foreground truncate">Sedgwiick</span>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <span className="hidden md:inline text-sm text-muted-foreground truncate max-w-[160px]">Welcome, {user?.name}</span>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex text-muted-foreground" onClick={logout}>
                <LogOut className="mr-1.5 size-4" /> Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
          {message.text && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="[&>svg]:text-foreground">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {activeTab === 'overview' && (
            <>
              <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-sm">
                <CardContent className="flex justify-between items-center p-4 md:p-6">
                  <div>
                    <p className="text-xs md:text-sm opacity-90">Available Balance</p>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-bold mt-1">${user?.walletBalance?.toLocaleString()}</p>
                  </div>
                  <Wallet size={40} className="md:size-12 opacity-80 shrink-0" />
                </CardContent>
              </Card>

              <div className="grid gap-4 md:gap-6">
                {activeLoan && activeLoan.status === 'approved' && !activeLoan.withdrawnToWallet && (
                  <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
                    <CardHeader className="p-4 md:p-6">
                      <CardTitle className="text-lg md:text-xl">Active Loan</CardTitle>
                      <CardDescription className="text-sm">Your approved loan details</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="text-base md:text-lg font-semibold">${activeLoan.approvedAmount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Term</p>
                          <p className="text-base md:text-lg font-semibold">{activeLoan.termMonths} months</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Interest Rate</p>
                          <p className="text-base md:text-lg font-semibold">{activeLoan.interestRate * 100}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total to Repay</p>
                          <p className="text-base md:text-lg font-semibold">${activeLoan.totalPayable?.toLocaleString()}</p>
                        </div>
                      </div>
                      <CountdownTimer targetDate={activeLoan.withdrawalAvailableDate} />
                      {new Date() >= new Date(activeLoan.withdrawalAvailableDate) && (
                        <Button onClick={handleTransfer} className="w-full">
                          <Send className="mr-2 size-4" /> Transfer to Wallet
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {pendingApps > 0 && (
                  <Alert>
                    <TriangleAlert className="size-4" />
                    <AlertDescription>
                      Your loan application is pending review. You will be notified when approved.
                    </AlertDescription>
                  </Alert>
                )}

                <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl">Loan Calculator</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <LoanCalculator />
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl">Crypto Wallet Settings</CardTitle>
                    <CardDescription className="text-sm">Set your external wallet address for withdrawals</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="wallet">Wallet Address</Label>
                      <Input id="wallet" value={externalWallet} onChange={(e) => setExternalWallet(e.target.value)} placeholder="0x..." />
                    </div>
                    <Button onClick={handleUpdateWallet}>Update Wallet</Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'apply' && (
            <Card className="shadow-sm border-0 ring-1 ring-foreground/5 max-w-2xl">
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
                  <Button type="submit" className="w-full sm:w-auto">Submit Application</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'repay' && (
            <Card className="shadow-sm border-0 ring-1 ring-foreground/5 max-w-2xl">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Make a Repayment</CardTitle>
                <CardDescription className="text-sm">Send crypto to the address below and submit the transaction hash</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
                <div className="rounded-lg bg-muted p-3 md:p-4">
                  <p className="text-xs md:text-sm font-medium mb-2">Repayment Crypto Address:</p>
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
                <Button onClick={handleRepayment} className="w-full sm:w-auto">Submit Repayment Request</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'contact' && (
            <Card className="shadow-sm border-0 ring-1 ring-foreground/5 max-w-2xl">
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
                <Button onClick={handleContact} className="w-full sm:w-auto">
                  <Mail className="mr-2 size-4" /> Send Email
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
