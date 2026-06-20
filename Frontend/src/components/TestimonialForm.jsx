import { useState } from 'react';
import axiosInstance from '../config/axios';

const TestimonialForm = ({ onSuccess }) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [loanAmount, setLoanAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await axiosInstance.post('/api/testimonials/user', {
        content,
        rating,
        loanAmount: loanAmount ? parseFloat(loanAmount) : undefined,
      });
      setContent('');
      setRating(5);
      setLoanAmount('');
      setMessage('✅ Thank you! Your testimonial has been added.');
      if (onSuccess) onSuccess();
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Share Your Experience</h3>
      {message && <div className="mb-4 p-2 rounded bg-gray-100">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          rows="3"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded"
          required
          placeholder="Your story..."
        />
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full p-2 border rounded">
          {[5,4,3,2,1].map(r => <option key={r}>{r} Star{r!==1?'s':''}</option>)}
        </select>
        <input
          type="number"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Loan amount (optional)"
        />
        <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">
          {submitting ? 'Submitting...' : 'Submit Testimonial'}
        </button>
      </form>
    </div>
  );
};

export default TestimonialForm;