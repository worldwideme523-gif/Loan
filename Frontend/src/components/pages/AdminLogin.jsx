import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin');
      } else {
        setError('You do not have admin privileges');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex flex-col">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="size-9 sm:size-10 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow ring-2 ring-white/50">
                <span className="text-blue-600 font-bold text-xs sm:text-sm">FL</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">FoyerLibre</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 sm:px-5 py-2 rounded-xl transition-all duration-200 text-sm sm:text-base font-medium backdrop-blur-sm border border-white/10"
            >
              <Home className="size-4" />
              <span className="hidden sm:inline">Back to</span> Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
            {/* Brand */}
            <div className="text-center mb-8">
              <div className="size-16 sm:size-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg -rotate-3 hover:rotate-0 transition-transform duration-300">
                <Shield className="text-white size-8 sm:size-10" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Portal</h1>
              <p className="text-gray-500 mt-1.5 text-sm sm:text-base">Sign in with your admin credentials</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <div className="size-2 bg-red-500 rounded-full shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="admin@foyerlibre.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 sm:pl-11 pr-11 sm:pr-12 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4 sm:size-5" /> : <Eye className="size-4 sm:size-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 text-sm sm:text-base shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Login as Admin'
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-white/60 text-xs sm:text-sm">
              &copy; 2026 FoyerLibre. All rights reserved.
            </p>
            <p className="text-white/40 text-xs">
              Secure &bull; Transparent &bull; Fast
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLogin;
