import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Plus, 
  Clock, 
  UserPlus, 
  UserCheck, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Phone, 
  IndianRupee, 
  User, 
  Dumbbell, 
  ShieldCheck,
  Send,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Download,
  RotateCcw
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { whatsappService } from '@/services/whatsappService';
import { membersAPI } from '@/services/googleSheetsAPI';

// Member interface
interface Member {
  id: number;
  name: string;
  phone: string;
  cnic: string;
  address: string;
  membershipType: string;
  feeType: string;
  joiningDate: string;
  expiryDate: string;
  fee: number;
  status: 'active' | 'pending' | 'expired';
  createdAt?: string;
  updatedAt?: string;
}

// Form schemas
const memberFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().regex(/^923\d{9}$/, "Phone must be 12 digits starting with 923"),
  cnic: z.string().min(13, "Please enter a valid CNIC number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  membershipType: z.string({ required_error: "Please select a membership type" }),
  feeType: z.string({ required_error: "Please select a fee type" }),
  admissionFee: z.string().min(1, "Admission fee is required"),
  monthlyFee: z.string().min(1, "Monthly fee is required"),
  sendWhatsApp: z.boolean().default(false),
});

const renewSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  feeType: z.string({ required_error: "Please select a fee type" }),
  sendWhatsApp: z.boolean().default(false),
});

// Fee and membership types
const feeTypes = [
  { value: 'daily', label: '1 Day Pass', multiplier: 1, isDailyPass: true },
  { value: 'monthly', label: 'Monthly', multiplier: 1, isDailyPass: false },
  { value: 'quarterly', label: 'Quarterly', multiplier: 3, isDailyPass: false },
  { value: 'halfYearly', label: 'Half Yearly', multiplier: 6, isDailyPass: false },
  { value: 'annually', label: 'Annually', multiplier: 12, isDailyPass: false },
];

const membershipTypes = [
  { value: 'strength', label: 'Strength', fee: 5000 },
  { value: 'cardio', label: 'Cardio', fee: 2500 },
  { value: 'cardioStrength', label: 'Cardio + Strength', fee: 7500 },
  { value: 'personalTraining', label: 'Personal Training', fee: 15000 },
  { value: 'dailypass', label: 'Daily Pass', fee: 500 },
];

