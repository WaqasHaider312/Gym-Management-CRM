
// This is a simulated service for WhatsApp functionality in demo mode

type Transaction = {
  memberName: string;
  memberPhone: string;
  amount: number;
  feeType: string;
  paymentMethod: string;
  date: string;
  addedBy: string;
};

class WhatsAppService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    // For demo purposes, we're using placeholder values
    this.apiUrl = 'https://api.example.com/whatsapp';
    this.apiKey = 'demo-key-1234567890';
  }

  async sendPaymentConfirmation(transaction: Transaction): Promise<boolean> {
    // In a real implementation, this would send a request to the WhatsApp API
    // For demo purposes, we'll simulate a successful API call
    console.log('Sending WhatsApp payment confirmation to:', transaction.memberPhone);
    
    // Simulated message template
    const message = `
      Hello ${transaction.memberName},
      
      Your payment of Rs.${transaction.amount} for ${transaction.feeType} has been received via ${transaction.paymentMethod}.
      
      Thank you for being a member at RangeFitGym!
      
      - Team RangeFitGym
    `;
    
    console.log('WhatsApp message content:', message);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return success
    return true;
  }

  async sendMembershipReminder(memberName: string, phone: string, expiryDate: string): Promise<boolean> {
    // Simulate sending a membership reminder
    console.log('Sending membership reminder to:', phone);
    
    // Simulated message template
    const message = `
      Hello ${memberName},
      
      Your RangeFitGym membership is expiring on ${expiryDate}. 
      Please renew your membership to continue enjoying our facilities.
      
      - Team RangeFitGym
    `;
    
    console.log('WhatsApp reminder content:', message);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return success
    return true;
  }

  async sendWelcomeMessage(memberName: string, phone: string): Promise<boolean> {
    // Simulate sending a welcome message
    console.log('Sending welcome message to:', phone);
    
    // Simulated message template
    const message = `
      Welcome to RangeFitGym, ${memberName}!
      
      We're excited to have you as a member. Your membership is now active.
      
      Gym hours: 6:00 AM - 10:00 PM daily
      
      Feel free to contact us if you have any questions.
      
      - Team RangeFitGym
    `;
    
    console.log('WhatsApp welcome content:', message);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return success
    return true;
  }
}

export const whatsappService = new WhatsAppService();
