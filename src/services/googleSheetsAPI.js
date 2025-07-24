// Google Sheets API Service - Complete JSONP Implementation
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbweHHm-ZS39VAH-uKOVVPBdjyES0rDhg4kx-paMwb2UjorpxCS7mOt4KArPlEYV8AeZ/exec';

// ========== UNIFIED JSONP UTILITY FUNCTION ==========
const makeJSONPRequest = (url) => {
  return new Promise((resolve, reject) => {
    const callbackName = 'callback_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    
    // Set up the global callback
    window[callbackName] = function(data) {
      // Clean up
      delete window[callbackName];
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      resolve(data);
    };
    
    // Create script element
    const script = document.createElement('script');
    
    // Set up error handling
    script.onerror = function() {
      delete window[callbackName];
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      reject(new Error('Script loading failed'));
    };
    
    // Add callback parameter to URL
    const separator = url.includes('?') ? '&' : '?';
    script.src = url + separator + 'callback=' + callbackName;
    
    // Add script to page
    document.head.appendChild(script);
    
    // Set timeout for cleanup
    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        reject(new Error('Request timeout'));
      }
    }, 15000);
  });
};

// ========== MEMBERS API ==========
export const membersAPI = {
  // Get all members
  getAll: async () => {
    try {
      const url = `${GOOGLE_SHEETS_URL}?action=getMembers`;
      console.log('Fetching members from:', url);
      return await makeJSONPRequest(url);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return {
        success: false,
        error: 'Failed to fetch members',
        members: [],
        message: error.message
      };
    }
  },

  // Add new member
  add: async (memberData) => {
    try {
      const params = new URLSearchParams();
      params.append('action', 'addMember');
      params.append('name', memberData.name || '');
      params.append('phone', memberData.phone || '');
      params.append('email', memberData.email || '');
      params.append('membershipType', memberData.membershipType || '');
      params.append('membershipDuration', memberData.membershipDuration || '');
      params.append('joiningDate', memberData.joiningDate || '');
      params.append('expiryDate', memberData.expiryDate || '');
      params.append('membershipStatus', memberData.membershipStatus || 'Active');
      params.append('emergencyContact', memberData.emergencyContact || '');
      params.append('address', memberData.address || '');
      params.append('notes', memberData.notes || '');

      const url = `${GOOGLE_SHEETS_URL}?${params.toString()}`;
      console.log('Adding member to:', url);
      return await makeJSONPRequest(url);
    } catch (error) {
      console.error('Failed to add member:', error);
      return {
        success: false,
        error: 'Failed to add member',
        message: error.message
      };
    }
  }
};

// ========== TRANSACTIONS API ==========
export const transactionsAPI = {
  // Get all transactions
  getAll: async () => {
    try {
      const url = `${GOOGLE_SHEETS_URL}?action=getTransactions`;
      console.log('Fetching transactions from:', url);
      return await makeJSONPRequest(url);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return {
        success: false,
        error: 'Failed to fetch transactions',
        transactions: [],
        message: error.message
      };
    }
  },

  // Add new transaction
  add: async (transactionData) => {
    try {
      const params = new URLSearchParams();
      params.append('action', 'addTransaction');
      params.append('memberName', transactionData.memberName || '');
      params.append('memberPhone', transactionData.memberPhone || '');
      params.append('amount', transactionData.amount || '0');
      params.append('type', transactionData.type || 'membership');
      params.append('paymentMethod', transactionData.paymentMethod || 'cash');
      params.append('date', transactionData.date || new Date().toISOString().split('T')[0]);
      params.append('status', transactionData.status || 'completed');
      params.append('notes', transactionData.notes || '');

      const url = `${GOOGLE_SHEETS_URL}?${params.toString()}`;
      console.log('Adding transaction to:', url);
      return await makeJSONPRequest(url);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      return {
        success: false,
        error: 'Failed to add transaction',
        message: error.message
      };
    }
  }
};

