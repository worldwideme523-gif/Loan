import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
  const [error, setError] = useState('');
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-80 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-6 text-gray-600">Create an Account</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-white mb-2">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-white mb-2">Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-white mb-2">Phone Number *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-white mb-2">House Address *</label>
                <textarea name="houseAddress" value={formData.houseAddress} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" rows="2" required></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-white mb-2">Office Address *</label>
                <textarea name="officeAddress" value={formData.officeAddress} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" rows="2" required></textarea>
              </div>
              <div>
                <label className="block text-white mb-2">DOB Certificate *</label>
                <input type="file" name="dobCertificate" onChange={handleFileChange} className="border rounded-lg px-4 py-2 w-full" required />
              </div>
              <div>
                <label className="block text-white mb-2">Driver's License *</label>
                <input type="file" name="driversLicense" onChange={handleFileChange} className="border rounded-lg px-4 py-2 w-full" required />
              </div>
              <div>
                <label className="block text-white mb-2">Passport *</label>
                <input type="file" name="passport" onChange={handleFileChange} className="border rounded-lg px-4 py-2 w-full" required />
              </div>
            </div>
            <button type="submit" className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
              Register
            </button>
          </form>
          <p className="text-center mt-4 text-white">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;