import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, User, Mail, Lock, Phone, MapPin, Building, Upload, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    houseAddress: '',
    officeAddress: ''
  });
  const [files, setFiles] = useState({
    dobCertificate: null,
    driversLicense: null,
    passport: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    Object.keys(files).forEach(key => {
      if (files[key]) data.append(key, files[key]);
    });

    try {
      await register(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
              <div className="size-9 sm:size-10 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-blue-600 font-bold text-base sm:text-lg">FL</span>
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
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
            {/* Brand */}
            <div className="text-center mb-8">
              <div className="size-16 sm:size-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg -rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="text-white font-bold text-xl sm:text-2xl">FL</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create an Account</h1>
              <p className="text-gray-500 mt-1.5 text-sm sm:text-base">Join FoyerLibre and start your financial journey</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <div className="size-2 bg-red-500 rounded-full shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="John Doe" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="you@example.com" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="+1 (555) 000-0000" required />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">House Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 size-4 text-gray-400" />
                    <textarea name="houseAddress" value={formData.houseAddress} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" rows="2" placeholder="123 Main Street, City" required />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Office Address *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 size-4 text-gray-400" />
                    <textarea name="officeAddress" value={formData.officeAddress} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" rows="2" placeholder="456 Business Ave, Suite 200" required />
                  </div>
                </div>

                {/* File Uploads */}
                <div className="md:col-span-2">
                  <div className="border-t border-gray-100 pt-5 mt-1">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Upload className="size-4" />
                      Required Documents
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { key: 'dobCertificate', label: 'DOB Certificate' },
                        { key: 'driversLicense', label: "Driver's License" },
                        { key: 'passport', label: 'Passport' }
                      ].map(({ key, label }) => (
                        <label key={key} className={`flex flex-col items-center justify-center gap-1.5 px-3 py-4 sm:py-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${files[key] ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'}`}>
                          <Upload className={`size-5 ${files[key] ? 'text-blue-500' : 'text-gray-400'}`} />
                          <span className={`text-xs font-medium ${files[key] ? 'text-blue-600' : 'text-gray-500'}`}>
                            {files[key] ? files[key].name.slice(0, 20) + (files[key].name.length > 20 ? '...' : '') : label}
                          </span>
                          <span className={`text-[10px] ${files[key] ? 'text-blue-400' : 'text-gray-400'}`}>
                            {files[key] ? 'Tap to change' : 'Click to upload'}
                          </span>
                          <input type="file" name={key} onChange={handleFileChange} className="hidden" required />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 sm:mt-7 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 text-sm sm:text-base shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-5 sm:mt-6 text-center">
              <p className="text-gray-500 text-sm sm:text-base">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all">
                  Sign in
                </Link>
              </p>
            </div>
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

export default Register;
