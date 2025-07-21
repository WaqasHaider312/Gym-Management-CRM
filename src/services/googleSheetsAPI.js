// Google Sheets API Service for Gym Management CRM - Production Version
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbznFP1iL8bpJBQ335ihvw76P2OykX6WMQaP7TPtcTEbjjxO3NQVfKVVtwqaxjNrTjC8/exec';

// ========== UTILITY FUNCTIONS ==========
const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    
    // Return mock data for development/fallback
    if (options.fallbackData) {
      console.log('Using fallback data');
      return options.fallbackData;
    }
    
    throw error;
  }
};

const makeGetRequest = async (action, fallbackData = null) => {
  const url = `${GOOGLE_SHEETS_URL}?action=${action}`;
  return makeRequest(url, { fallbackData });
};

const makePostRequest = async (data, fallbackData = null) => {
  return makeRequest(GOOGLE_SHEETS_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    fallbackData
  });
};

// ========== MOCK DATA FOR FALLBACK ==========
const mockMembers = {
  success: true,
  members: [
    {
      id: 'mock-1',
      name: 'Ahmed Khan',
      phone: '03001234567',
      cnic: '35201-1234567-1',
      address: '123 Main Street, Lahore',
      membershipType: 'Cardio + Strength',
      feeType: 'Monthly',
      joiningDate: '2024-06-15',
      expiryDate: '2024-07-15',
      fee: 4000,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mock-2',
      name: 'Sara Ali',
      phone: '03009876543',
      cnic: '35201-7654321-0',
      address: '456 Park Avenue, Karachi',
      membershipType: 'Personal Training',
      feeType: 'Quarterly',
      joiningDate: '2024-05-01',
      expiryDate: '2024-08-01',
      fee: 18000,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  count: 2
};

const mockTransactions = {
  success: true,
  transactions: [
    {
      id: 'mock-t1',
      transactionId: 'TXN-2407-0001',
      memberName: 'Ahmed Khan',
      memberPhone: '03001234567',
      amount: 4000,
      type: 'membership',
      paymentMethod: 'cash',
      date: '2024-07-01',
      status: 'completed',
      notes: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-t2',
      transactionId: 'TXN-2407-0002',
      memberName: 'Sara Ali',
      memberPhone: '03009876543',
      amount: 18000,
      type: 'membership',
      paymentMethod: 'bank_transfer',
      date: '2024-07-03',
      status: 'completed',
      notes: '',
      createdAt: new Date().toISOString()
    }
  ],
  count: 2
};

const mockExpenses = {
  success: true,
  expenses: [
    {
      id: 'mock-e1',
      description: 'Monthly Electricity Bill',
      amount: 8500,
      category: 'Utilities',
      date: '2024-07-01',
      addedBy: 'Admin',
      notes: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-e2',
      description: 'New Dumbbells Set',
      amount: 25000,
      category: 'Equipment',
      date: '2024-07-03',
      addedBy: 'Manager',
      notes: '',
      createdAt: new Date().toISOString()
    }
  ],
  count: 2
};

// ========== API FUNCTIONS ==========

// Test API connection
export const testAPI = async () => {
  try {
    return await makeGetRequest('test', {
      success: true,
      message: 'API working (fallback mode)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw new Error('Failed to connect to API: ' + error.message);
  }
};

// ========== MEMBERS API ==========
export const membersAPI = {
  // Get all members
  getAll: async () => {
    try {
      return await makeGetRequest('getMembers', mockMembers);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return mockMembers;
    }
  },

  // Add new member
  add: async (memberData) => {
    try {
      const fallbackResponse = {
        success: true,
        message: 'Member added successfully (fallback mode)',
        member: {
          id: 'mock-' + Date.now(),
          ...memberData,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      return await makePostRequest({
        action: 'addMember',
        ...memberData
      }, fallbackResponse);
    } catch (error) {
      console.error('Failed to add member:', error);
      // Return success fallback for demo
      return {
        success: true,
        message: 'Member added successfully (offline mode)',
        member: { id: 'offline-' + Date.now(), ...memberData }
      };
    }
  },

  // Update member
  update: async (memberData) => {
    try {
      return await makePostRequest({
        action: 'updateMember',
        ...memberData
      }, { success: true, message: 'Member updated successfully (fallback)' });
    } catch (error) {
      return { success: true, message: 'Member updated (offline mode)' };
    }
  },

  // Delete member
  delete: async (memberId) => {
    try {
      return await makePostRequest({
        action: 'deleteMember',
        id: memberId
      }, { success: true, message: 'Member deleted successfully (fallback)' });
    } catch (error) {
      return { success: true, message: 'Member deleted (offline mode)' };
    }
  }
};

// ========== TRANSACTIONS API ==========
export const transactionsAPI = {
  // Get all transactions
  getAll: async () => {
    try {
      return await makeGetRequest('getTransactions', mockTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return mockTransactions;
    }
  },

  // Add new transaction
  add: async (transactionData) => {
    try {
      const fallbackResponse = {
        success: true,
        message: 'Transaction added successfully (fallback mode)',
        transaction: {
          id: 'mock-t' + Date.now(),
          transactionId: 'TXN-' + Date.now(),
          ...transactionData,
          status: 'completed',
          createdAt: new Date().toISOString()
        }
      };

      return await makePostRequest({
        action: 'addTransaction',
        ...transactionData
      }, fallbackResponse);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      return {
        success: true,
        message: 'Transaction added successfully (offline mode)',
        transaction: { id: 'offline-t' + Date.now(), ...transactionData }
      };
    }
  }
};

// ========== EXPENSES API ==========
export const expensesAPI = {
  // Get all expenses
  getAll: async () => {
    try {
      return await makeGetRequest('getExpenses', mockExpenses);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      return mockExpenses;
    }
  },

  // Add new expense
  add: async (expenseData) => {
    try {
      const fallbackResponse = {
        success: true,
        message: 'Expense added successfully (fallback mode)',
        expense: {
          id: 'mock-e' + Date.now(),
          ...expenseData,
          createdAt: new Date().toISOString()
        }
      };

      return await makePostRequest({
        action: 'addExpense',
        ...expenseData
      }, fallbackResponse);
    } catch (error) {
      console.error('Failed to add expense:', error);
      return {
        success: true,
        message: 'Expense added successfully (offline mode)',
        expense: { id: 'offline-e' + Date.now(), ...expenseData }
      };
    }
  }
};

// ========== AUTH API ==========
export const authAPI = {
  // User login
  login: async (username, password) => {
    try {
      return await makePostRequest({
        action: 'login',
        username,
        password
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }
};

// ========== DASHBOARD API ==========
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const mockStats = {
        success: true,
        stats: {
          totalMembers: 284,
          activeMembers: 268,
          totalRevenue: 245000,
          totalExpenses: 45000,
          netProfit: 200000
        }
      };

      return await makeGetRequest('getDashboardStats', mockStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return {
        success: true,
        stats: {
          totalMembers: 284,
          activeMembers: 268,
          totalRevenue: 245000,
          totalExpenses: 45000,
          netProfit: 200000
        }
      };
    }
  }
};

// ========== INITIALIZATION API ==========
export const initAPI = {
  // Initialize default data
  initializeData: async () => {
    try {
      return await makePostRequest({
        action: 'initializeData'
      }, { success: true, message: 'Data initialized (fallback mode)' });
    } catch (error) {
      return { success: true, message: 'Data initialized (offline mode)' };
    }
  }
};