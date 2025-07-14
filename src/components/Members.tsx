
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
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  UserPlus
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  phone: string;
  membershipType: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'expiring_soon';
}

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data
  const members: Member[] = [
    {
      id: '1',
      name: 'John Doe',
      phone: '+91 9876543210',
      membershipType: '12 months',
      startDate: '2024-01-15',
      expiryDate: '2025-01-15',
      status: 'active'
    },
    {
      id: '2', 
      name: 'Sarah Wilson',
      phone: '+91 9876543211',
      membershipType: '6 months',
      startDate: '2024-06-01',
      expiryDate: '2024-12-01',
      status: 'expiring_soon'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      phone: '+91 9876543212', 
      membershipType: '3 months',
      startDate: '2024-03-01',
      expiryDate: '2024-06-01',
      status: 'expired'
    },
    {
      id: '4',
      name: 'Emma Brown',
      phone: '+91 9876543213',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <Users className="mr-3 h-8 w-8 text-blue-600" />
            Members Management
          </h1>
          <p className="text-gray-600">
            Manage your gym members and their memberships
          </p>
        </div>
        <Button className="mt-4 sm:mt-0 premium-button">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/40">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
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
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-white/70 border-white/60 text-gray-800">
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
              <SelectTrigger className="w-[180px] bg-white/70 border-white/60 text-gray-800">
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
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="glass-card border-white/40">
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
                      {new Date(member.startDate).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(member.expiryDate).toLocaleDateString('en-IN')}
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
    </div>
  );
};

export default Members;
