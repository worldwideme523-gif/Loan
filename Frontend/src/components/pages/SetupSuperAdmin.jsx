import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SetupSuperAdmin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [checking, setChecking] = useState(true);
  const [canSetup, setCanSetup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    // houseAddress: '',
    // officeAddress: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if any admin already exists
    const checkAdminExists = async () => {
      try {
        const res = await axiosInstance.get('/api/auth/admin-exists');
        if (res.data.exists) {
          // Admin exists, redirect to admin login
          navigate('/admin-login');
        } else {
          setCanSetup(true);
        }
      } catch (err) {
        console.error('Error checking admin:', err);
        setCanSetup(true); // assume no admin on error, but show warning
      } finally {
        setChecking(false);
      }
    };
    checkAdminExists();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post('/api/auth/setup-superadmin', formData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Use the login context to set user state
      await login(formData.email, formData.password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Checking system status...</div>
      </div>
    );
  }

  if (!canSetup) {
    return null; // will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">System Setup – Create Super Admin</CardTitle>
            <CardDescription className="text-center">
              No administrator found. Please create the first super admin account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
              {/* <div>
                <Label htmlFor="houseAddress">House Address</Label>
                <Input id="houseAddress" name="houseAddress" value={formData.houseAddress} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="officeAddress">Office Address</Label>
                <Input id="officeAddress" name="officeAddress" value={formData.officeAddress} onChange={handleChange} required />
              </div> */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Super Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupSuperAdmin;