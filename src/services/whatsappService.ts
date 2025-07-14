import { toast } from '@/hooks/use-toast';

export interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'receipt' | 'confirmation' | 'reminder' | 'expiry';
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  membershipType: string;
  expiryDate: string;
}

export interface Transaction {
  id: string;
  memberName: string;
  memberPhone: string;
  amount: number;
  feeType: string;
  date: string;
}

class WhatsAppService {
  // In a real implementation, you would configure your WhatsApp Business API
  private apiEndpoint = '';
  private apiKey = '';

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      console.log('Sending WhatsApp message:', message);
      
      // Demo implementation - in production, this would call actual WhatsApp API
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate success/failure (90% success rate for demo)
      const success = Math.random() > 0.1;
      
      if (success) {
        toast({
          title: "WhatsApp Sent!",
          description: `Message sent to ${message.to}`,
        });
        return true;
      } else {
        throw new Error('Failed to send WhatsApp message');
      }
    } catch (error) {
      console.error('WhatsApp send error:', error);
      toast({
        title: "WhatsApp Failed",
        description: "Failed to send WhatsApp message. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }

  // Send new member receipt
  async sendMemberReceipt(member: Member, admissionFee: number): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: member.phone,
      message: `🎉 Welcome to RangeFitGym, ${member.name}!

📋 Member ID: ${member.id}
💪 Membership: ${member.membershipType}
💰 Admission Fee: ₹${admissionFee.toLocaleString('en-IN')}
📅 Valid Until: ${new Date(member.expiryDate).toLocaleDateString('en-IN')}

Thank you for joining us! We're excited to be part of your fitness journey.

For any queries, feel free to contact us.
RangeFitGym Team 💪`,
      type: 'receipt'
    };

    return this.sendMessage(message);
  }

  // Send payment confirmation
  async sendPaymentConfirmation(transaction: Transaction): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: transaction.memberPhone,
      message: `✅ Payment Confirmed - RangeFitGym

👋 Hi ${transaction.memberName},

Your payment has been successfully received:

💰 Amount: ₹${transaction.amount.toLocaleString('en-IN')}
📋 Fee Type: ${transaction.feeType}
📅 Date: ${new Date(transaction.date).toLocaleDateString('en-IN')}
🆔 Transaction ID: ${transaction.id}

Thank you for your payment! Keep crushing your fitness goals! 💪

RangeFitGym Team`,
      type: 'confirmation'
    };

    return this.sendMessage(message);
  }

  // Send membership expiry reminder
  async sendExpiryReminder(member: Member, daysLeft: number): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: member.phone,
      message: `⏰ Membership Expiry Reminder - RangeFitGym

Hi ${member.name},

Your ${member.membershipType} membership is expiring soon!

📅 Expiry Date: ${new Date(member.expiryDate).toLocaleDateString('en-IN')}
⏳ Days Left: ${daysLeft} days

To continue enjoying our premium facilities, please renew your membership before it expires.

💡 Renew now to avoid any interruption in your fitness journey!

Contact us for renewal: [Your Contact]
RangeFitGym Team 💪`,
      type: 'reminder'
    };

    return this.sendMessage(message);
  }

  // Send membership expired notification
  async sendExpiryNotification(member: Member): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: member.phone,
      message: `❌ Membership Expired - RangeFitGym

Hi ${member.name},

Your ${member.membershipType} membership has expired on ${new Date(member.expiryDate).toLocaleDateString('en-IN')}.

To continue using our facilities, please renew your membership at the earliest.

We miss you at the gym! Come back stronger! 💪

For renewal, contact us: [Your Contact]
RangeFitGym Team`,
      type: 'expiry'
    };

    return this.sendMessage(message);
  }

  // Send bulk reminders for expiring memberships
  async sendBulkExpiryReminders(members: Member[]): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const member of members) {
      const expiryDate = new Date(member.expiryDate);
      const today = new Date();
      const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft > 0 && daysLeft <= 7) {
        const success = await this.sendExpiryReminder(member, daysLeft);
        if (success) {
          sent++;
        } else {
          failed++;
        }
        
        // Add delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return { sent, failed };
  }
}

export const whatsappService = new WhatsAppService();
