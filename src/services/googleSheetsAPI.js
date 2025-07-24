// Google Sheets API Service - Fixed URL Construction
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwttJwHwDJNnC_Xy-DWmhmHEg88LVQF1RNOhOOrwYEaISOA2N_zPTXVpgfd8zZxcuLx/exec';

// ========== JSONP UTILITY FUNCTION ==========
// ========== SIMPLER JSONP FUNCTION ==========
const makeJSONPRequest = (url) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const callbackName = 'callback_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    // Set up the callback
    window[callbackName] = function(data) {
      // Clean up
      delete window[callbackName];
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      resolve(data);
    };
    
    // Set up error handling
    script.onerror = function() {
      delete window[callbackName];
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      reject(new Error('Script loading failed'));
    };
    
    // Add script to page
    script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);
    
    // Set timeout
    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        reject(new Error('Request timeout'));
      }
    }, 20000); // Increased to 20 seconds
  });
};
// ========== API FUNCTIONS ==========

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

  // Add new member using URL parameters
  add: async (memberData) => {
    try {
      const params = new URLSearchParams();
      params.append('action', 'addMember');
      params.append('name', memberData.name || '');
      params.append('phone', memberData.phone || '');
      params.append('cnic', memberData.cnic || '');
      params.append('address', memberData.address || '');
      params.append('membershipType', memberData.membershipType || '');
      params.append('feeType', memberData.feeType || '');
      params.append('fee', memberData.fee || '0');
      params.append('expiryDate', memberData.expiryDate || '');

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

  // Add new transaction using URL parameters
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

  // Add new expense using URL parameters
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
  // User login using URL parameters
  login: async (username, password) => {
    try {
      const params = new URLSearchParams();
      params.append('action', 'login');
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

  // Get all users
  getUsers: async () => {
    try {
      const url = `${GOOGLE_SHEETS_URL}?action=getUsers`;
      console.log('Fetching users from:', url);
      return await makeJSONPRequest(url);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return {
        success: false,
        error: 'Failed to fetch users',
        users: [],
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
          netProfit: 0
        },
        message: error.message
      };
    }
  }
};

// ========== INITIALIZATION API ==========
export const initAPI = {
  // Initialize default data
  initializeData: async () => {
    try {
      const url = `${GOOGLE_SHEETS_URL}?action=initializeData`;
      console.log('Initializing data at:', url);
      return await makeJSONPRequest(url);
    } catch (error) {
      console.error('Failed to initialize data:', error);
      return {
        success: false,
        error: 'Failed to initialize data',
        message: error.message
      };
    }
  }
};

// ========== HELPER FUNCTIONS ==========

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
    
    const statsResult = await dashboardAPI.getStats();
    console.log('3. Dashboard Stats:', statsResult);
    
    return {
      test: testResult,
      members: membersResult,
      stats: statsResult
    };
  } catch (error) {
    console.error('Debug API failed:', error);
    return { error: error.message };
  }
};