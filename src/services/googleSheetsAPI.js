// Enhanced Google Sheets API Service with better error handling and performance
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzfhXxGNqtSx17Ly2jNc22Cev-rXLgMQ2HVv20beqdhdmoWpV_0DSctrhOoK_2L7AZZ/exec';

// ========== ENHANCED JSONP UTILITY WITH CACHING ==========
class APIClient {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache
    this.requestQueue = new Map();
  }

  // Enhanced JSONP with caching and deduplication
  async makeRequest(url, options = {}) {
    const { cache = false, timeout = 15000 } = options;
    
    // Check cache first
    if (cache && this.cache.has(url)) {
      const cached = this.cache.get(url);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(url);
    }

    // Deduplicate concurrent requests
    if (this.requestQueue.has(url)) {
      return this.requestQueue.get(url);
    }

    const promise = new Promise((resolve, reject) => {
      const callbackName = 'callback_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      
      // Set up the global callback
      window[callbackName] = (data) => {
        // Clean up
        delete window[callbackName];
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        
        // Cache successful responses
        if (cache && data.success) {
          this.cache.set(url, { data, timestamp: Date.now() });
        }
        
        resolve(data);
        this.requestQueue.delete(url);
      };
      
      // Create script element
      const script = document.createElement('script');
      
      // Enhanced error handling
      script.onerror = () => {
        delete window[callbackName];
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        reject(new Error('Network error - Please check your connection'));
        this.requestQueue.delete(url);
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
          reject(new Error('Request timeout - Server may be busy'));
          this.requestQueue.delete(url);
        }
      }, timeout);
    });

    this.requestQueue.set(url, promise);
    return promise;
  }

  // Clear cache manually
  clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Create global API client instance
const apiClient = new APIClient();

// ========== UTILITY FUNCTIONS ==========
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : { id: 'system', name: 'System' };
  } catch {
    return { id: 'system', name: 'System' };
  }
};

const buildURL = (action, params = {}) => {
  const urlParams = new URLSearchParams();
  urlParams.append('action', action);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      urlParams.append(key, String(value));
    }
  });
  
  return `${GOOGLE_SHEETS_URL}?${urlParams.toString()}`;
};

const handleAPIResponse = (response, defaultData = {}) => {
  if (!response) {
    return {
      success: false,
      error: 'No response received',
      data: defaultData
    };
  }
  
  return {
    success: response.success || false,
    error: response.error || null,
    message: response.message || null,
    ...response
  };
};

