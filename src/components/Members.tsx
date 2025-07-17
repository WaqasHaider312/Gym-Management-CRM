
import React, { useState } from 'react';
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
  DialogTrigger,
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
  Loader2
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { whatsappService } from '@/services/whatsappService';

// Define the Member interface
interface Member {
  id: string;
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
}

// Form validation schema
const memberFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  phone: z.string().min(11, { message: "Please enter a valid phone number" }),
  cnic: z.string().min(13, { message: "Please enter a valid CNIC number" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  membershipType: z.string({
    required_error: "Please select a membership type",
  }),
  feeType: z.string({
    required_error: "Please select a fee type",
  }),
  admissionFee: z.string().min(1, { message: "Admission fee is required" }),
  monthlyFee: z.string().min(1, { message: "Monthly fee is required" }),
  sendWhatsApp: z.boolean().default(false),
});

// Fee types
const feeTypes = [
  { value: 'monthly', label: 'Monthly', multiplier: 1 },
  { value: 'quarterly', label: 'Quarterly', multiplier: 3 },
  { value: 'halfYearly', label: 'Half Yearly', multiplier: 6 },
  { value: 'annually', label: 'Annually', multiplier: 12 },
];

// Membership types with associated fees
const membershipTypes = [
  { value: 'strength', label: 'Strength', fee: 3000 },
  { value: 'cardio', label: 'Cardio', fee: 2500 },
  { value: 'cardioStrength', label: 'Cardio + Strength', fee: 4000 },
  { value: 'personalTraining', label: 'Personal Training', fee: 6000 },
];

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWhatsAppToggled, setIsWhatsAppToggled] = useState(true);
  
  // Form setup with zod validation
  const form = useForm<z.infer<typeof memberFormSchema>>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      cnic: "",
      address: "",
      membershipType: "",
      feeType: "",
      admissionFee: "2000",
      monthlyFee: "",
      sendWhatsApp: true,
    },
  });

  // Watch form values for dynamic calculations
  const watchMembershipType = form.watch("membershipType");
  const watchFeeType = form.watch("feeType");
  const watchAdmissionFee = form.watch("admissionFee");
  const watchMonthlyFee = form.watch("monthlyFee");

  // Calculate total fee dynamically
  const calculateTotalFee = () => {
    const admissionFee = parseFloat(watchAdmissionFee || "0");
    const monthlyFee = parseFloat(watchMonthlyFee || "0");
    const feeType = watchFeeType;
    const multiplier = feeTypes.find(f => f.value === feeType)?.multiplier || 1;
    
    return admissionFee + (monthlyFee * multiplier);
  };

  // Update monthly fee when membership type changes
  React.useEffect(() => {
    if (watchMembershipType) {
      const membershipType = membershipTypes.find(type => type.value === watchMembershipType);
      if (membershipType) {
        form.setValue("monthlyFee", membershipType.fee.toString());
      }
    }
  }, [watchMembershipType, form]);

  // Dummy member data
  const members: Member[] = [
    {
      id: '1',
      name: 'Ahmed Khan',
      phone: '03001234567',
      cnic: '35201-1234567-1',
      address: '123 Main Street, Lahore',
      membershipType: 'Cardio + Strength',
      feeType: 'Monthly',
      joiningDate: '2024-06-15',
      expiryDate: '2024-07-15',
      fee: 4000,
      status: 'active'
    },
    {
      id: '2',
      name: 'Sara Ali',
      phone: '03009876543',
      cnic: '35201-7654321-0',
      address: '456 Park Avenue, Karachi',
      membershipType: 'Personal Training',
      feeType: 'Quarterly',
      joiningDate: '2024-05-01',
      expiryDate: '2024-08-01',
      fee: 18000,
      status: 'active'
    },
    {
      id: '3',
      name: 'Zain Ahmed',
      phone: '03331234567',
      cnic: '35201-1122334-4',
      address: '789 Garden Town, Islamabad',
      membershipType: 'Strength',
      feeType: 'Monthly',
      joiningDate: '2024-04-10',
      expiryDate: '2024-05-10',
      fee: 3000,
      status: 'expired'
    },
    {
      id: '4',
      name: 'Fatima Malik',
      phone: '03123456789',
      cnic: '35201-9988776-5',
      address: '101 DHA Phase 5, Lahore',
      membershipType: 'Cardio',
      feeType: 'Annually',
      joiningDate: '2024-01-15',
      expiryDate: '2025-01-15',
      fee: 30000,
      status: 'active'
    }
  ];

  // Filter members based on search term and status
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status badge styling
  const getStatusBadge = (status: 'active' | 'pending' | 'expired') => {
    const colors = {
      'active': 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
      'pending': 'bg-amber-500/20 text-amber-700 border-amber-500/30',
      'expired': 'bg-red-500/20 text-red-700 border-red-500/30'
    };
    
    return (
      <Badge className={`${colors[status]} transition-colors duration-150`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof memberFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Form submitted:', data);
      
      // Send WhatsApp notification if toggled
      if (data.sendWhatsApp) {
        try {
          const membershipLabel = membershipTypes.find(type => type.value === data.membershipType)?.label || data.membershipType;
          const totalFee = calculateTotalFee();
          
          await whatsappService.sendMemberReceipt(
            data.name,
            data.phone,
            membershipLabel,
            totalFee,
            new Date().toLocaleDateString('en-US')
          );
          
          console.log('WhatsApp notification sent');
        } catch (error) {
          console.error('Failed to send WhatsApp notification:', error);
        }
      }
      
      // Close dialog and show success
      setIsAddMemberDialogOpen(false);
      setIsSuccessDialogOpen(true);
      
      // Show toast notification
      toast({
        title: "Member Added Successfully",
        description: `${data.name} has been added to your member database.`,
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error Adding Member",
        description: "There was a problem adding the member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 flex items-center">
            <Users className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
            Members Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your gym members and their memberships
          </p>
        </div>
        <Button 
          onClick={() => setIsAddMemberDialogOpen(true)} 
          className="w-full sm:w-auto premium-button transition-transform duration-200 hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Members</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{members.length}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Members</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{members.filter(m => m.status === 'active').length}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Expiring Soon</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{members.filter(m => m.status === 'expired').length}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">New This Month</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">3</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg">
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <Card className="glass-card border-white/40">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search members by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 border-white/60 text-gray-800 placeholder:text-gray-500 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px] bg-white/70 border-white/60 text-gray-800 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Members List View */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-[400px] mb-4">
          <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
            List View
          </TabsTrigger>
          <TabsTrigger value="cards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
            Card View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-0 animate-in fade-in-50 slide-in-from-left-3 duration-300">
          {/* Table View - Desktop */}
          <Card className="glass-card border-white/40 hidden md:block">
            <CardContent className="p-0 overflow-x-auto">
              {filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No members found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-600 min-w-[150px]">Member Name</TableHead>
                      <TableHead className="text-gray-600 min-w-[120px]">Phone Number</TableHead>
                      <TableHead className="text-gray-600 min-w-[150px]">Membership</TableHead>
                      <TableHead className="text-gray-600 min-w-[120px]">Fee Type</TableHead>
                      <TableHead className="text-gray-600 min-w-[100px]">Fee</TableHead>
                      <TableHead className="text-gray-600 min-w-[120px]">Expiry Date</TableHead>
                      <TableHead className="text-gray-600 min-w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow 
                        key={member.id} 
                        className="border-gray-100 hover:bg-white/50 transition-colors duration-150"
                      >
                        <TableCell className="text-gray-800 font-medium">{member.name}</TableCell>
                        <TableCell className="text-gray-600">{member.phone}</TableCell>
                        <TableCell className="text-gray-600">{member.membershipType}</TableCell>
                        <TableCell className="text-gray-600">{member.feeType}</TableCell>
                        <TableCell className="text-gray-800 font-semibold">
                          Rs. {member.fee.toLocaleString('en-US')}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(member.expiryDate).toLocaleDateString('en-US')}
                        </TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Mobile List View */}
          <div className="space-y-4 md:hidden">
            {filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 bg-white/50 rounded-lg">
                <Users className="h-10 w-10 text-gray-400 mb-3" />
                <h3 className="text-base font-medium text-gray-700">No members found 📭</h3>
                <p className="text-gray-500 mt-1 text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <Card key={member.id} className="glass-card border-white/40 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{member.name}</h3>
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <Phone className="w-3.5 h-3.5 mr-1.5" />
                          {member.phone}
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(member.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-white/40 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Membership</p>
                        <p className="text-sm font-medium text-gray-700">{member.membershipType}</p>
                      </div>
                      <div className="bg-white/40 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Fee</p>
                        <p className="text-sm font-medium text-gray-700">Rs. {member.fee.toLocaleString('en-US')}</p>
                      </div>
                      <div className="bg-white/40 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Fee Type</p>
                        <p className="text-sm font-medium text-gray-700">{member.feeType}</p>
                      </div>
                      <div className="bg-white/40 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Expiry Date</p>
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(member.expiryDate).toLocaleDateString('en-US')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs bg-white/60 hover:bg-white transition-colors duration-150"
                      >
                        Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-150"
                      >
                        Renew
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="cards" className="animate-in fade-in-50 slide-in-from-right-3 duration-300">
          {/* Card View */}
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white/50 rounded-lg">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No members found 📭</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                          {member.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-800">{member.name}</h3>
                          <div className="flex items-center text-gray-600 text-xs">
                            <Phone className="w-3 h-3 mr-1" />
                            {member.phone}
                          </div>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(member.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-xs">
                        <p className="text-gray-500">Membership</p>
                        <p className="text-gray-800 font-medium">{member.membershipType}</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-500">Fee</p>
                        <p className="text-gray-800 font-medium">Rs. {member.fee.toLocaleString('en-US')}</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-500">Fee Type</p>
                        <p className="text-gray-800 font-medium">{member.feeType}</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-500">Expiry Date</p>
                        <p className="text-gray-800 font-medium">
                          {new Date(member.expiryDate).toLocaleDateString('en-US')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs bg-white/60 hover:bg-white transition-colors duration-150"
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-150"
                      >
                        Renew <ArrowRight className="ml-1 h-3 w-3" />
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
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <UserPlus className="mr-2 h-5 w-5 text-blue-600" />
              Add New Member
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Complete the form below to register a new gym member.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            placeholder="Enter full name" 
                            className="pl-10 bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                            {...field} 
                          />
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
                      <FormLabel className="text-gray-700">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            placeholder="03xx-xxxxxxx" 
                            className="pl-10 bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cnic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">CNIC Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            placeholder="xxxxx-xxxxxxx-x" 
                            className="pl-10 bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                            {...field} 
                          />
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
                      <FormLabel className="text-gray-700">Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            placeholder="Enter address" 
                            className="pl-10 bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="membershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Membership Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className="relative">
                            <Dumbbell className="absolute left-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                            <SelectTrigger className="pl-10 bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
                              <SelectValue placeholder="Select membership type" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent className="bg-white/95 backdrop-blur-md">
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
                      <FormLabel className="text-gray-700">Fee Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                            <SelectTrigger className="pl-10 bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
                              <SelectValue placeholder="Select fee type" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent className="bg-white/95 backdrop-blur-md">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="admissionFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Admission Fee (Rs)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            type="number" 
                            placeholder="Enter admission fee" 
                            className="pl-10 bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Monthly Fee (Rs)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            type="number" 
                            placeholder="Enter monthly fee" 
                            className="pl-10 bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Total Fee Calculation */}
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-blue-700">Total Fee</h4>
                    <p className="text-xs text-blue-600">
                      {watchFeeType && 
                        `Admission Fee + ${feeTypes.find(f => f.value === watchFeeType)?.label || 'Monthly'} Fee`
                      }
                    </p>
                  </div>
                  <div className="text-xl font-bold text-blue-700">
                    Rs. {calculateTotalFee().toLocaleString('en-US')}
                  </div>
                </div>
              </div>

              {/* WhatsApp Notification Toggle */}
              <FormField
                control={form.control}
                name="sendWhatsApp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200/50 p-3 shadow-sm bg-white/40">
                    <div className="space-y-0.5">
                      <FormLabel className="text-gray-700 flex items-center">
                        <Send className="mr-2 h-4 w-4 text-green-600" />
                        Send WhatsApp Receipt
                      </FormLabel>
                      <FormDescription className="text-xs text-gray-500">
                        Send a payment receipt to member via WhatsApp
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className={`transition-colors duration-200 w-11 h-6 bg-${field.value ? 'green-500' : 'gray-300'} rounded-full relative cursor-pointer`}
                        onClick={() => {
                          form.setValue('sendWhatsApp', !field.value);
                          setIsWhatsAppToggled(!isWhatsAppToggled);
                        }}>
                        <div className={`transition-transform duration-200 w-5 h-5 rounded-full bg-white absolute top-0.5 ${field.value ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="bg-white/70 border-white/60 transition-colors hover:bg-gray-100" 
                  onClick={() => setIsAddMemberDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="premium-button transition-all duration-200 hover:shadow-lg disabled:opacity-70"
                  disabled={isSubmitting}
                >
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

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in-50 duration-300">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-800 text-center">
              Member Added Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center mt-2">
              The member has been added to your database and can now access gym facilities.
              {isWhatsAppToggled && (
                <div className="flex items-center justify-center mt-2 text-green-600">
                  <Send className="h-4 w-4 mr-1" />
                  WhatsApp notification has been sent
                </div>
              )}
            </DialogDescription>
            
            <div className="mt-6 w-full flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-white/70 border-white/60 transition-colors hover:bg-gray-100"
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                  setIsAddMemberDialogOpen(true);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Another
              </Button>
              <Button
                className="flex-1 premium-button transition-all duration-200"
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                }}
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
