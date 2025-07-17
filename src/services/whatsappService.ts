
// Mock WhatsApp service for demo purposes
export const whatsappService = {
  // Send a member receipt via WhatsApp
  sendMemberReceipt: async (
    memberName: string,
    memberPhone: string,
    membershipType: string,
    amount: number,
    date: string
  ) => {
    console.log('Sending WhatsApp receipt to:', memberPhone);
    console.log('Receipt details:', {
      memberName,
      membershipType,
      amount,
      date
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return success response
    return {
      success: true,
      message: 'WhatsApp receipt sent successfully'
    };
  },

  // Send bulk expiry reminders
  sendBulkExpiryReminders: async (members: any[]) => {
    console.log('Sending bulk expiry reminders to members:', members);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate some successful and some failed sends
    const successful = Math.floor(members.length * 0.8);
    const failed = members.length - successful;
    
    return {
      success: successful,
      failed: failed,
      total: members.length
    };
  },

  // Send individual expiry reminder
  sendExpiryReminder: async (member: any) => {
    console.log('Sending expiry reminder to:', member.phone);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Expiry reminder sent successfully'
    };
  }
};
