import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../config/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Send, Mail, CreditCard, Clock, LogOut, Banknote, TriangleAlert } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-full flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">Sedgwiick</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 size-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {message.text && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="flex justify-between items-center p-6">
            <div>
              <p className="text-sm opacity-90">Available Balance</p>
              <p className="text-3xl font-bold">${user?.walletBalance?.toLocaleString()}</p>
            </div>
            <Wallet size={48} className="opacity-80" />
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6 w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="apply">Apply for Loan</TabsTrigger>
            <TabsTrigger value="repay">Repayment</TabsTrigger>
            <TabsTrigger value="contact">Contact Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {activeLoan && activeLoan.status === 'approved' && !activeLoan.withdrawnToWallet && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Loan</CardTitle>
                  <CardDescription>Your approved loan details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold">${activeLoan.approvedAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Term</p>
                      <p className="text-lg font-semibold">{activeLoan.termMonths} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="text-lg font-semibold">{activeLoan.interestRate * 100}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total to Repay</p>
                      <p className="text-lg font-semibold">${activeLoan.totalPayable?.toLocaleString()}</p>
                    </div>
                  </div>
                  <CountdownTimer targetDate={activeLoan.withdrawalAvailableDate} />
                  {new Date() >= new Date(activeLoan.withdrawalAvailableDate) && (
                    <Button onClick={handleTransfer} className="w-full mt-2">
                      <Send className="mr-2 size-4" /> Transfer to Wallet
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {applications.filter(a => a.status === 'pending').length > 0 && (
              <Alert>
                <TriangleAlert className="size-4" />
                <AlertDescription>
                  Your loan application is pending review. You will be notified when approved.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Loan Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <LoanCalculator />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crypto Wallet Settings</CardTitle>
                <CardDescription>Set your external wallet address for withdrawals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="wallet">Wallet Address</Label>
                  <Input
                    id="wallet"
                    value={externalWallet}
                    onChange={(e) => setExternalWallet(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <Button onClick={handleUpdateWallet}>Update Wallet</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apply">
            <Card>
              <CardHeader>
                <CardTitle>Apply for a Loan</CardTitle>
                <CardDescription>Minimum $100,000 &ndash; Maximum $20,000,000</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleApplyLoan} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={applyAmount}
                      onChange={(e) => setApplyAmount(e.target.value)}
                      min="100000"
                      max="20000000"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="term">Repayment Plan</Label>
                    <Select value={applyTerm} onValueChange={setApplyTerm}>
                      <SelectTrigger id="term">
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">Short Term (6 months) &ndash; 7% interest</SelectItem>
                        <SelectItem value="12">Mid-Short Term (12 months) &ndash; 10% interest</SelectItem>
                        <SelectItem value="24">Long Term (24 months) &ndash; 15% interest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit">Submit Application</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="repay">
            <Card>
              <CardHeader>
                <CardTitle>Make a Repayment</CardTitle>
                <CardDescription>Send crypto to the address below and submit the transaction hash</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium mb-2">Repayment Crypto Address:</p>
                  <code className="block bg-background text-primary p-2 rounded text-sm break-all border">{repaymentAddress}</code>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repayAmount">Amount Repaid ($)</Label>
                  <Input
                    id="repayAmount"
                    type="number"
                    value={repaymentAmount}
                    onChange={(e) => setRepaymentAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="txHash">Transaction Hash</Label>
                  <Input
                    id="txHash"
                    value={repaymentTx}
                    onChange={(e) => setRepaymentTx(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <Button onClick={handleRepayment}>Submit Repayment Request</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="msg">Message</Label>
                  <Textarea
                    id="msg"
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>
                <Button onClick={handleContact}>
                  <Mail className="mr-2 size-4" /> Send Email
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserDashboard;
