// Google Sheets API Service - URL Parameters Version
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwttJwHwDJNnC_Xy-DWmhmHEg88LVQF1RNOhOOrwYEaISOA2N_zPTXVpgfd8zZxcuLx/exec';

// ========== JSONP UTILITY FUNCTION ==========
const makeJSONPRequest = (url) => {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    
    // Create callback function
    window[callbackName] = (data) => {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };
    
    // Create script tag
    const script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    script.onerror = () => {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error('JSONP request failed'));
    };
    
    // Add script to document
    document.body.appendChild(script);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        document.body.removeChild(script);
        reject(new Error('JSONP request timeout'));
      }
    }, 10000);
  });
};

// ========== API FUNCTIONS ==========

// Test API connection
export const testAPI = async () => {
  try {
    return await makeJSONPRequest(`${GOOGLE_SHEETS_URL}?action=test`);
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
      return await makeJSONPRequest(`${GOOGLE_SHEETS_URL}?action=getMembers`);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return {
        success: false,
        error: 'Failed to fetch members',
        members: []
      };
    }
  },

  // Add new member using URL parameters
  add: async (memberData) => {
    try {
      const params = new URLSearchParams({
        action: 'addMember',
        name: memberData.name || '',
        phone: memberData.phone || '',
        cnic: memberData.cnic || '',
        address: memberData.address || '',
        membershipType: memberData.membershipType || '',
        feeType: memberData.feeType || '',
        fee: memberData.fee || 0,
        expiryDate: memberData.expiryDate || ''
      });

      const url = `${GOOGLE_SHEETS_URL}?${params.toString()}`;
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
      return await makeJSONPRequest(`${GOOGLE_SHEETS_URL}?action=getTransactions`);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return {
        success: false,
        error: 'Failed to fetch transactions',
        transactions: []
      };
    }
  },

  // Add new transaction using URL parameters
  add: async (transactionData) => {
    try {
      const params = new URLSearchParams({
        action: 'addTransaction',
        memberName: transactionData.memberName || '',
        memberPhone: transactionData.memberPhone || '',
        amount: transactionData.amount || 0,
        type: transactionData.type || 'membership',
        paymentMethod: transactionData.paymentMethod || 'cash',
        date: transactionData.date || new Date().toISOString().split('T')[0],
        notes: transactionData.notes || ''
      });

      const url = `${GOOGLE_SHEETS_URL}?${params.toString()}`;
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
      return await makeJSONPRequest(`${GOOGLE_SHEETS_URL}?action=getExpenses`);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      return {
        success: false,
        error: 'Failed to fetch expenses',
        expenses: []
      };
    }
  },

  // Add new expense using URL parameters
  add: async (expenseData) => {
    try {
      const params = new URLSearchParams({
        action: 'addExpense',
        description: expenseData.description || '',
        amount: expenseData.amount || 0,
        category: expenseData.category || 'Other',
        date: expenseData.date || new Date().toISOString().split('T')[0],
        addedBy: expenseData.addedBy || 'Admin',
        notes: expenseData.notes || ''
      });

      const url = `${GOOGLE_SHEETS_URL}?${params.toString()}`;
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
      const params = new URLSearchParams({
        action: 'login',
        username: username,
        password: password
      });

      const url = `${GOOGLE_SHEETS_URL}?${params.toString()}`;
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
      return await makeJSONPRequest(`${GOOGLE_SHEETS_URL}?action=getUsers`);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return {
        success: false,
        error: 'Failed to fetch users',
        users: []
      };
    }
  }
};

// ========== DASHBOARD API ==========
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      return await makeJSONPRequest(`${GOOGLE_SHEETS_URL}?action=getDashboardStats`);
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
      return await makeJSONPRequest(`${GOOGLE_SHEETS_URL}?action=initializeData`);
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