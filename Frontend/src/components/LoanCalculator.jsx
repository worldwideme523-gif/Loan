import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import axiosInstance from '../config/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, DollarSign, CalendarDays, Percent, ArrowRight, CheckCircle2, Calculator, Banknote, PiggyBank, TrendingUp, Sparkles } from 'lucide-react';

const termOptions = [
  { value: '6', label: 'Short Term', subtitle: '6 months', rate: '7%', color: 'from-emerald-500 to-teal-500', icon: TrendingUp },
  { value: '12', label: 'Mid-Short Term', subtitle: '12 months', rate: '10%', color: 'from-blue-500 to-indigo-500', icon: PiggyBank },
  { value: '24', label: 'Long Term', subtitle: '24 months', rate: '15%', color: 'from-violet-500 to-purple-500', icon: Banknote },
];

const LoanCalculator = () => {
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();

  const [amount, setAmount] = useState(100000);
  const [term, setTerm] = useState('6');
  const [calculated, setCalculated] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const getRate = useCallback((months) => {
    const rates = { 6: 0.07, 12: 0.10, 24: 0.15 };
    return rates[months] || 0.15;
  }, []);

  const calculate = useCallback(() => {
    if (!amount || amount < 100000) return;
    const rate = getRate(Number(term));
    const interest = amount * rate;
    const totalRepayment = amount + interest;
    const monthlyPayment = totalRepayment / Number(term);
    setCalculated({ rate: rate * 100, interest, totalRepayment, monthlyPayment });
    setApplied(false);
  }, [amount, term, getRate]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setApplying(true);
    try {
      await axiosInstance.post('/api/loan/apply-from-calculator', {
        amount,
        termMonths: Number(term)
      });
      success('Loan application submitted! An admin will review it shortly.');
      setApplied(true);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatCurrency = (val) => `$${Math.round(val).toLocaleString()}`;

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/5 via-transparent to-transparent" />

        <div className="relative px-6 sm:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 shadow-lg shadow-blue-500/25">
              <Calculator className="size-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Loan Calculator</h3>
              <p className="text-sm text-blue-200/70">Calculate your ideal loan</p>
            </div>
          </div>

          {/* Input Section */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Amount */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                <DollarSign className="size-4 text-blue-400" />
                Loan Amount
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="text-lg font-bold text-blue-300">$</span>
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(Number(e.target.value));
                    setCalculated(null);
                    setApplied(false);
                  }}
                  min="100000"
                  max="20000000"
                  className="pl-10 h-12 text-lg font-semibold bg-white/5 border-blue-400/20 text-white placeholder-blue-300/40 focus-visible:ring-blue-400 focus-visible:border-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex justify-between text-xs text-blue-300/60 px-1">
                <span>Min: $100,000</span>
                <span>Max: $20,000,000</span>
              </div>
              {/* Range indicator */}
              <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(((amount - 100000) / (20000000 - 100000)) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Term */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                <CalendarDays className="size-4 text-blue-400" />
                Repayment Plan
              </Label>
              <Select
                value={term}
                onValueChange={(val) => {
                  setTerm(val);
                  setCalculated(null);
                  setApplied(false);
                }}
              >
                <SelectTrigger className="h-12 bg-white/5 border-blue-400/20 text-white focus-visible:ring-blue-400 focus-visible:border-blue-400">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-blue-400/20">
                  {termOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-white focus:bg-blue-500/20 focus:text-white"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${opt.color}`}>
                          <opt.icon className="size-3.5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{opt.label}</p>
                          <p className="text-xs text-blue-300/60">{opt.subtitle} &bull; {opt.rate} interest</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Term quick picks */}
              <div className="flex gap-2">
                {termOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setTerm(opt.value);
                      setCalculated(null);
                      setApplied(false);
                    }}
                    className={`flex-1 text-xs font-medium py-2 px-2 rounded-lg border transition-all duration-200 ${
                      term === opt.value
                        ? `bg-gradient-to-r ${opt.color} text-white border-transparent shadow-md`
                        : 'bg-white/5 text-blue-200/60 border-blue-400/10 hover:bg-white/10 hover:border-blue-400/30'
                    }`}
                  >
                    {opt.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculate}
            disabled={!amount || amount < 100000}
            className="w-full mt-6 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold text-base rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed border-0"
          >
            <Calculator className="mr-2 size-5" />
            Calculate Loan
          </Button>
        </div>

        {/* Results Section */}
        {calculated && (
          <div className="border-t border-white/10">
            <div className="px-6 sm:px-8 py-6 space-y-5">
              {/* Summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-300">Loan Summary</span>
                </div>
                <span className="text-xs text-blue-300/50">Based on your inputs</span>
              </div>

              {/* Main result cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 p-4">
                  <p className="text-xs text-emerald-300/70 font-medium mb-1">Interest Rate</p>
                  <p className="text-xl font-bold text-emerald-300">{calculated.rate}%</p>
                  <Percent className="absolute bottom-3 right-3 size-8 text-emerald-500/10" />
                </div>
                <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 p-4">
                  <p className="text-xs text-amber-300/70 font-medium mb-1">Total Interest</p>
                  <p className="text-xl font-bold text-amber-300">{formatCurrency(calculated.interest)}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 p-4 sm:col-span-1 col-span-2">
                  <p className="text-xs text-blue-300/70 font-medium mb-1">Total Repayment</p>
                  <p className="text-xl font-bold text-blue-300">{formatCurrency(calculated.totalRepayment)}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 p-4 sm:col-span-1 col-span-2">
                  <p className="text-xs text-violet-300/70 font-medium mb-1">Monthly Payment</p>
                  <p className="text-xl font-bold text-violet-300">{formatCurrency(calculated.monthlyPayment)}</p>
                </div>
              </div>

              {/* Apply Button */}
              {!applied ? (
                <Button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-base rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-60 border-0 group relative overflow-hidden"
                >
                  {applying ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      Submitting Application...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Apply for {formatCurrency(amount)} <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-700" />
                </Button>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="size-6 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-300">Application Submitted!</p>
                    <p className="text-xs text-emerald-300/60">An admin will review your application shortly.</p>
                  </div>
                </div>
              )}

              {!isAuthenticated && !applied && (
                <p className="text-xs text-center text-blue-300/50">
                  You'll be redirected to login before submitting your application.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator;
