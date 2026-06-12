import React, { useState, useCallback } from 'react';

const LoanCalculator = () => {
  const [amount, setAmount] = useState(100000);
  const [term, setTerm] = useState(6);
  const [calculated, setCalculated] = useState(null);

  const getRate = useCallback((months) => {
    const rates = { 6: 0.07, 12: 0.10, 24: 0.15 };
    return rates[months] || 0.15;
  }, []);

  const calculate = useCallback(() => {
    if (!amount || amount < 100000) return;
    
    const rate = getRate(term);
    const interest = amount * rate;
    const totalRepayment = amount + interest;
    const monthlyPayment = totalRepayment / term;
    
    setCalculated({
      rate: rate * 100,
      interest,
      totalRepayment,
      monthlyPayment
    });
  }, [amount, term, getRate]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 transition-colors">
      <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">Loan Calculator</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black dark:text-gray-200 mb-2">
            Loan Amount ($)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="100000"
            max="100000000"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Min: $100,000 | Max: $100,000,000</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-black dark:text-gray-200 mb-2">
            Repayment Plan
          </label>
          <select
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value={6}>Short Term (6 months) - 7% interest</option>
            <option value={12}>Mid-Short Term (12 months) - 10% interest</option>
            <option value={24}>Long Term (24 months) - 15% interest</option>
          </select>
        </div>
        
        <button
          onClick={calculate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
        >
          Calculate
        </button>
        
        {calculated && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-2 transition-colors">
            <p className="flex justify-between text-black dark:text-white">
              <span className="font-medium">Interest Rate:</span>
              <span className="text-green-600 dark:text-green-400">{calculated.rate}%</span>
            </p>
            <p className="flex justify-between text-black dark:text-white">
              <span className="font-medium">Total Interest:</span>
              <span>${calculated.interest.toLocaleString()}</span>
            </p>
            <p className="flex justify-between text-black dark:text-white">
              <span className="font-medium">Total Repayment:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">${calculated.totalRepayment.toLocaleString()}</span>
            </p>
            <p className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 text-black dark:text-white">
              <span className="font-medium">Monthly Payment:</span>
              <span>${calculated.monthlyPayment.toLocaleString()}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator;