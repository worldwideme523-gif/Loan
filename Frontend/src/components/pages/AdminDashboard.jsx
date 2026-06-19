import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../config/axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, FileText, DollarSign, CheckCircle, XCircle, Plus, Trash2, LogOut, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [selectedTab, setSelectedTab] = useState('users');
  const [message, setMessage] = useState('');
  const [addFundsTarget, setAddFundsTarget] = useState(null);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);

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
    if (!addFundsTarget || !addFundsAmount) return;
    try {
      await axiosInstance.post(`/api/admin/add-funds/${addFundsTarget}`, { amount: Number(addFundsAmount) });
      setMessage('Funds added!');
      fetchUsers();
      setAddFundsOpen(false);
      setAddFundsTarget(null);
      setAddFundsAmount('');
    } catch (err) { setMessage(err.response?.data?.message); }
  };

  const openAddFunds = (userId) => {
    setAddFundsTarget(userId);
    setAddFundsAmount('');
    setAddFundsOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!isSuperAdmin) return;
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
    if (!isSuperAdmin) return;
    try {
      await axiosInstance.post('/api/admin/create-admin', newAdmin);
      setMessage('Admin created');
      setCreateAdminOpen(false);
      setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
      fetchUsers();
    } catch (err) { setMessage(err.response?.data?.message); }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name} (<Badge variant="outline">{user?.role}</Badge>)</span>
            <Button variant="destructive" size="sm" onClick={logout}>
              <LogOut className="mr-2 size-4" /> Logout
            </Button>
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
            <TabsTrigger value="users"><Users className="mr-2 size-4" /> Users</TabsTrigger>
            <TabsTrigger value="applications"><FileText className="mr-2 size-4" /> Loan Apps</TabsTrigger>
            <TabsTrigger value="repayments"><DollarSign className="mr-2 size-4" /> Repayments</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="admins"><Plus className="mr-2 size-4" /> Manage Admins</TabsTrigger>}
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts and balances</CardDescription>
              </CardHeader>
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
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>${u.walletBalance?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'superadmin' ? 'default' : u.role === 'admin' ? 'secondary' : 'outline'}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => openAddFunds(u._id)}>
                              <DollarSign className="mr-1 size-3" /> Add Funds
                            </Button>
                            {isSuperAdmin && (
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u._id)}>
                                <Trash2 className="mr-1 size-3" /> Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Loan Applications</CardTitle>
                <CardDescription>Review and process pending applications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No applications yet</TableCell>
                      </TableRow>
                    ) : (
                      applications.filter(a => a.status === 'pending').map(app => (
                        <TableRow key={app._id}>
                          <TableCell className="font-medium">{app.userId?.name || 'Unknown'}</TableCell>
                          <TableCell>${app.amount?.toLocaleString()}</TableCell>
                          <TableCell>{app.termMonths} months</TableCell>
                          <TableCell><Badge variant="warning">Pending</Badge></TableCell>
                          <TableCell className="text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleApproveLoan(app._id)}>
                                <CheckCircle className="mr-1 size-3" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDenyLoan(app._id)}>
                                <XCircle className="mr-1 size-3" /> Deny
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="repayments">
            <Card>
              <CardHeader>
                <CardTitle>Repayment Verifications</CardTitle>
                <CardDescription>Verify pending repayment requests</CardDescription>
              </CardHeader>
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
                    {repayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No pending repayments</TableCell>
                      </TableRow>
                    ) : (
                      repayments.map(req => (
                        <TableRow key={req._id}>
                          <TableCell className="font-medium">{req.userId?.name}</TableCell>
                          <TableCell>${req.amount?.toLocaleString()}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded max-w-[180px] block truncate">{req.transactionHash}</code>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => handleMarkRepaymentReceived(req._id)}>
                              <CheckCircle className="mr-1 size-3" /> Mark Received
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="admins">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Admins</CardTitle>
                  <CardDescription>Create new admin accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 size-4" /> Create New Admin</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Admin Account</DialogTitle>
                        <DialogDescription>Fill in the details to create a new admin or super admin.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="adminName">Name</Label>
                          <Input
                            id="adminName"
                            placeholder="Full name"
                            value={newAdmin.name}
                            onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="adminEmail">Email</Label>
                          <Input
                            id="adminEmail"
                            type="email"
                            placeholder="admin@example.com"
                            value={newAdmin.email}
                            onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="adminPassword">Password</Label>
                          <Input
                            id="adminPassword"
                            type="password"
                            placeholder="Password"
                            value={newAdmin.password}
                            onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="adminRole">Role</Label>
                          <Select value={newAdmin.role} onValueChange={value => setNewAdmin({...newAdmin, role: value})}>
                            <SelectTrigger id="adminRole">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="superadmin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateAdminOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateAdmin}>Create Admin</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>Enter the amount to credit the user's wallet.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fundsAmount">Amount ($)</Label>
              <Input
                id="fundsAmount"
                type="number"
                placeholder="0.00"
                value={addFundsAmount}
                onChange={e => setAddFundsAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFundsOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFunds}>Add Funds</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
