import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { ChartBarGroup } from '@/components/chart-bar';
import { ChartDonut } from '@/components/chart-pie';
import { Users, FileText, DollarSign, CheckCircle, XCircle, Plus, Trash2, UserCog, Banknote, ClipboardList, TrendingUp, Activity, PieChart, MessageSquareQuote, Star } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [selectedTab, setSelectedTab] = useState('users');
  const [message, setMessage] = useState('');
  const [addFundsTarget, setAddFundsTarget] = useState(null);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [newTestimonial, setNewTestimonial] = useState({ author: '', content: '', rating: 5, loanAmount: '' });
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [createTestimonialOpen, setCreateTestimonialOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchApplications();
    fetchRepayments();
    fetchTestimonials();
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

  const fetchTestimonials = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/testimonials');
      setTestimonials(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await axiosInstance.delete(`/api/admin/testimonials/${id}`);
      setMessage('Testimonial deleted');
      fetchTestimonials();
    } catch (err) { setMessage(err.response?.data?.message || 'Delete failed'); }
  };

  const handleCreateTestimonial = async () => {
    if (!newTestimonial.author || !newTestimonial.content) return;
    try {
      await axiosInstance.post('/api/admin/testimonials', newTestimonial);
      setMessage('Testimonial created');
      setCreateTestimonialOpen(false);
      setNewTestimonial({ author: '', content: '', rating: 5, loanAmount: '' });
      fetchTestimonials();
    } catch (err) { setMessage(err.response?.data?.message || 'Create failed'); }
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
  const approvedApps = applications.filter(a => a.status === 'approved').length;
  const deniedApps = applications.filter(a => a.status === 'denied').length;
  const clientCount = users.filter(u => u.role === 'user').length;

  const navItems = [
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'applications', label: 'Loan Apps', icon: FileText, count: pendingApps },
    { id: 'repayments', label: 'Repayments', icon: DollarSign, count: pendingRepays },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote, count: testimonials.length },
  ];
  if (isSuperAdmin) {
    navItems.push({ id: 'admins', label: 'Manage Admins', icon: UserCog });
  }

  const statCards = [
    { label: 'Total Users', value: users.length, sub: `${clientCount} clients`, icon: Users, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Total Funds', value: `$${totalBalance.toLocaleString()}`, icon: DollarSign, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending Apps', value: pendingApps, sub: `${approvedApps} approved`, icon: FileText, gradient: 'from-amber-500 to-amber-600' },
    { label: 'Pending Repays', value: pendingRepays, icon: Banknote, gradient: 'from-violet-500 to-violet-600' },
  ];

  const monthlyActivity = useMemo(() => {
    const months = {}
    const addToMonth = (dateStr, key) => {
      if (!dateStr) return
      const d = new Date(dateStr)
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!months[m]) months[m] = { name: m, applications: 0, users: 0, repayments: 0 }
      months[m][key]++
    }
    applications?.forEach(a => addToMonth(a.createdAt, 'applications'))
    repayments?.forEach(r => addToMonth(r.createdAt, 'repayments'))
    users?.forEach(u => addToMonth(u.createdAt, 'users'))
    return Object.values(months).sort((a, b) => a.name.localeCompare(b.name)).slice(-6)
  }, [applications, repayments, users])

  const statusData = useMemo(() => {
    return [
      { name: 'Pending', value: pendingApps },
      { name: 'Approved', value: approvedApps },
      { name: 'Denied', value: deniedApps },
    ]
  }, [pendingApps, approvedApps, deniedApps])

  const barChartConfig = {
    applications: { label: 'Applications', color: '#3b82f6' },
    users: { label: 'New Users', color: '#10b981' },
    repayments: { label: 'Repayments', color: '#8b5cf6' },
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        items={navItems}
        user={user}
        role={user?.role || 'Admin'}
        activeTab={selectedTab}
        onNavigate={setSelectedTab}
        onLogout={() => { logout(); navigate('/'); }}
      />
      <SidebarInset className="text-left">
        <SiteHeader
          section="Admin"
          page={navItems.find(n => n.id === selectedTab)?.label}
          user={user}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {message && (
            <Alert variant="default" className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">{message}</AlertDescription>
            </Alert>
          )}

          {selectedTab === 'users' && (
            <div className="flex flex-col gap-4 md:gap-6">

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, i) => (
                  <Card key={i} className={`bg-gradient-to-br ${card.gradient} text-white border-0 shadow-sm`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-white/80">{card.label}</CardTitle>
                      <card.icon className="size-4 text-white/60" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                      {card.sub && <p className="text-xs text-white/70 mt-1">{card.sub}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
                <ChartBarGroup
                  title="Platform Activity"
                  description="Monthly applications, users, and repayments"
                  data={monthlyActivity.length > 0 ? monthlyActivity : [{ name: 'No data', applications: 0, users: 0, repayments: 0 }]}
                  config={barChartConfig}
                  height={280}
                />
                {statusData.some(d => d.value > 0) ? (
                  <ChartDonut
                    title="Application Status"
                    description="Breakdown of all loan applications"
                    data={statusData}
                    nameKey="name"
                    valueKey="value"
                    colors={["#f59e0b", "#10b981", "#ef4444"]}
                    height={280}
                  />
                ) : (
                  <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
                    <CardHeader className="p-4 md:p-6">
                      <CardTitle className="text-lg md:text-xl">Application Status</CardTitle>
                      <CardDescription className="text-sm">Breakdown of all loan applications</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0 md:pt-0 flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <PieChart className="size-10 mb-3 opacity-30" />
                      <p className="text-sm">No applications yet</p>
                      <p className="text-xs mt-1">Applications will appear here once submitted</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
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
                                  <div className="size-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-medium text-white">{u.name?.charAt(0)?.toUpperCase()}</span>
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
            </div>
          )}

          {selectedTab === 'applications' && (
            <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
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
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleApproveLoan(app._id)}>
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
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
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
                        <TableHead className="px-4 md:px-6 py-3 hidden md:table-cell">Date</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-12">No pending repayments</TableCell>
                        </TableRow>
                      ) : (
                        repayments.map(req => (
                          <TableRow key={req._id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="px-4 md:px-6 py-3 font-medium">{req.userId?.name}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-right font-medium">${req.amount?.toLocaleString()}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-sm text-muted-foreground hidden md:table-cell">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-right">
                              <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleMarkRepaymentReceived(req._id)}>
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

          {selectedTab === 'testimonials' && (
            <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg md:text-xl">Testimonial Management</CardTitle>
                    <CardDescription className="text-sm">View, create, and manage client testimonials</CardDescription>
                  </div>
                  <Dialog open={createTestimonialOpen} onOpenChange={setCreateTestimonialOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                        <Plus className="mr-2 size-4" /> Add Testimonial
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Testimonial</DialogTitle>
                        <DialogDescription>Add a new client testimonial manually.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="tAuthor">Author Name</Label>
                          <Input id="tAuthor" placeholder="Client name" value={newTestimonial.author} onChange={e => setNewTestimonial({...newTestimonial, author: e.target.value})} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tContent">Testimonial</Label>
                          <textarea
                            id="tContent"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="What the client said..."
                            value={newTestimonial.content}
                            onChange={e => setNewTestimonial({...newTestimonial, content: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="tRating">Rating (1-5)</Label>
                            <Input id="tRating" type="number" min={1} max={5} value={newTestimonial.rating} onChange={e => setNewTestimonial({...newTestimonial, rating: Number(e.target.value)})} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="tLoan">Loan Amount ($)</Label>
                            <Input id="tLoan" type="number" placeholder="0" value={newTestimonial.loanAmount} onChange={e => setNewTestimonial({...newTestimonial, loanAmount: e.target.value})} />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateTestimonialOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateTestimonial} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">Create</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0 md:p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-t md:border-t-0">
                        <TableHead className="px-4 md:px-6 py-3">Author</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 max-w-md">Content</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 text-center">Rating</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 text-right hidden sm:table-cell">Loan</TableHead>
                        <TableHead className="px-4 md:px-6 py-3 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testimonials.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-12">No testimonials found</TableCell>
                        </TableRow>
                      ) : (
                        testimonials.map(t => (
                          <TableRow key={t._id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="px-4 md:px-6 py-3 font-medium">{t.author}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-sm text-muted-foreground max-w-md truncate">{t.content}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={`size-3 ${s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-right text-sm hidden sm:table-cell">${t.loanAmount?.toLocaleString()}</TableCell>
                            <TableCell className="px-4 md:px-6 py-3 text-right">
                              <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-destructive hover:text-destructive" onClick={() => handleDeleteTestimonial(t._id)}>
                                <Trash2 className="size-3.5" />
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
              <div className="h-1 bg-gradient-to-r from-red-500 to-pink-500" />
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
                    <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0"><Plus className="mr-2 size-4" /> Create New Admin</Button>
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
                      <Button onClick={handleCreateAdmin} className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0">Create Admin</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>

      <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>Enter the amount to credit the user's account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fundsAmount">Amount ($)</Label>
              <Input id="fundsAmount" type="number" placeholder="0.00" value={addFundsAmount} onChange={e => setAddFundsAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFundsOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFunds} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0">Add Funds</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminDashboard;