const Members = () => {
  // State
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Forms
  const form = useForm<z.infer<typeof memberFormSchema>>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: "", phone: "", cnic: "", address: "",
      membershipType: "", feeType: "", admissionFee: "2000",
      monthlyFee: "", sendWhatsApp: true,
    },
  });

  const renewForm = useForm<z.infer<typeof renewSchema>>({
    resolver: zodResolver(renewSchema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
      feeType: "", sendWhatsApp: true,
    },
  });

  // Watch form values
  const watchMembershipType = form.watch("membershipType");
  const watchFeeType = form.watch("feeType");
  const watchAdmissionFee = form.watch("admissionFee");
  const watchMonthlyFee = form.watch("monthlyFee");

  // Utility functions
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: '2-digit' 
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const calculateExpiryDate = (startDate: string, feeType: string): string => {
    const start = new Date(startDate);
    const feeTypeData = feeTypes.find(ft => ft.value === feeType);
    if (!feeTypeData) return startDate;
    
    if (feeTypeData.isDailyPass) {
      start.setDate(start.getDate() + 1);
    } else {
      start.setMonth(start.getMonth() + feeTypeData.multiplier);
    }
    return start.toISOString().split('T')[0];
  };

  const calculateTotalFee = () => {
    const feeTypeData = feeTypes.find(f => f.value === watchFeeType);
    if (feeTypeData?.isDailyPass) return parseFloat(watchMonthlyFee || "0");
    
    const admissionFee = parseFloat(watchAdmissionFee || "0");
    const monthlyFee = parseFloat(watchMonthlyFee || "0");
    const multiplier = feeTypeData?.multiplier || 1;
    return admissionFee + (monthlyFee * multiplier);
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    const colors = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'expired': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <Badge className={`${colors[normalizedStatus] || colors.pending} transition-colors`}>
        {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
      </Badge>
    );
  };

  // Data fetching
  const fetchMembers = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const response = await membersAPI.getAll();
      
      if (response.success && response.members) {
        // Clean and map data properly
        const cleanedMembers = response.members.map((member, index) => ({
          id: member.id || `member_${index}`,
          name: member.name || 'Unknown',
          phone: member.phone || '',
          cnic: member.cnic || '',
          address: member.address || '',
          membershipType: member.membershipType || '',
          feeType: member.feeType || '',
          joiningDate: member.joiningDate || '',
          expiryDate: member.expiryDate || '',
          fee: typeof member.fee === 'number' ? member.fee : parseFloat(member.fee) || 0,
          status: (member.status || member.membershipStatus || 'pending').toLowerCase() as 'active' | 'pending' | 'expired',
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        }));
        
        setMembers(cleanedMembers);
      } else {
        setError(response.error || 'Failed to fetch members');
      }
    } catch (error) {
      setError('Network error: Unable to fetch members');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (watchMembershipType) {
      const membershipType = membershipTypes.find(type => type.value === watchMembershipType);
      if (membershipType) {
        form.setValue("monthlyFee", membershipType.fee.toString());
      }
    }
  }, [watchMembershipType, form]);

  useEffect(() => {
    if (watchFeeType) {
      const feeTypeData = feeTypes.find(f => f.value === watchFeeType);
      if (feeTypeData?.isDailyPass) {
        form.setValue("admissionFee", "0");
      }
    }
  }, [watchFeeType, form]);

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesMembership = membershipFilter === 'all' || member.membershipType === membershipFilter;
    return matchesSearch && matchesStatus && matchesMembership;
  });

  // Statistics
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const expiredMembers = members.filter(m => m.status === 'expired').length;
  const thisMonthMembers = members.filter(m => {
    const joinDate = new Date(m.joiningDate);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;

  // Form handlers
  const onSubmit = async (data: z.infer<typeof memberFormSchema>) => {
    setIsSubmitting(true);
    try {
      const joiningDate = new Date();
      const expiryDate = calculateExpiryDate(joiningDate.toISOString().split('T')[0], data.feeType);

      const memberData = {
        name: data.name,
        phone: data.phone,
        cnic: data.cnic,
        address: data.address,
        membershipType: membershipTypes.find(mt => mt.value === data.membershipType)?.label || data.membershipType,
        feeType: feeTypes.find(ft => ft.value === data.feeType)?.label || data.feeType,
        joiningDate: joiningDate.toISOString().split('T')[0],
        expiryDate,
        fee: calculateTotalFee(),
        status: 'active'
      };

      const response = await membersAPI.add(memberData);
      
      if (response.success) {
        if (data.sendWhatsApp) {
          try {
            const membershipLabel = membershipTypes.find(type => type.value === data.membershipType)?.label || data.membershipType;
            await whatsappService.sendMemberReceipt(
              data.name, data.phone, membershipLabel, 
              calculateTotalFee(), new Date().toLocaleDateString('en-US')
            );
          } catch (error) {
            console.error('WhatsApp notification failed:', error);
          }
        }
        
        setIsAddDialogOpen(false);
        setSuccessMessage('Member added successfully!');
        setIsSuccessDialogOpen(true);
        await fetchMembers();
        form.reset();
      } else {
        throw new Error(response.error || 'Failed to add member');
      }
    } catch (error) {
      toast({
        title: "Error Adding Member",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEdit = async (data: z.infer<typeof memberFormSchema>) => {
    if (!selectedMember) return;
    
    setIsSubmitting(true);
    try {
      const updatedData = {
        ...selectedMember,
        name: data.name,
        phone: data.phone,
        cnic: data.cnic,
        address: data.address,
        membershipType: membershipTypes.find(mt => mt.value === data.membershipType)?.label || data.membershipType,
        feeType: feeTypes.find(ft => ft.value === data.feeType)?.label || data.feeType,
        fee: calculateTotalFee(),
      };

      const response = await membersAPI.update(selectedMember.id, updatedData);
      
      if (response.success) {
        if (data.sendWhatsApp) {
          try {
            const membershipLabel = membershipTypes.find(type => type.value === data.membershipType)?.label || data.membershipType;
            await whatsappService.sendMemberReceipt(
              data.name, data.phone, membershipLabel, 
              calculateTotalFee(), new Date().toLocaleDateString('en-US')
            );
          } catch (error) {
            console.error('WhatsApp notification failed:', error);
          }
        }
        
        setIsEditDialogOpen(false);
        setSuccessMessage('Member updated successfully!');
        setIsSuccessDialogOpen(true);
        await fetchMembers();
      } else {
        throw new Error(response.error || 'Failed to update member');
      }
    } catch (error) {
      toast({
        title: "Error Updating Member",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRenew = async (data: z.infer<typeof renewSchema>) => {
    if (!selectedMember) return;
    
    setIsSubmitting(true);
    try {
      const expiryDate = calculateExpiryDate(data.startDate, data.feeType);
      const feeTypeData = feeTypes.find(ft => ft.value === data.feeType);
      const monthlyFee = membershipTypes.find(mt => mt.value.includes(selectedMember.membershipType.toLowerCase().replace(/\s/g, '')))?.fee || 0;
      
      let totalFee = monthlyFee;
      if (!feeTypeData?.isDailyPass) {
        totalFee = monthlyFee * (feeTypeData?.multiplier || 1);
      }

      const updatedData = {
        ...selectedMember,
        feeType: feeTypes.find(ft => ft.value === data.feeType)?.label || data.feeType,
        joiningDate: data.startDate,
        expiryDate,
        fee: totalFee,
        status: 'active' as const
      };

      const response = await membersAPI.update(selectedMember.id, updatedData);
      
      if (response.success) {
        if (data.sendWhatsApp) {
          try {
            await whatsappService.sendMemberReceipt(
              selectedMember.name, selectedMember.phone, selectedMember.membershipType,
              totalFee, new Date(data.startDate).toLocaleDateString('en-US')
            );
          } catch (error) {
            console.error('WhatsApp notification failed:', error);
          }
        }
        
        setIsRenewDialogOpen(false);
        setSuccessMessage('Membership renewed successfully!');
        setIsSuccessDialogOpen(true);
        await fetchMembers();
      } else {
        throw new Error(response.error || 'Failed to renew membership');
      }
    } catch (error) {
      toast({
        title: "Error Renewing Membership",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!selectedMember) return;
    
    setIsSubmitting(true);
    try {
      const response = await membersAPI.delete(selectedMember.id);
      
      if (response.success) {
        setIsDeleteDialogOpen(false);
        setSuccessMessage('Member deleted successfully!');
        setIsSuccessDialogOpen(true);
        await fetchMembers();
      } else {
        throw new Error(response.error || 'Failed to delete member');
      }
    } catch (error) {
      toast({
        title: "Error Deleting Member",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'CNIC', 'Address', 'Membership Type', 'Fee Type', 'Joining Date', 'Expiry Date', 'Fee', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredMembers.map(member => [
        member.name,
        member.phone,
        member.cnic,
        member.address,
        member.membershipType,
        member.feeType,
        member.joiningDate,
        member.expiryDate,
        member.fee,
        member.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Action handlers
  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    const membershipValue = membershipTypes.find(mt => mt.label === member.membershipType)?.value || 'strength';
    const feeTypeValue = feeTypes.find(ft => ft.label === member.feeType)?.value || 'monthly';
    
    form.reset({
      name: member.name,
      phone: member.phone,
      cnic: member.cnic,
      address: member.address,
      membershipType: membershipValue,
      feeType: feeTypeValue,
      admissionFee: "2000",
      monthlyFee: membershipTypes.find(mt => mt.value === membershipValue)?.fee.toString() || "3000",
      sendWhatsApp: true,
    });
    setIsEditDialogOpen(true);
  };

  const handleRenew = (member: Member) => {
    setSelectedMember(member);
    renewForm.reset({
      startDate: new Date().toISOString().split('T')[0],
      feeType: "",
      sendWhatsApp: true,
    });
    setIsRenewDialogOpen(true);
  };

  const handleView = (member: Member) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to Load Members</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchMembers()} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Users className="mr-3 h-7 w-7 text-blue-600" />
            Members Management
          </h1>
          <p className="text-gray-600">Manage your gym members and memberships</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchMembers(true)} variant="outline" disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="premium-button">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Members</p>
                <p className="text-3xl font-bold text-gray-800">{totalMembers}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Members</p>
                <p className="text-3xl font-bold text-gray-800">{activeMembers}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Expired</p>
                <p className="text-3xl font-bold text-gray-800">{expiredMembers}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">New This Month</p>
                <p className="text-3xl font-bold text-gray-800">{thisMonthMembers}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="lg:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={membershipFilter} onValueChange={setMembershipFilter}>
              <SelectTrigger className="lg:w-[180px]">
                <SelectValue placeholder="Filter by membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Memberships</SelectItem>
                {membershipTypes.map(type => (
                  <SelectItem key={type.value} value={type.label}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-[400px] mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card className="glass-card hidden md:block">
            <CardContent className="p-0 overflow-x-auto">
              {filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">
                    {members.length === 0 ? 'No members yet' : 'No members found'}
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {members.length === 0 ? 'Add your first member to get started' : 'Try adjusting your filters'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Membership</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>{member.membershipType}</TableCell>
                        <TableCell>{member.feeType}</TableCell>
                        <TableCell>Rs. {member.fee.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(member.expiryDate)}</TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" onClick={() => handleView(member)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRenew(member)}>
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(member)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Mobile List */}
          <div className="space-y-4 md:hidden">
            {filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Users className="h-10 w-10 text-gray-400 mb-3" />
                <h3 className="text-base font-medium text-gray-700">No members found</h3>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <Card key={member.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-gray-600 text-sm">{member.phone}</p>
                      </div>
                      {getStatusBadge(member.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white/40 p-2 rounded">
                        <p className="text-xs text-gray-500">Membership</p>
                        <p className="text-sm font-medium">{member.membershipType}</p>
                      </div>
                      <div className="bg-white/40 p-2 rounded">
                        <p className="text-xs text-gray-500">Fee</p>
                        <p className="text-sm font-medium">Rs. {member.fee.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/40 p-2 rounded">
                        <p className="text-xs text-gray-500">Fee Type</p>
                        <p className="text-sm font-medium">{member.feeType}</p>
                      </div>
                      <div className="bg-white/40 p-2 rounded">
                        <p className="text-xs text-gray-500">Expiry</p>
                        <p className="text-sm font-medium">{formatDate(member.expiryDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleView(member)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRenew(member)}>
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(member)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="cards">
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No members found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="glass-card">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {member.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-xs text-gray-600">{member.phone}</p>
                        </div>
                      </div>
                      {getStatusBadge(member.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div>
                        <p className="text-gray-500">Membership</p>
                        <p className="font-medium">{member.membershipType}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fee</p>
                        <p className="font-medium">Rs. {member.fee.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fee Type</p>
                        <p className="font-medium">{member.feeType}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expiry</p>
                        <p className="font-medium">{formatDate(member.expiryDate)}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3 flex gap-1">
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleView(member)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRenew(member)}>
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="glass-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5 text-blue-600" />
              Add New Member
            </DialogTitle>
            <DialogDescription>Complete the form to register a new member.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input placeholder="Enter full name" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input placeholder="03xxxxxxxxx" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cnic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNIC Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input placeholder="xxxxx-xxxxxxx-x" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input placeholder="Enter address" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="membershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <div className="relative">
                            <Dumbbell className="absolute left-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {membershipTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label} - Rs. {type.fee}/month
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select fee type" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {feeTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {!feeTypes.find(f => f.value === watchFeeType)?.isDailyPass && (
                  <FormField
                    control={form.control}
                    name="admissionFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Fee (Rs)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input type="number" placeholder="2000" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="monthlyFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{feeTypes.find(f => f.value === watchFeeType)?.isDailyPass ? 'Daily Fee (Rs)' : 'Monthly Fee (Rs)'}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input type="number" placeholder="3000" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-blue-50/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-blue-700">Total Fee</h4>
                    <p className="text-xs text-blue-600">
                      {watchFeeType && (feeTypes.find(f => f.value === watchFeeType)?.isDailyPass 
                        ? 'Daily Fee Only' 
                        : `Admission Fee + ${feeTypes.find(f => f.value === watchFeeType)?.label || 'Monthly'} Fee`
                      )}
                    </p>
                  </div>
                  <div className="text-xl font-bold text-blue-700">
                    Rs. {calculateTotalFee().toLocaleString()}
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="sendWhatsApp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center">
                        <Send className="mr-2 h-4 w-4 text-green-600" />
                        Send WhatsApp Receipt
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Send payment receipt via WhatsApp
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div 
                        className={`transition-colors duration-200 w-11 h-6 bg-${field.value ? 'green-500' : 'gray-300'} rounded-full relative cursor-pointer`}
                        onClick={() => form.setValue('sendWhatsApp', !field.value)}
                      >
                        <div className={`transition-transform duration-200 w-5 h-5 rounded-full bg-white absolute top-0.5 ${field.value ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Member
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="mr-2 h-5 w-5 text-blue-600" />
              Edit Member
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEdit)} className="space-y-4">
              {/* Same form fields as Add Member */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input placeholder="Enter full name" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input placeholder="03xxxxxxxxx" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cnic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNIC Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input placeholder="xxxxx-xxxxxxx-x" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input placeholder="Enter address" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="membershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <div className="relative">
                            <Dumbbell className="absolute left-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {membershipTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label} - Rs. {type.fee}/month
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select fee type" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {feeTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sendWhatsApp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center">
                        <Send className="mr-2 h-4 w-4 text-green-600" />
                        Send WhatsApp Update
                      </FormLabel>
                    </div>
                    <FormControl>
                      <div 
                        className={`transition-colors duration-200 w-11 h-6 bg-${field.value ? 'green-500' : 'gray-300'} rounded-full relative cursor-pointer`}
                        onClick={() => form.setValue('sendWhatsApp', !field.value)}
                      >
                        <div className={`transition-transform duration-200 w-5 h-5 rounded-full bg-white absolute top-0.5 ${field.value ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Update Member
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Renew Membership Dialog */}
      <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
        <DialogContent className="glass-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <RotateCcw className="mr-2 h-5 w-5 text-green-600" />
              Renew Membership
            </DialogTitle>
            <DialogDescription>
              Renew membership for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>

          <Form {...renewForm}>
            <form onSubmit={renewForm.handleSubmit(onRenew)} className="space-y-4">
              <FormField
                control={renewForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input type="date" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={renewForm.control}
                name="feeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {feeTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={renewForm.control}
                name="sendWhatsApp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center">
                        <Send className="mr-2 h-4 w-4 text-green-600" />
                        Send WhatsApp Receipt
                      </FormLabel>
                    </div>
                    <FormControl>
                      <div 
                        className={`transition-colors duration-200 w-11 h-6 bg-${field.value ? 'green-500' : 'gray-300'} rounded-full relative cursor-pointer`}
                        onClick={() => renewForm.setValue('sendWhatsApp', !field.value)}
                      >
                        <div className={`transition-transform duration-200 w-5 h-5 rounded-full bg-white absolute top-0.5 ${field.value ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsRenewDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Renewing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Renew
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Member Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="glass-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5 text-blue-600" />
              Member Details
            </DialogTitle>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedMember.name}</h3>
                  <p className="text-gray-600">{selectedMember.phone}</p>
                  {getStatusBadge(selectedMember.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">CNIC</p>
                  <p className="font-medium">{selectedMember.cnic}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedMember.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Membership</p>
                  <p className="font-medium">{selectedMember.membershipType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fee Type</p>
                  <p className="font-medium">{selectedMember.feeType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joining Date</p>
                  <p className="font-medium">{formatDate(selectedMember.joiningDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium">{formatDate(selectedMember.expiryDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fee Paid</p>
                  <p className="font-medium">Rs. {selectedMember.fee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member ID</p>
                  <p className="font-medium">{selectedMember.id}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button className="flex-1" onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEdit(selectedMember);
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => {
                  setIsViewDialogOpen(false);
                  handleRenew(selectedMember);
                }}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Renew
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="glass-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Delete Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedMember?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="glass-card sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-center">
              Success!
            </DialogTitle>
            <DialogDescription className="text-center mt-2">
              {successMessage}
            </DialogDescription>
            
            <div className="mt-6 w-full flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                  setIsAddDialogOpen(true);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Another
              </Button>
              <Button
                className="flex-1"
                onClick={() => setIsSuccessDialogOpen(false)}
              >
                <Check className="mr-2 h-4 w-4" />
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;