// ========== EXPENSES API ==========
export const expensesAPI = {
  // Get all expenses
  getAll: async () => {
    try {
      const url = `${GOOGLE_SHEETS_URL}?action=getExpenses`;
      console.log('Fetching expenses from:', url);
      return await makeJSONPRequest(url);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      return {
        success: false,
        error: 'Failed to fetch expenses',
        expenses: [],
        message: error.message
      };
    }
  },

  // Add new expense
  add: async (expenseData) => {
    try {
      const params = new URLSearchParams();
      params.append('action', 'addExpense');
      params.append('description', expenseData.description || '');
      params.append('amount', expenseData.amount || '0');
      params.append('category', expenseData.category || 'Other');
      params.append('date', expenseData.date || new Date().toISOString().split('T')[0]);
      params.append('addedBy', expenseData.addedBy || 'Admin');
      params.append('notes', expenseData.notes || '');

      const url = `${GOOGLE_SHEETS_URL}?${params.toString()}`;
      console.log('Adding expense to:', url);
      return await makeJSONPRequest(url);
    } catch (error) {
      console.error('Failed to add expense:', error);
      return {
        success: false,
        error: 'Failed to add expense',
        message: error.message
      };
    }
  }
};

// ========== AUTH API ==========
export const authAPI = {
  // User login
  login: async (username, password) => {
    try {
      const params = new URLSearchParams();
      params.append('action', 'authenticateUser');
      params.append('username', username);
      params.append('password', password);

      const url = `${GOOGLE_SHEETS_URL}?${params.toString()}`;
      console.log('Login attempt to:', url);
      return await makeJSONPRequest(url);
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: 'Login failed',
        message: error.message
      };
    }
  },

  // Get all users (admin only)
  getUsers: async () => {
    try {
      const url = `${GOOGLE_SHEETS_URL}?action=getUsers`;
      console.log('Fetching users from:', url);
      return await makeJSONPRequest(url);
    } catch (error) {
      console.error('Error fetching users:', error);
      return { 
        success: false, 
        error: 'Failed to fetch users',
        users: [],
        message: error.message 
      };
    }
  },

  // Add new user (admin only)
  add: async (userData) => {
    try {
      const params = new URLSearchParams();
      params.append('action', 'addUser');
      params.append('username', userData.username);
      params.append('password', userData.password);
      params.append('role', userData.role);
      params.append('name', userData.name);
      params.append('phone', userData.phone || '');

      const url = `${GOOGLE_SHEETS_URL}?${params.toString()}`;
      console.log('Adding user to:', url);
      return await makeJSONPRequest(url);
    } catch (error) {
      console.error('Error adding user:', error);
      return { 
        success: false, 
        error: 'Failed to add user',
        message: error.message 
      };
    }
  }
};

// ========== DASHBOARD API ==========
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const url = `${GOOGLE_SHEETS_URL}?action=getDashboardStats`;
      console.log('Fetching dashboard stats from:', url);
      return await makeJSONPRequest(url);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return {
        success: false,
        error: 'Failed to fetch dashboard stats',
        stats: {
          totalMembers: 0,
          activeMembers: 0,
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          thisMonthMembers: 0,
          thisMonthRevenue: 0,
          thisMonthExpenses: 0,
          expiringMemberships: 0
        },
        message: error.message
      };
    }
  }
};

// ========== UTILITY FUNCTIONS ==========

// Test API connection
export const testAPI = async () => {
  try {
    const url = `${GOOGLE_SHEETS_URL}?action=test`;
    return await makeJSONPRequest(url);
  } catch (error) {
    console.error('API test failed:', error);
    return {
      success: false,
      error: 'API connection failed',
      message: error.message
    };
  }
};

// Check API connection status
export const checkAPIConnection = async () => {
  try {
    const result = await testAPI();
    return result.success;
  } catch (error) {
    return false;
  }
};

// Debug function to test all endpoints
export const debugAPI = async () => {
  console.log('=== API Debug Test ===');
  
  try {
    console.log('Testing API endpoints...');
    
    const testResult = await testAPI();
    console.log('1. Test API:', testResult);
    
    const membersResult = await membersAPI.getAll();
    console.log('2. Get Members:', membersResult);
    
    const transactionsResult = await transactionsAPI.getAll();
    console.log('3. Get Transactions:', transactionsResult);
    
    const expensesResult = await expensesAPI.getAll();
    console.log('4. Get Expenses:', expensesResult);
    
    const statsResult = await dashboardAPI.getStats();
    console.log('5. Dashboard Stats:', statsResult);
    
    return {
      test: testResult,
      members: membersResult,
      transactions: transactionsResult,
      expenses: expensesResult,
      stats: statsResult
    };
  } catch (error) {
    console.error('Debug API failed:', error);
    return { error: error.message };
  }
};