import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../config/axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, FileText, DollarSign, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [selectedTab, setSelectedTab] = useState('users');
  const [addFundsUserId, setAddFundsUserId] = useState('');
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchApplications();
    fetchRepayments();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchApplications = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/applications');
      setApplications(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchRepayments = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/repayment-requests');
      setRepayments(res.data);
    } catch (err) { console.error(err); }
  };

  const handleApproveLoan = async (appId) => {
    try {
      await axiosInstance.post(`/api/admin/approve-loan/${appId}`);
      setMessage('Loan approved!');
      fetchApplications();
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleDenyLoan = async (appId) => {
    try {
      await axiosInstance.post(`/api/admin/deny-loan/${appId}`);
      setMessage('Loan denied');
      fetchApplications();
    } catch (err) { setMessage(err.response?.data?.message); }
  };

  const handleAddFunds = async () => {
    if (!addFundsUserId || !addFundsAmount) return;
    try {
      await axiosInstance.post(`/api/admin/add-funds/${addFundsUserId}`, { amount: Number(addFundsAmount) });
      setMessage('Funds added!');
      fetchUsers();
      setAddFundsUserId('');
      setAddFundsAmount('');
    } catch (err) { setMessage(err.response?.data?.message); }
  };

  const handleDeleteUser = async (userId) => {
    if (!isSuperAdmin) return alert('Only super admin can delete users');
    if (window.confirm('Delete this user?')) {
      try {
        await axiosInstance.delete(`/api/admin/user/${userId}`);
        setMessage('User deleted');
        fetchUsers();
      } catch (err) { setMessage(err.response?.data?.message); }
    }
  };

  const handleMarkRepaymentReceived = async (reqId) => {
    try {
      await axiosInstance.post(`/api/admin/repayment-received/${reqId}`);
      setMessage('Repayment marked as received');
      fetchRepayments();
      fetchUsers();
    } catch (err) { setMessage(err.response?.data?.message); }
  };

  const handleCreateAdmin = async () => {
    if (!isSuperAdmin) return alert('Super admin only');
    try {
      await axiosInstance.post('/api/admin/create-admin', newAdmin);
      setMessage('Admin created');
      setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
      fetchUsers();
    } catch (err) { setMessage(err.response?.data?.message); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span>{user?.name} ({user?.role})</span>
            <Button variant="destructive" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" /> Users</TabsTrigger>
            <TabsTrigger value="applications"><FileText className="mr-2 h-4 w-4" /> Loan Apps</TabsTrigger>
            <TabsTrigger value="repayments"><DollarSign className="mr-2 h-4 w-4" /> Repayments</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="admins"><Plus className="mr-2 h-4 w-4" /> Manage Admins</TabsTrigger>}
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u._id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>${u.walletBalance?.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{u.role}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setAddFundsUserId(u._id);
                              const amt = prompt('Enter amount to add:');
                              if (amt) { setAddFundsAmount(amt); handleAddFunds(); }
                            }}
                          >
                            <DollarSign className="mr-1 h-3 w-3" /> Add Funds
                          </Button>
                          {isSuperAdmin && (
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u._id)}>
                              <Trash2 className="mr-1 h-3 w-3" /> Delete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loan Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader><CardTitle>Pending Loan Applications</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.filter(a => a.status === 'pending').map(app => (
                      <TableRow key={app._id}>
                        <TableCell>{app.userId?.name || 'Unknown'}</TableCell>
                        <TableCell>${app.amount?.toLocaleString()}</TableCell>
                        <TableCell>{app.termMonths} months</TableCell>
                        <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" variant="default" onClick={() => handleApproveLoan(app._id)}>
                            <CheckCircle className="mr-1 h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDenyLoan(app._id)}>
                            <XCircle className="mr-1 h-3 w-3" /> Deny
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Repayments Tab */}
          <TabsContent value="repayments">
            <Card>
              <CardHeader><CardTitle>Pending Repayment Verifications</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Tx Hash</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repayments.map(req => (
                      <TableRow key={req._id}>
                        <TableCell>{req.userId?.name}</TableCell>
                        <TableCell>${req.amount?.toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-xs truncate max-w-[200px]">{req.transactionHash}</TableCell>
                        <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => handleMarkRepaymentReceived(req._id)}>
                            <CheckCircle className="mr-1 h-3 w-3" /> Mark Received
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Admins Tab */}
          {isSuperAdmin && (
            <TabsContent value="admins">
              <Card>
                <CardHeader><CardTitle>Create New Admin</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="Name" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} />
                    <Input placeholder="Email" type="email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                    <Input placeholder="Password" type="password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
                    <select className="p-2 border rounded-md" value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                  <Button onClick={handleCreateAdmin}>Create Admin</Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;