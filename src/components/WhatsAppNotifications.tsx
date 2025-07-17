import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Users, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { whatsappService } from '@/services/whatsappService';
import { toast } from '@/hooks/use-toast';

const WhatsAppNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demo
  const expiringMembers = [
    { id: 'M001', name: 'John Doe', phone: '+923001234567', membershipType: 'Premium', expiryDate: '2024-07-15' },
    { id: 'M002', name: 'Sarah Wilson', phone: '+923009876543', membershipType: 'Basic', expiryDate: '2024-07-12' },
    { id: 'M003', name: 'Mike Johnson', phone: '+923331234567', membershipType: 'Premium', expiryDate: '2024-07-18' },
  ];

  const handleSendReminders = async () => {
    setIsLoading(true);
    try {
      const result = await whatsappService.sendBulkExpiryReminders(expiringMembers);
      
      toast({
        title: "Reminders Sent!",
        description: `Successfully sent ${result.success} reminders. ${result.failed} failed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    await whatsappService.sendMemberReceipt(
      'Test User',
      '+923999999999',
      'Premium',
      5000,
      new Date().toLocaleDateString('en-US')
    );
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Integration Status */}
      <Card className="glass-card border-white/40">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <MessageCircle className="mr-2 h-5 w-5 text-green-600" />
            WhatsApp Notifications
          </CardTitle>
          <CardDescription className="text-gray-600">
            Automated WhatsApp messaging for members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">WhatsApp Service Active</span>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300">
              Demo Mode
            </Badge>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleTestNotification}
              variant="outline" 
              className="flex items-center justify-center glass-card border-blue-200 hover:bg-blue-50"
            >
              <Send className="mr-2 h-4 w-4" />
              Test Notification
            </Button>
            
            <Button 
              onClick={handleSendReminders}
              disabled={isLoading}
              className="premium-button"
            >
              <Users className="mr-2 h-4 w-4" />
              {isLoading ? 'Sending...' : 'Send All Reminders'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Memberships */}
      <Card className="glass-card border-white/40">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Calendar className="mr-2 h-5 w-5 text-orange-600" />
            Expiring Memberships
          </CardTitle>
          <CardDescription className="text-gray-600">
            Members whose membership expires within 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expiringMembers.map((member) => {
              const daysLeft = getDaysUntilExpiry(member.expiryDate);
              return (
                <div key={member.id} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-400 to-red-500">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.membershipType} - {member.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      className={`${
                        daysLeft <= 3 
                          ? 'bg-red-100 text-red-800 border-red-300' 
                          : 'bg-orange-100 text-orange-800 border-orange-300'
                      }`}
                    >
                      {daysLeft} days left
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Expires: {new Date(member.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Message Templates */}
      <Card className="glass-card border-white/40">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <AlertTriangle className="mr-2 h-5 w-5 text-blue-600" />
            Automated Messages
          </CardTitle>
          <CardDescription className="text-gray-600">
            Types of automated WhatsApp notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Welcome Receipt</h4>
              <p className="text-sm text-blue-600">Sent when new member joins</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Payment Confirmation</h4>
              <p className="text-sm text-green-600">Sent after fee payment</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Expiry Reminder</h4>
              <p className="text-sm text-orange-600">7 days before expiry</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Expired Notice</h4>
              <p className="text-sm text-red-600">When membership expires</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppNotifications;
