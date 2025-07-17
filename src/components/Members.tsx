
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  UserPlus,
  Phone,
  Check,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';

interface Member {
  id: string;
  name: string;
  phone: string;
  membershipType: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'expiring_soon';
}

// Define form schema using zod
const memberFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  phone: z.string().min(11, { message: "Phone number must be at least 11 digits" }),
  cnic: z.string().min(13, { message: "CNIC must be 13 digits" }),
  address: z.string().min(5, { message: "Address is required" }),
  admissionFee: z.string().min(1, { message: "Admission fee is required" }),
  membershipType: z.string({
    required_error: "Please select a membership type",
  }),
  feeType: z.string({
    required_error: "Please select a fee type",
  }),
});

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  // React Hook Form setup with zod validation
  const form = useForm<z.infer<typeof memberFormSchema>>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      cnic: "",
      address: "",
      admissionFee: "5000",
      membershipType: "",
      feeType: "",
    },
  });

  // Mock data
  const members: Member[] = [
    {
      id: '1',
      name: 'John Doe',
      phone: '+92 9876543210',
      membershipType: '12 months',
      startDate: '2024-01-15',
      expiryDate: '2025-01-15',
      status: 'active'
    },
    {
      id: '2', 
      name: 'Sarah Wilson',
      phone: '+92 9876543211',
      membershipType: '6 months',
      startDate: '2024-06-01',
      expiryDate: '2024-12-01',
      status: 'expiring_soon'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      phone: '+92 9876543212', 
      membershipType: '3 months',
      startDate: '2024-03-01',
      expiryDate: '2024-06-01',
      status: 'expired'
    },
    {
      id: '4',
      name: 'Emma Brown',
      phone: '+92 9876543213',
      membershipType: 'Monthly',
      startDate: '2024-06-15',
      expiryDate: '2024-07-15',
      status: 'active'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Active</Badge>;
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-700 border-red-500/30">Expired</Badge>;
      case 'expiring_soon':
        return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">Expiring Soon</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesType = typeFilter === 'all' || member.membershipType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const onSubmit = (values: z.infer<typeof memberFormSchema>) => {
    // Handle form submission
    console.log(values);
    setIsAddMemberDialogOpen(false);
    setIsSuccessDialogOpen(true);
    
    // Reset form
    form.reset();
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
          className="w-full sm:w-auto premium-button"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/40">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search members by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 border-white/60 text-gray-800 placeholder:text-gray-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:flex lg:space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px] bg-white/70 border-white/60 text-gray-800">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-[180px] bg-white/70 border-white/60 text-gray-800">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="3 months">3 Months</SelectItem>
                  <SelectItem value="6 months">6 Months</SelectItem>
                  <SelectItem value="12 months">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List - Mobile Cards */}
      <div className="block lg:hidden space-y-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="glass-card border-white/40">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{member.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <Phone className="h-4 w-4 mr-1" />
                    {member.phone}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-gray-600 hover:bg-white/50">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md">
                    <DropdownMenuItem className="flex items-center">
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Membership Type</p>
                  <p className="text-sm font-medium text-gray-700">{member.membershipType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(member.status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Started:</span> {new Date(member.startDate).toLocaleDateString('en-US')}
                </div>
                <div>
                  <span className="font-medium">Expires:</span> {new Date(member.expiryDate).toLocaleDateString('en-US')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Members Table - Desktop */}
      <Card className="glass-card border-white/40 hidden lg:block">
        <CardHeader>
          <CardTitle className="text-gray-800">
            Members List ({filteredMembers.length})
          </CardTitle>
          <CardDescription className="text-gray-600">
            Overview of all gym members and their membership status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-600">Name</TableHead>
                  <TableHead className="text-gray-600">Phone</TableHead>
                  <TableHead className="text-gray-600">Membership Type</TableHead>
                  <TableHead className="text-gray-600">Start Date</TableHead>
                  <TableHead className="text-gray-600">Expiry Date</TableHead>
                  <TableHead className="text-gray-600">Status</TableHead>
                  <TableHead className="text-gray-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} className="border-gray-100 hover:bg-white/50">
                    <TableCell className="text-gray-800 font-medium">{member.name}</TableCell>
                    <TableCell className="text-gray-600">{member.phone}</TableCell>
                    <TableCell className="text-gray-600">{member.membershipType}</TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(member.startDate).toLocaleDateString('en-US')}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(member.expiryDate).toLocaleDateString('en-US')}
                    </TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-gray-600 hover:bg-white/50">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md">
                          <DropdownMenuItem className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="max-w-md glass-card border-white/40 sm:max-w-lg">
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter member's full name" 
                        className="bg-white/70 border-white/60"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter phone number" 
                          className="bg-white/70 border-white/60"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">CNIC</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter CNIC number" 
                          className="bg-white/70 border-white/60"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter member's address" 
                        className="bg-white/70 border-white/60"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admissionFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Admission Fee (Rs)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter admission fee" 
                        className="bg-white/70 border-white/60"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          <SelectTrigger className="bg-white/70 border-white/60">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white/95 backdrop-blur-md">
                          <SelectItem value="Strength">Strength</SelectItem>
                          <SelectItem value="Cardio">Cardio</SelectItem>
                          <SelectItem value="Cardio + Strength">Cardio + Strength</SelectItem>
                          <SelectItem value="Personal Training">Personal Training</SelectItem>
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
                          <SelectTrigger className="bg-white/70 border-white/60">
                            <SelectValue placeholder="Select fee type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white/95 backdrop-blur-md">
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Half Yearly">Half Yearly</SelectItem>
                          <SelectItem value="Annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-6">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="bg-white/70 border-white/60" 
                  onClick={() => setIsAddMemberDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="premium-button"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Member
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
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-800 text-center">
              Member Added Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center mt-2">
              The member has been registered in the system.
            </DialogDescription>
            
            <div className="mt-8 w-full">
              <Button 
                className="w-full premium-button"
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                  toast({
                    title: "WhatsApp notification sent",
                    description: "Welcome message has been sent to the member",
                  });
                }}
              >
                Send WhatsApp Welcome Message
              </Button>
              <Button
                className="w-full mt-3"
                variant="outline"
                onClick={() => setIsSuccessDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;
