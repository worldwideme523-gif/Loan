import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-900 flex flex-col items-center justify-center p-20">
      {/* Header with Logo and Home Button */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <div className="text-3xl font-bold text-white flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold">V</span>
          </div>
          Velaris
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold"
        >
          <Home size={20} />
          Home
        </Link>
      </div>

      {/* Login Card */}
      <div className="bg-blue-700 p-8 rounded-lg shadow-lg w-full max-w-md mt-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Welcome Back</h2>
        <p className="text-center text-white mb-6">Login to your account</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white font-semibold mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-800 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>
        
        <p className="text-center mt-6 text-white">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;