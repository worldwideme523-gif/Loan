import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../config/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, FileText, DollarSign, CheckCircle, XCircle, Plus, Trash2, LogOut, ShieldCheck, LayoutDashboard, UserCog, Banknote, ClipboardList, Menu, X } from 'lucide-react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      setMessage('Loan approved successfully');
      fetchApplications();
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleDenyLoan = async (appId) => {
    try {
      await axiosInstance.post(`/api/admin/deny-loan/${appId}`);
      setMessage('Loan application denied');
      fetchApplications();
    } catch (err) { setMessage(err.response?.data?.message); }
  };

  const handleAddFunds = async () => {
    if (!addFundsTarget || !addFundsAmount) return;
    try {
      await axiosInstance.post(`/api/admin/add-funds/${addFundsTarget}`, { amount: Number(addFundsAmount) });
      setMessage('Funds added successfully');
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
    if (window.confirm('Delete this user permanently?')) {
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
      setMessage('Admin account created');
      setCreateAdminOpen(false);
      setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
      fetchUsers();
    } catch (err) { setMessage(err.response?.data?.message); }
  };

  const totalBalance = users.reduce((sum, u) => sum + (u.walletBalance || 0), 0);
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const pendingRepays = repayments.filter(r => r.status === 'pending').length;

  const navItems = [
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'applications', label: 'Loan Apps', icon: FileText, count: pendingApps },
    { id: 'repayments', label: 'Repayments', icon: DollarSign, count: pendingRepays },
  ];
  if (isSuperAdmin) {
    navItems.push({ id: 'admins', label: 'Manage Admins', icon: UserCog });
  }

  const sidebar = (
    <aside className="w-64 lg:w-72 border-r bg-card flex flex-col h-full">
      <div className="p-4 md:p-5 border-b">
        <div className="flex items-center gap-3">
          <div className="size-9 md:size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="size-5 md:size-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-bold text-foreground truncate">Admin Panel</h1>
            <p className="text-[11px] md:text-xs text-muted-foreground">Loan Management</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        <Card className="shadow-none">
          <CardContent className="p-3 md:p-4 flex items-center gap-3">
            <div className="size-10 md:size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-base md:text-lg font-bold text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <Badge variant="secondary" className="mt-1.5 text-[10px] md:text-[11px] h-5">{user?.role}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-1 md:pt-2 space-y-2.5 md:space-y-3">
            <StatRow icon={Users} label="Total Users" value={users.length} />
            <StatRow icon={ClipboardList} label="Applications" value={applications.length} />
            <StatRow icon={FileText} label="Pending Apps" value={pendingApps} badge={pendingApps > 0} />
            <StatRow icon={Banknote} label="Pending Repays" value={pendingRepays} badge={pendingRepays > 0} />
            <div className="flex items-center justify-between pt-2 md:pt-3 border-t">
              <div className="flex items-center gap-2 min-w-0">
                <DollarSign className="size-3.5 md:size-4 text-muted-foreground shrink-0" />
                <span className="text-[11px] md:text-xs text-muted-foreground">Total Funds</span>
              </div>
              <span className="text-sm font-semibold text-foreground">${totalBalance.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Navigation</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-1 md:pt-2 space-y-0.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setSelectedTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  selectedTab === item.id
                    ? 'bg-primary/10 text-primary font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <item.icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.count !== undefined && (
                  <Badge variant={item.count > 0 ? 'default' : 'outline'} className="text-[10px] h-5 px-1.5 shrink-0">
                    {item.count}
                  </Badge>
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-3 md:p-4">
            <Button variant="destructive" size="sm" className="w-full" onClick={logout}>
              <LogOut className="mr-2 size-3.5 md:size-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex text-left">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:z-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebar}
      </div>

      <div className="hidden lg:block">{sidebar}</div>

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-14 md:h-16">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setSidebarOpen(true)}>
                <Menu className="size-5" />
              </Button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                <LayoutDashboard className="size-4 shrink-0" />
                <span className="truncate">Admin / <span className="text-foreground font-medium">{navItems.find(n => n.id === selectedTab)?.label}</span></span>
              </div>
              <div className="sm:hidden flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">{navItems.find(n => n.id === selectedTab)?.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <span className="hidden md:inline text-sm text-muted-foreground truncate max-w-[160px]">{user?.name}</span>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex text-muted-foreground hover:text-destructive" onClick={logout}>
                <LogOut className="mr-1.5 size-4" /> Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
          {message && (
            <Alert variant="default" className="[&>svg]:text-foreground">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {selectedTab === 'users' && (
            <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg md:text-xl">All Users</CardTitle>
                    <CardDescription className="text-sm">Manage user accounts and balances</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                    <Users className="size-4" />
                    <span className="font-medium text-foreground">{users.length}</span> total
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 md:p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-t md:border-t-0">
                        <TableHead className="px-4 md:px-6 py-3">Name</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 hidden sm:table-cell">Email</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 text-right">Balance</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 hidden md:table-cell">Role</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-12">No users found</TableCell>
                        </TableRow>
                      ) : (
                        users.map(u => (
                          <TableRow key={u._id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="px-4 md:px-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <span className="text-xs font-medium text-primary">{u.name?.charAt(0)?.toUpperCase()}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{u.name}</p>
                                  <p className="text-xs text-muted-foreground sm:hidden truncate">{u.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-sm text-muted-foreground hidden sm:table-cell">{u.email}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-sm font-medium text-right">${u.walletBalance?.toLocaleString()}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 hidden md:table-cell">
                              <Badge variant={u.role === 'superadmin' ? 'default' : u.role === 'admin' ? 'secondary' : 'outline'} className="capitalize">
                                {u.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => openAddFunds(u._id)}>
                                  <DollarSign className="mr-1 size-3.5" /> <span className="hidden xs:inline">Funds</span>
                                </Button>
                                {isSuperAdmin && (
                                  <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-destructive hover:text-destructive" onClick={() => handleDeleteUser(u._id)}>
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTab === 'applications' && (
            <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg md:text-xl">Loan Applications</CardTitle>
                    <CardDescription className="text-sm">Review and process pending applications</CardDescription>
                  </div>
                  {pendingApps > 0 && (
                    <Badge variant="warning" className="w-fit text-xs">{pendingApps} pending</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 md:p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-t md:border-t-0">
                        <TableHead className="px-4 md:px-6 py-3">Applicant</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 text-right">Amount</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 hidden sm:table-cell">Term</TableHead>
                        <TableHead className="px-4 md:px-6 py-3">Status</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 hidden md:table-cell">Date</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-12">No applications yet</TableCell>
                        </TableRow>
                      ) : (
                        applications.filter(a => a.status === 'pending').map(app => (
                          <TableRow key={app._id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="px-4 md:px-6 py-3 font-medium">{app.userId?.name || 'Unknown'}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-right font-medium">${app.amount?.toLocaleString()}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-sm text-muted-foreground hidden sm:table-cell">{app.termMonths} months</TableCell>
                            <TableCell className="px-4 md:px-6 py-3"><Badge variant="warning">Pending</Badge></TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-sm text-muted-foreground hidden md:table-cell">{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => handleApproveLoan(app._id)}>
                                  <CheckCircle className="mr-1 size-3.5" /> Approve
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-destructive hover:text-destructive" onClick={() => handleDenyLoan(app._id)}>
                                  <XCircle className="mr-1 size-3.5" /> Deny
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTab === 'repayments' && (
            <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg md:text-xl">Repayment Verifications</CardTitle>
                    <CardDescription className="text-sm">Verify pending repayment requests</CardDescription>
                  </div>
                  {pendingRepays > 0 && (
                    <Badge variant="warning" className="w-fit text-xs">{pendingRepays} pending</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 md:p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-t md:border-t-0">
                        <TableHead className="px-4 md:px-6 py-3">User</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 text-right">Amount</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 hidden sm:table-cell">Tx Hash</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 hidden md:table-cell">Date</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-12">No pending repayments</TableCell>
                        </TableRow>
                      ) : (
                        repayments.map(req => (
                          <TableRow key={req._id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="px-4 md:px-6 py-3 font-medium">{req.userId?.name}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-right font-medium">${req.amount?.toLocaleString()}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 hidden sm:table-cell">
                              <code className="text-xs bg-muted px-2 py-1 rounded max-w-[160px] block truncate font-mono">{req.transactionHash}</code>
                            </TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-sm text-muted-foreground hidden md:table-cell">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-right">
                              <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => handleMarkRepaymentReceived(req._id)}>
                                <CheckCircle className="mr-1 size-3.5" /> Mark Received
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {isSuperAdmin && selectedTab === 'admins' && (
            <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg md:text-xl">Manage Admins</CardTitle>
                    <CardDescription className="text-sm">Create new admin accounts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
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
                        <Input id="adminName" placeholder="Full name" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="adminEmail">Email</Label>
                        <Input id="adminEmail" type="email" placeholder="admin@example.com" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="adminPassword">Password</Label>
                        <Input id="adminPassword" type="password" placeholder="Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="adminRole">Role</Label>
                        <Select value={newAdmin.role} onValueChange={value => setNewAdmin({...newAdmin, role: value})}>
                          <SelectTrigger id="adminRole"><SelectValue placeholder="Select role" /></SelectTrigger>
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
          )}
        </main>
      </div>

      <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>Enter the amount to credit the user's wallet.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fundsAmount">Amount ($)</Label>
              <Input id="fundsAmount" type="number" placeholder="0.00" value={addFundsAmount} onChange={e => setAddFundsAmount(e.target.value)} />
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

function StatRow({ icon: Icon, label, value, badge }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="size-3.5 md:size-4 text-muted-foreground shrink-0" />
        <span className="text-[11px] md:text-xs text-muted-foreground truncate">{label}</span>
      </div>
      {badge !== undefined ? (
        <Badge variant={badge ? 'warning' : 'outline'} className="text-[10px] h-5 px-1.5 shrink-0">{value}</Badge>
      ) : (
        <span className="text-sm font-semibold text-foreground">{value}</span>
      )}
    </div>
  );
}

export default AdminDashboard;