// ========== MEMBERS API ==========
export const membersAPI = {
  // Get all members with caching
  getAll: async (useCache = true) => {
    try {
      const url = buildURL('getMembers');
      console.log('Fetching members from:', url);
      
      const response = await apiClient.makeRequest(url, { cache: useCache });
      return handleAPIResponse(response, { members: [] });
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

  // Get single member by ID
  getById: async (memberId) => {
    try {
      const url = buildURL('getMember', { memberId });
      const response = await apiClient.makeRequest(url);
      return handleAPIResponse(response, { member: null });
    } catch (error) {
      console.error('Failed to fetch member:', error);
      return {
        success: false,
        error: 'Failed to fetch member',
        member: null,
        message: error.message
      };
    }
  },

  // Add new member with validation
  add: async (memberData) => {
    try {
      // Client-side validation
      const requiredFields = ['name', 'phone', 'membershipType', 'fee'];
      const missingFields = requiredFields.filter(field => !memberData[field]);
      
      if (missingFields.length > 0) {
        return {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          message: 'Please fill all required fields'
        };
      }

      const user = getCurrentUser();
      const params = {
        name: memberData.name?.trim(),
        phone: memberData.phone?.trim(),
        cnic: memberData.cnic?.trim() || '',
        address: memberData.address?.trim() || '',
        membershipType: memberData.membershipType,
        feeType: memberData.feeType || 'monthly',
        joiningDate: memberData.joiningDate || new Date().toISOString().split('T')[0],
        expiryDate: memberData.expiryDate || '',
        fee: Number(memberData.fee) || 0,
        status: memberData.status || 'active',
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('addMember', params);
      console.log('Adding member to:', url);
      
      const response = await apiClient.makeRequest(url);
      
      // Clear members cache after successful add
      if (response.success) {
        apiClient.clearCache();
      }
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to add member:', error);
      return {
        success: false,
        error: 'Failed to add member',
        message: error.message
      };
    }
  },

  // Update member
  update: async (memberId, memberData) => {
    try {
      if (!memberId) {
        return {
          success: false,
          error: 'Member ID is required',
          message: 'Please provide a valid member ID'
        };
      }

      const user = getCurrentUser();
      const params = {
        memberId,
        name: memberData.name?.trim() || '',
        phone: memberData.phone?.trim() || '',
        cnic: memberData.cnic?.trim() || '',
        address: memberData.address?.trim() || '',
        membershipType: memberData.membershipType || '',
        feeType: memberData.feeType || '',
        joiningDate: memberData.joiningDate || '',
        expiryDate: memberData.expiryDate || '',
        fee: Number(memberData.fee) || 0,
        status: memberData.status || 'active',
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('updateMember', params);
      console.log('Updating member:', url);
      
      const response = await apiClient.makeRequest(url);
      
      // Clear cache after successful update
      if (response.success) {
        apiClient.clearCache();
      }
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to update member:', error);
      return {
        success: false,
        error: 'Failed to update member',
        message: error.message
      };
    }
  },

  // Delete member
  delete: async (memberId) => {
    try {
      if (!memberId) {
        return {
          success: false,
          error: 'Member ID is required',
          message: 'Please provide a valid member ID'
        };
      }

      const user = getCurrentUser();
      const params = {
        memberId,
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('deleteMember', params);
      console.log('Deleting member:', url);
      
      const response = await apiClient.makeRequest(url);
      
      // Clear cache after successful delete
      if (response.success) {
        apiClient.clearCache();
      }
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to delete member:', error);
      return {
        success: false,
        error: 'Failed to delete member',
        message: error.message
      };
    }
  },

  // Search members
  search: async (searchTerm) => {
    try {
      const url = buildURL('searchMembers', { searchTerm });
      const response = await apiClient.makeRequest(url);
      return handleAPIResponse(response, { members: [] });
    } catch (error) {
      console.error('Failed to search members:', error);
      return {
        success: false,
        error: 'Failed to search members',
        members: [],
        message: error.message
      };
    }
  }
};

// ========== TRANSACTIONS API ==========
export const transactionsAPI = {
  // Get all transactions
  getAll: async (useCache = true) => {
    try {
      const url = buildURL('getTransactions');
      console.log('Fetching transactions from:', url);
      
      const response = await apiClient.makeRequest(url, { cache: useCache });
      return handleAPIResponse(response, { transactions: [] });
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

  // Get transactions by member
  getByMember: async (memberId) => {
    try {
      const url = buildURL('getTransactionsByMember', { memberId });
      const response = await apiClient.makeRequest(url);
      return handleAPIResponse(response, { transactions: [] });
    } catch (error) {
      console.error('Failed to fetch member transactions:', error);
      return {
        success: false,
        error: 'Failed to fetch member transactions',
        transactions: [],
        message: error.message
      };
    }
  },

  // Add new transaction
  add: async (transactionData) => {
    try {
      // Client-side validation
      const requiredFields = ['memberName', 'amount'];
      const missingFields = requiredFields.filter(field => !transactionData[field]);
      
      if (missingFields.length > 0) {
        return {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          message: 'Please fill all required fields'
        };
      }

      const user = getCurrentUser();
      const params = {
        memberName: transactionData.memberName?.trim(),
        memberPhone: transactionData.memberPhone?.trim() || '',
        amount: Number(transactionData.amount) || 0,
        type: transactionData.type || 'membership',
        paymentMethod: transactionData.paymentMethod || 'cash',
        date: transactionData.date || new Date().toISOString().split('T')[0],
        status: transactionData.status || 'completed',
        notes: transactionData.notes?.trim() || '',
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('addTransaction', params);
      console.log('Adding transaction to:', url);
      
      const response = await apiClient.makeRequest(url);
      
      // Clear cache after successful add
      if (response.success) {
        apiClient.clearCache();
      }
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      return {
        success: false,
        error: 'Failed to add transaction',
        message: error.message
      };
    }
  },

  // Update transaction
  update: async (transactionId, transactionData) => {
    try {
      if (!transactionId) {
        return {
          success: false,
          error: 'Transaction ID is required',
          message: 'Please provide a valid transaction ID'
        };
      }

      const user = getCurrentUser();
      const params = {
        transactionId,
        memberName: transactionData.memberName?.trim() || '',
        memberPhone: transactionData.memberPhone?.trim() || '',
        amount: Number(transactionData.amount) || 0,
        type: transactionData.type || 'membership',
        paymentMethod: transactionData.paymentMethod || 'cash',
        date: transactionData.date || '',
        status: transactionData.status || 'completed',
        notes: transactionData.notes?.trim() || '',
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('updateTransaction', params);
      const response = await apiClient.makeRequest(url);
      
      // Clear cache after successful update
      if (response.success) {
        apiClient.clearCache();
      }
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to update transaction:', error);
      return {
        success: false,
        error: 'Failed to update transaction',
        message: error.message
      };
    }
  }
};

// ========== EXPENSES API ==========
export const expensesAPI = {
  // Get all expenses
  getAll: async (useCache = true) => {
    try {
      const url = buildURL('getExpenses');
      console.log('Fetching expenses from:', url);
      
      const response = await apiClient.makeRequest(url, { cache: useCache });
      return handleAPIResponse(response, { expenses: [] });
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
      const requiredFields = ['description', 'amount', 'category'];
      const missingFields = requiredFields.filter(field => !expenseData[field]);
      
      if (missingFields.length > 0) {
        return {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          message: 'Please fill all required fields'
        };
      }

      const user = getCurrentUser();
      const params = {
        description: expenseData.description?.trim(),
        amount: Number(expenseData.amount) || 0,
        category: expenseData.category,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        addedBy: expenseData.addedBy || user.name,
        notes: expenseData.notes?.trim() || '',
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('addExpense', params);
      console.log('Adding expense to:', url);
      
      const response = await apiClient.makeRequest(url);
      
      // Clear cache after successful add
      if (response.success) {
        apiClient.clearCache();
      }
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to add expense:', error);
      return {
        success: false,
        error: 'Failed to add expense',
        message: error.message
      };
    }
  },

  // Update expense
  update: async (expenseId, expenseData) => {
    try {
      if (!expenseId) {
        return {
          success: false,
          error: 'Expense ID is required',
          message: 'Please provide a valid expense ID'
        };
      }

      const user = getCurrentUser();
      const params = {
        expenseId,
        description: expenseData.description?.trim() || '',
        amount: Number(expenseData.amount) || 0,
        category: expenseData.category || '',
        date: expenseData.date || '',
        addedBy: expenseData.addedBy || user.name,
        notes: expenseData.notes?.trim() || '',
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('updateExpense', params);
      const response = await apiClient.makeRequest(url);
      
      // Clear cache after successful update
      if (response.success) {
        apiClient.clearCache();
      }
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to update expense:', error);
      return {
        success: false,
        error: 'Failed to update expense',
        message: error.message
      };
    }
  },

  // Delete expense
  delete: async (expenseId) => {
    try {
      if (!expenseId) {
        return {
          success: false,
          error: 'Expense ID is required',
          message: 'Please provide a valid expense ID'
        };
      }

      const user = getCurrentUser();
      const params = {
        expenseId,
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('deleteExpense', params);
      const response = await apiClient.makeRequest(url);
      
      // Clear cache after successful delete
      if (response.success) {
        apiClient.clearCache();
      }
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to delete expense:', error);
      return {
        success: false,
        error: 'Failed to delete expense',
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
      if (!username || !password) {
        return {
          success: false,
          error: 'Username and password are required',
          message: 'Please enter both username and password'
        };
      }

      const params = {
        username: username.trim(),
        password: password.trim()
      };

      const url = buildURL('authenticateUser', params);
      console.log('Login attempt to:', url);
      
      const response = await apiClient.makeRequest(url);
      return handleAPIResponse(response);
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
      const url = buildURL('getUsers');
      console.log('Fetching users from:', url);
      
      const response = await apiClient.makeRequest(url);
      return handleAPIResponse(response, { users: [] });
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
      const requiredFields = ['username', 'password', 'role', 'name'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        return {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          message: 'Please fill all required fields'
        };
      }

      const user = getCurrentUser();
      const params = {
        username: userData.username.trim(),
        password: userData.password.trim(),
        role: userData.role,
        name: userData.name.trim(),
        phone: userData.phone?.trim() || '',
        requestUserId: user.id,
        requestUserName: user.name
      };

      const url = buildURL('addUser', params);
      console.log('Adding user to:', url);
      
      const response = await apiClient.makeRequest(url);
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Error adding user:', error);
      return { 
        success: false, 
        error: 'Failed to add user',
        message: error.message 
      };
    }
  },

  // Update user (admin only)
  update: async (userId, userData) => {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required',
          message: 'Please provide a valid user ID'
        };
      }

      const user = getCurrentUser();
      const params = {
        userId,
        username: userData.username?.trim() || '',
        password: userData.password?.trim() || '',
        role: userData.role || '',
        name: userData.name?.trim() || '',
        phone: userData.phone?.trim() || '',
        requestUserId: user.id,
        requestUserName: user.name
      };

      const url = buildURL('updateUser', params);
      console.log('Updating user:', url);
      
      const response = await apiClient.makeRequest(url);
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Error updating user:', error);
      return { 
        success: false, 
        error: 'Failed to update user',
        message: error.message 
      };
    }
  },

  // Delete user (admin only)
  delete: async (userId) => {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required',
          message: 'Please provide a valid user ID'
        };
      }

      const user = getCurrentUser();
      const params = {
        userId,
        requestUserId: user.id,
        requestUserName: user.name
      };

      const url = buildURL('deleteUser', params);
      console.log('Deleting user:', url);
      
      const response = await apiClient.makeRequest(url);
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Error deleting user:', error);
      return { 
        success: false, 
        error: 'Failed to delete user',
        message: error.message 
      };
    }
  }
};

// ========== ACTIVITY LOGS API ==========
export const activityLogsAPI = {
  // Get all activity logs (admin only)
  getAll: async (useCache = false) => {
    try {
      const url = buildURL('getActivityLogs');
      console.log('Fetching activity logs from:', url);
      
      const response = await apiClient.makeRequest(url, { cache: useCache });
      return handleAPIResponse(response, { logs: [] });
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      return {
        success: false,
        error: 'Failed to fetch activity logs',
        logs: [],
        message: error.message
      };
    }
  },

  // Log activity (internal use)
  log: async (actionType, details, type = 'system') => {
    try {
      const user = getCurrentUser();
      const params = {
        actionType,
        userId: user.id,
        userName: user.name,
        details: details?.trim() || '',
        type
      };

      const url = buildURL('logActivity', params);
      console.log('Logging activity:', url);
      
      const response = await apiClient.makeRequest(url);
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to log activity:', error);
      return {
        success: false,
        error: 'Failed to log activity',
        message: error.message
      };
    }
  }
};

// ========== DASHBOARD API ==========
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async (useCache = true) => {
    try {
      const url = buildURL('getDashboardStats');
      console.log('Fetching dashboard stats from:', url);
      
      const response = await apiClient.makeRequest(url, { cache: useCache });
      return handleAPIResponse(response, { 
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
        }
      });
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

// ========== ANALYTICS API ==========
export const analyticsAPI = {
  // Get revenue analytics
  getRevenueAnalytics: async (period = 'monthly') => {
    try {
      const url = buildURL('getRevenueAnalytics', { period });
      const response = await apiClient.makeRequest(url, { cache: true });
      return handleAPIResponse(response, { analytics: [] });
    } catch (error) {
      console.error('Failed to fetch revenue analytics:', error);
      return {
        success: false,
        error: 'Failed to fetch revenue analytics',
        analytics: [],
        message: error.message
      };
    }
  },

  // Get member analytics
  getMemberAnalytics: async () => {
    try {
      const url = buildURL('getMemberAnalytics');
      const response = await apiClient.makeRequest(url, { cache: true });
      return handleAPIResponse(response, { analytics: {} });
    } catch (error) {
      console.error('Failed to fetch member analytics:', error);
      return {
        success: false,
        error: 'Failed to fetch member analytics',
        analytics: {},
        message: error.message
      };
    }
  },

  // Get expense analytics
  getExpenseAnalytics: async (period = 'monthly') => {
    try {
      const url = buildURL('getExpenseAnalytics', { period });
      const response = await apiClient.makeRequest(url, { cache: true });
      return handleAPIResponse(response, { analytics: [] });
    } catch (error) {
      console.error('Failed to fetch expense analytics:', error);
      return {
        success: false,
        error: 'Failed to fetch expense analytics',
        analytics: [],
        message: error.message
      };
    }
  }
};

// ========== UTILITY FUNCTIONS ==========

// Test API connection
export const testAPI = async () => {
  try {
    const url = buildURL('healthCheck');
    const response = await apiClient.makeRequest(url);
    return handleAPIResponse(response);
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
  console.log('=== Enhanced API Debug Test ===');
  
  try {
    console.log('Testing API endpoints...');
    
    const results = {};
    
    results.test = await testAPI();
    console.log('1. Health Check:', results.test);
    
    results.members = await membersAPI.getAll(false);
    console.log('2. Get Members:', results.members);
    
    results.transactions = await transactionsAPI.getAll(false);
    console.log('3. Get Transactions:', results.transactions);
    
    results.expenses = await expensesAPI.getAll(false);
    console.log('4. Get Expenses:', results.expenses);
    
    results.stats = await dashboardAPI.getStats(false);
    console.log('5. Dashboard Stats:', results.stats);
    
    results.users = await authAPI.getUsers();
    console.log('6. Get Users:', results.users);
    
    results.logs = await activityLogsAPI.getAll(false);
    console.log('7. Activity Logs:', results.logs);
    
    results.revenueAnalytics = await analyticsAPI.getRevenueAnalytics();
    console.log('8. Revenue Analytics:', results.revenueAnalytics);
    
    results.memberAnalytics = await analyticsAPI.getMemberAnalytics();
    console.log('9. Member Analytics:', results.memberAnalytics);
    
    results.expenseAnalytics = await analyticsAPI.getExpenseAnalytics();
    console.log('10. Expense Analytics:', results.expenseAnalytics);
    
    // Cache stats
    console.log('Cache Stats:', apiClient.getCacheStats());
    
    return results;
  } catch (error) {
    console.error('Debug API failed:', error);
    return { error: error.message };
  }
};

// ========== BULK OPERATIONS API ==========
export const bulkAPI = {
  // Bulk import members
  importMembers: async (membersData) => {
    try {
      if (!Array.isArray(membersData) || membersData.length === 0) {
        return {
          success: false,
          error: 'Invalid members data',
          message: 'Please provide a valid array of members'
        };
      }

      const user = getCurrentUser();
      const params = {
        membersData: JSON.stringify(membersData),
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('bulkImportMembers', params);
      const response = await apiClient.makeRequest(url, { timeout: 30000 });
      
      // Clear cache after bulk import
      if (response.success) {
        apiClient.clearCache();
      }
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to bulk import members:', error);
      return {
        success: false,
        error: 'Failed to bulk import members',
        message: error.message
      };
    }
  },

  // Bulk update member status
  updateMemberStatus: async (memberIds, status) => {
    try {
      if (!Array.isArray(memberIds) || memberIds.length === 0) {
        return {
          success: false,
          error: 'Invalid member IDs',
          message: 'Please provide a valid array of member IDs'
        };
      }

      const user = getCurrentUser();
      const params = {
        memberIds: JSON.stringify(memberIds),
        status,
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('bulkUpdateMemberStatus', params);
      const response = await apiClient.makeRequest(url);
      
      // Clear cache after bulk update
      if (response.success) {
        apiClient.clearCache();
      }
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to bulk update member status:', error);
      return {
        success: false,
        error: 'Failed to bulk update member status',
        message: error.message
      };
    }
  },

  // Bulk send notifications
  sendNotifications: async (memberIds, message, type = 'general') => {
    try {
      if (!Array.isArray(memberIds) || memberIds.length === 0) {
        return {
          success: false,
          error: 'Invalid member IDs',
          message: 'Please provide a valid array of member IDs'
        };
      }

      if (!message || message.trim().length === 0) {
        return {
          success: false,
          error: 'Message is required',
          message: 'Please provide a valid message'
        };
      }

      const user = getCurrentUser();
      const params = {
        memberIds: JSON.stringify(memberIds),
        message: message.trim(),
        type,
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('bulkSendNotifications', params);
      const response = await apiClient.makeRequest(url, { timeout: 30000 });
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to send bulk notifications:', error);
      return {
        success: false,
        error: 'Failed to send bulk notifications',
        message: error.message
      };
    }
  }
};

// ========== REPORTS API ==========
export const reportsAPI = {
  // Generate financial report
  getFinancialReport: async (startDate, endDate) => {
    try {
      if (!startDate || !endDate) {
        return {
          success: false,
          error: 'Start date and end date are required',
          message: 'Please provide valid date range'
        };
      }

      const params = { startDate, endDate };
      const url = buildURL('getFinancialReport', params);
      const response = await apiClient.makeRequest(url, { cache: true });
      
      return handleAPIResponse(response, { report: {} });
    } catch (error) {
      console.error('Failed to generate financial report:', error);
      return {
        success: false,
        error: 'Failed to generate financial report',
        report: {},
        message: error.message
      };
    }
  },

  // Generate member report
  getMemberReport: async (filters = {}) => {
    try {
      const params = {
        status: filters.status || '',
        membershipType: filters.membershipType || '',
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || ''
      };

      const url = buildURL('getMemberReport', params);
      const response = await apiClient.makeRequest(url, { cache: true });
      
      return handleAPIResponse(response, { report: {} });
    } catch (error) {
      console.error('Failed to generate member report:', error);
      return {
        success: false,
        error: 'Failed to generate member report',
        report: {},
        message: error.message
      };
    }
  },

  // Export data
  exportData: async (type, format = 'csv') => {
    try {
      const params = { type, format };
      const url = buildURL('exportData', params);
      const response = await apiClient.makeRequest(url, { timeout: 30000 });
      
      return handleAPIResponse(response, { exportUrl: null });
    } catch (error) {
      console.error('Failed to export data:', error);
      return {
        success: false,
        error: 'Failed to export data',
        exportUrl: null,
        message: error.message
      };
    }
  }
};

// ========== NOTIFICATIONS API ==========
export const notificationsAPI = {
  // Get notification templates
  getTemplates: async () => {
    try {
      const url = buildURL('getNotificationTemplates');
      const response = await apiClient.makeRequest(url, { cache: true });
      return handleAPIResponse(response, { templates: [] });
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
      return {
        success: false,
        error: 'Failed to fetch notification templates',
        templates: [],
        message: error.message
      };
    }
  },

  // Save notification template
  saveTemplate: async (templateData) => {
    try {
      const requiredFields = ['name', 'message', 'type'];
      const missingFields = requiredFields.filter(field => !templateData[field]);
      
      if (missingFields.length > 0) {
        return {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          message: 'Please fill all required fields'
        };
      }

      const user = getCurrentUser();
      const params = {
        name: templateData.name.trim(),
        message: templateData.message.trim(),
        type: templateData.type,
        variables: templateData.variables || '',
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('saveNotificationTemplate', params);
      const response = await apiClient.makeRequest(url);
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to save notification template:', error);
      return {
        success: false,
        error: 'Failed to save notification template',
        message: error.message
      };
    }
  },

  // Send WhatsApp message
  sendWhatsApp: async (phone, message, templateId = null) => {
    try {
      if (!phone || !message) {
        return {
          success: false,
          error: 'Phone number and message are required',
          message: 'Please provide phone number and message'
        };
      }

      const user = getCurrentUser();
      const params = {
        phone: phone.trim(),
        message: message.trim(),
        templateId: templateId || '',
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('sendWhatsAppMessage', params);
      const response = await apiClient.makeRequest(url);
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return {
        success: false,
        error: 'Failed to send WhatsApp message',
        message: error.message
      };
    }
  },

  // Get notification history
  getHistory: async (limit = 50) => {
    try {
      const params = { limit };
      const url = buildURL('getNotificationHistory', params);
      const response = await apiClient.makeRequest(url);
      
      return handleAPIResponse(response, { history: [] });
    } catch (error) {
      console.error('Failed to fetch notification history:', error);
      return {
        success: false,
        error: 'Failed to fetch notification history',
        history: [],
        message: error.message
      };
    }
  }
};

// ========== SETTINGS API ==========
export const settingsAPI = {
  // Get gym settings
  getSettings: async () => {
    try {
      const url = buildURL('getGymSettings');
      const response = await apiClient.makeRequest(url, { cache: true });
      return handleAPIResponse(response, { settings: {} });
    } catch (error) {
      console.error('Failed to fetch gym settings:', error);
      return {
        success: false,
        error: 'Failed to fetch gym settings',
        settings: {},
        message: error.message
      };
    }
  },

  // Update gym settings
  updateSettings: async (settingsData) => {
    try {
      const user = getCurrentUser();
      const params = {
        gymName: settingsData.gymName || '',
        address: settingsData.address || '',
        phone: settingsData.phone || '',
        email: settingsData.email || '',
        currency: settingsData.currency || 'Rs.',
        timezone: settingsData.timezone || 'Asia/Karachi',
        autoReminders: settingsData.autoReminders || false,
        reminderDays: settingsData.reminderDays || 3,
        userId: user.id,
        userName: user.name
      };

      const url = buildURL('updateGymSettings', params);
      const response = await apiClient.makeRequest(url);
      
      // Clear cache after settings update
      if (response.success) {
        apiClient.clearCache();
      }
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('Failed to update gym settings:', error);
      return {
        success: false,
        error: 'Failed to update gym settings',
        message: error.message
      };
    }
  }
};

// ========== API CLIENT EXPORTS ==========
export { apiClient };

// Export convenience functions
export const clearAllCache = () => apiClient.clearCache();
export const getCacheStats = () => apiClient.getCacheStats();

// Global error handler for unhandled API errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('API')) {
    console.error('Unhandled API Error:', event.reason);
    // You can add toast notification here
  }
});

console.log('✅ Enhanced Google Sheets API Client loaded successfully');