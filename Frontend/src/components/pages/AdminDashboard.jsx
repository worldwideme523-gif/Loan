import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../config/axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { ChartBarGroup } from '@/components/chart-bar';
import { ChartDonut } from '@/components/chart-pie';
import { Users, FileText, DollarSign, CheckCircle, XCircle, Plus, Trash2, UserCog, Banknote, ClipboardList, TrendingUp, Activity, PieChart, MessageSquareQuote, Star, Mail, Loader2, Send } from 'lucide-react';

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
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

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

  const openEmailDialog = (targetUser) => {
    setEmailTarget(targetUser);
    setEmailSubject('');
    setEmailMessage('');
    setEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!emailTarget || !emailSubject || !emailMessage) return;
    setSendingEmail(true);
    try {
      await axiosInstance.post('/api/admin/send-email', {
        userId: emailTarget._id,
        subject: emailSubject,
        message: emailMessage
      });
      setMessage(`Email sent to ${emailTarget.name}`);
      setEmailDialogOpen(false);
      setEmailTarget(null);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
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
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50/40">
          {message && (
            <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-blue-50/80 backdrop-blur-sm px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                <p className="text-sm text-blue-700 font-medium">{message}</p>
              </div>
            </div>
          )}

          {selectedTab === 'users' && (
            <div className="flex flex-col gap-4 md:gap-6">

              {/* Stats Row */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, i) => (
                  <div key={i} className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md group hover:border-slate-300 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full blur-2xl" />
                    <div className="relative flex items-start justify-between">
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                        {card.sub && <p className="text-xs text-slate-400">{card.sub}</p>}
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-md shrink-0`}>
                        <card.icon className="size-5 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
                <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm">
                  <ChartBarGroup
                    title="Platform Activity"
                    description="Monthly applications, users, and repayments"
                    data={monthlyActivity.length > 0 ? monthlyActivity : [{ name: 'No data', applications: 0, users: 0, repayments: 0 }]}
                    config={barChartConfig}
                    height={280}
                  />
                </div>
                {statusData.some(d => d.value > 0) ? (
                  <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm">
                    <ChartDonut
                      title="Application Status"
                      description="Breakdown of all loan applications"
                      data={statusData}
                      nameKey="name"
                      valueKey="value"
                      colors={["#f59e0b", "#10b981", "#ef4444"]}
                      height={280}
                    />
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm flex flex-col items-center justify-center py-12">
                    <PieChart className="size-10 mb-3 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">No applications yet</p>
                    <p className="text-xs text-slate-400 mt-1">Applications will appear here once submitted</p>
                  </div>
                )}
              </div>

              {/* Users Table */}
              <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                <div className="px-5 py-5 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                        <Users className="size-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">All Users</h3>
                        <p className="text-xs text-slate-500">Manage user accounts and balances</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Users className="size-3.5" />
                      <span className="font-semibold text-slate-700">{users.length}</span> total
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 hover:bg-transparent">
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Email</TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Balance</TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Role</TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-slate-400 py-16">No users found</TableCell>
                        </TableRow>
                      ) : (
                        users.map(u => (
                          <TableRow key={u._id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                            <TableCell className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                                  <span className="text-xs font-bold text-white">{u.name?.charAt(0)?.toUpperCase()}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                                  <p className="text-xs text-slate-400 sm:hidden truncate">{u.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-3.5 text-sm text-slate-500 hidden sm:table-cell">{u.email}</TableCell>
                            <TableCell className="px-5 py-3.5 text-sm font-semibold text-right text-emerald-600">${u.walletBalance?.toLocaleString()}</TableCell>
                            <TableCell className="px-5 py-3.5 hidden md:table-cell">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                u.role === 'superadmin' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300' :
                                u.role === 'admin' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' :
                                'bg-slate-100 text-slate-600 ring-1 ring-slate-300'
                              }`}>
                                {u.role}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button onClick={() => openEmailDialog(u)} className="h-8 px-2.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center gap-1.5">
                                  <Mail className="size-3.5" /> <span className="hidden xs:inline">Email</span>
                                </button>
                                <button onClick={() => openAddFunds(u._id)} className="h-8 px-2.5 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 flex items-center gap-1.5">
                                  <DollarSign className="size-3.5" /> <span className="hidden xs:inline">Funds</span>
                                </button>
                                {isSuperAdmin && (
                                  <button onClick={() => handleDeleteUser(u._id)} className="h-8 px-2.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 flex items-center gap-1.5">
                                    <Trash2 className="size-3.5" />
                                  </button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'applications' && (
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="absolute top-0 right-0 w-56 h-56 bg-amber-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
              <div className="px-5 py-5 border-b border-slate-200 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                      <FileText className="size-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Loan Applications</h3>
                      <p className="text-xs text-slate-500">Review and process pending applications</p>
                    </div>
                  </div>
                  {pendingApps > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                      <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                      {pendingApps} pending
                    </span>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Term</TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400 py-16">No applications yet</TableCell>
                      </TableRow>
                    ) : (
                      applications.filter(a => a.status === 'pending').map(app => (
                        <TableRow key={app._id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                          <TableCell className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-sm">
                                <span className="text-xs font-bold text-white">{app.userId?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                              </div>
                              <span className="text-sm font-semibold text-slate-800">{app.userId?.name || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3.5 text-right font-semibold text-amber-600">${app.amount?.toLocaleString()}</TableCell>
                          <TableCell className="px-5 py-3.5 text-sm text-slate-500 hidden sm:table-cell">{app.termMonths} months</TableCell>
                          <TableCell className="px-5 py-3.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                              Pending
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-3.5 text-sm text-slate-400 hidden md:table-cell">{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => openEmailDialog({ _id: app.userId?._id, name: app.userId?.name || 'Applicant', email: app.userId?.email })} className="h-8 px-2.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center gap-1.5">
                                <Mail className="size-3.5" /> <span className="hidden xs:inline">Email</span>
                              </button>
                              <button onClick={() => handleApproveLoan(app._id)} className="h-8 px-2.5 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 flex items-center gap-1.5">
                                <CheckCircle className="size-3.5" /> Approve
                              </button>
                              <button onClick={() => handleDenyLoan(app._id)} className="h-8 px-2.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 flex items-center gap-1.5">
                                <XCircle className="size-3.5" /> Deny
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {selectedTab === 'repayments' && (
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
              <div className="px-5 py-5 border-b border-slate-200 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                      <DollarSign className="size-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Repayment Verifications</h3>
                      <p className="text-xs text-slate-500">Verify pending repayment requests</p>
                    </div>
                  </div>
                  {pendingRepays > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {pendingRepays} pending
                    </span>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-400 py-16">No pending repayments</TableCell>
                      </TableRow>
                    ) : (
                      repayments.map(req => (
                        <TableRow key={req._id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                          <TableCell className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                                <span className="text-xs font-bold text-white">{req.userId?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                              </div>
                              <span className="text-sm font-semibold text-slate-800">{req.userId?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3.5 text-right font-semibold text-emerald-600">${req.amount?.toLocaleString()}</TableCell>
                          <TableCell className="px-5 py-3.5 text-sm text-slate-400 hidden md:table-cell">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="px-5 py-3.5 text-right">
                            <button onClick={() => handleMarkRepaymentReceived(req._id)} className="h-8 px-3 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 flex items-center gap-1.5 ml-auto">
                              <CheckCircle className="size-3.5" /> Mark Received
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {selectedTab === 'testimonials' && (
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="absolute top-0 right-0 w-56 h-56 bg-purple-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
              <div className="px-5 py-5 border-b border-slate-200 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                      <MessageSquareQuote className="size-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Testimonial Management</h3>
                      <p className="text-xs text-slate-500">View, create, and manage client testimonials</p>
                    </div>
                  </div>
                  <Dialog open={createTestimonialOpen} onOpenChange={setCreateTestimonialOpen}>
                    <DialogTrigger asChild>
                      <button className="h-9 px-4 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 border-0">
                        <Plus className="size-4" /> Add Testimonial
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border-slate-200 text-slate-900">
                      <DialogHeader>
                        <DialogTitle className="text-slate-900 flex items-center gap-2">
                          <MessageSquareQuote className="size-5 text-purple-500" />
                          Create Testimonial
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">Add a new client testimonial manually.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label className="text-slate-700 text-sm font-medium">Author Name</Label>
                          <Input className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-purple-500" placeholder="Client name" value={newTestimonial.author} onChange={e => setNewTestimonial({...newTestimonial, author: e.target.value})} />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-slate-700 text-sm font-medium">Testimonial</Label>
                          <Textarea className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-purple-500 min-h-[80px]" placeholder="What the client said..." value={newTestimonial.content} onChange={e => setNewTestimonial({...newTestimonial, content: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label className="text-slate-700 text-sm font-medium">Rating (1-5)</Label>
                            <Input className="bg-white border-slate-300 text-slate-900 focus-visible:ring-purple-500" type="number" min={1} max={5} value={newTestimonial.rating} onChange={e => setNewTestimonial({...newTestimonial, rating: Number(e.target.value)})} />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-slate-700 text-sm font-medium">Loan Amount ($)</Label>
                            <Input className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-purple-500" type="number" placeholder="0" value={newTestimonial.loanAmount} onChange={e => setNewTestimonial({...newTestimonial, loanAmount: e.target.value})} />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <button onClick={() => setCreateTestimonialOpen(false)} className="h-9 px-4 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-all duration-200 border border-slate-300">Cancel</button>
                        <button onClick={handleCreateTestimonial} className="h-9 px-4 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200 flex items-center gap-2 border-0 shadow-md">
                          <Plus className="size-3.5" /> Create
                        </button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Author</TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider max-w-md">Content</TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Rating</TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right hidden sm:table-cell">Loan</TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testimonials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-400 py-16">No testimonials found</TableCell>
                      </TableRow>
                    ) : (
                      testimonials.map(t => (
                        <TableRow key={t._id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                          <TableCell className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-sm">
                                <span className="text-xs font-bold text-white">{t.author?.charAt(0)?.toUpperCase()}</span>
                              </div>
                              <span className="text-sm font-semibold text-slate-800">{t.author}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3.5 text-sm text-slate-500 max-w-md truncate">&ldquo;{t.content}&rdquo;</TableCell>
                          <TableCell className="px-5 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`size-3.5 ${s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3.5 text-right text-sm font-semibold text-emerald-600 hidden sm:table-cell">${t.loanAmount?.toLocaleString()}</TableCell>
                          <TableCell className="px-5 py-3.5 text-right">
                            <button onClick={() => handleDeleteTestimonial(t._id)} className="h-8 px-2.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 flex items-center gap-1.5 ml-auto">
                              <Trash2 className="size-3.5" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {isSuperAdmin && selectedTab === 'admins' && (
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="absolute top-0 right-0 w-56 h-56 bg-red-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 via-pink-400 to-rose-400" />
              <div className="px-5 py-5 border-b border-slate-200 relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 shadow-md">
                    <UserCog className="size-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Manage Admins</h3>
                    <p className="text-xs text-slate-500">Create new admin accounts</p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-5">
                <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
                  <DialogTrigger asChild>
                    <button className="h-10 px-5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 border-0">
                      <Plus className="size-4" /> Create New Admin
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 flex items-center gap-2">
                        <UserCog className="size-5 text-red-500" />
                        Create Admin Account
                      </DialogTitle>
                      <DialogDescription className="text-slate-500">Fill in the details to create a new admin or super admin.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-700 text-sm font-medium">Name</Label>
                        <Input className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-red-500" placeholder="Full name" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 text-sm font-medium">Email</Label>
                        <Input className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-red-500" type="email" placeholder="admin@example.com" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 text-sm font-medium">Password</Label>
                        <Input className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-red-500" type="password" placeholder="Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 text-sm font-medium">Role</Label>
                        <Select value={newAdmin.role} onValueChange={value => setNewAdmin({...newAdmin, role: value})}>
                          <SelectTrigger className="bg-white border-slate-300 text-slate-900 focus-visible:ring-red-500">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 text-slate-900">
                            <SelectItem value="admin" className="text-slate-900 focus:bg-red-50">Admin</SelectItem>
                            <SelectItem value="superadmin" className="text-slate-900 focus:bg-red-50">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <button onClick={() => setCreateAdminOpen(false)} className="h-9 px-4 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-all duration-200 border border-slate-300">Cancel</button>
                      <button onClick={handleCreateAdmin} className="h-9 px-4 rounded-lg text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-200 flex items-center gap-2 border-0 shadow-md">
                        <UserCog className="size-3.5" /> Create Admin
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>

      <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <DollarSign className="size-5 text-emerald-500" />
              Add Funds
            </DialogTitle>
            <DialogDescription className="text-slate-500">Enter the amount to credit the user's account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-700 text-sm font-medium">Amount ($)</Label>
              <Input className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500" type="number" placeholder="0.00" value={addFundsAmount} onChange={e => setAddFundsAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setAddFundsOpen(false)} className="h-9 px-4 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-all duration-200 border border-slate-300">Cancel</button>
            <button onClick={handleAddFunds} className="h-9 px-4 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transition-all duration-200 flex items-center gap-2 border-0 shadow-md">
              <DollarSign className="size-3.5" /> Add Funds
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Mail className="size-5 text-blue-500" />
              Send Email to {emailTarget?.name || 'User'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Compose an email to {emailTarget?.email || 'the user'}. They will receive it in their inbox.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-700 text-sm font-medium">Subject</Label>
              <Input
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
                placeholder="e.g. Loan Application Update"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-700 text-sm font-medium">Message</Label>
              <Textarea
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
                rows={6}
                placeholder="Write your message here..."
                value={emailMessage}
                onChange={e => setEmailMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setEmailDialogOpen(false)} disabled={sendingEmail} className="h-9 px-4 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-all duration-200 border border-slate-300 disabled:opacity-50">Cancel</button>
            <button
              onClick={handleSendEmail}
              disabled={!emailSubject || !emailMessage || sendingEmail}
              className="h-9 px-4 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white transition-all duration-200 flex items-center gap-2 border-0 shadow-md disabled:opacity-50"
            >
              {sendingEmail ? (
                <><Loader2 className="size-3.5 animate-spin" /> Sending...</>
              ) : (
                <><Send className="size-3.5" /> Send Email</>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminDashboard;
