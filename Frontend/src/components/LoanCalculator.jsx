import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LoanCalculator = () => {
  const [amount, setAmount] = useState(100000);
  const [term, setTerm] = useState('6');
  const [calculated, setCalculated] = useState(null);

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

    setCalculated({
      rate: rate * 100,
      interest,
      totalRepayment,
      monthlyPayment
    });
  }, [amount, term, getRate]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="calc-amount">Loan Amount ($)</Label>
        <Input
          id="calc-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="100000"
          max="100000000"
        />
        <p className="text-xs text-muted-foreground">Min: $100,000 | Max: $100,000,000</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="calc-term">Repayment Plan</Label>
        <Select value={term} onValueChange={setTerm}>
          <SelectTrigger id="calc-term">
            <SelectValue placeholder="Select term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">Short Term (6 months) &ndash; 7% interest</SelectItem>
            <SelectItem value="12">Mid-Short Term (12 months) &ndash; 10% interest</SelectItem>
            <SelectItem value="24">Long Term (24 months) &ndash; 15% interest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={calculate} className="w-full">Calculate</Button>

      {calculated && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Interest Rate:</span>
            <span className="font-medium text-emerald-600">{calculated.rate}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Interest:</span>
            <span className="font-medium">${calculated.interest.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Repayment:</span>
            <span className="font-bold text-primary">${calculated.totalRepayment.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2 mt-2">
            <span className="text-muted-foreground">Monthly Payment:</span>
            <span className="font-bold">${calculated.monthlyPayment.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanCalculator;
