import React, { useState } from 'react';
import { testAPI, membersAPI, authAPI } from '@/services/googleSheetsAPI';

const APITest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      const result = await testFunction();
      setResults(prev => ({ ...prev, [testName]: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, [testName]: { error: error.message } }));
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">API Connection Test</h2>
      
      <div className="space-x-2">
        <button 
          onClick={() => runTest('api', testAPI)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          Test API
        </button>
        
        <button 
          onClick={() => runTest('login', () => authAPI.login('admin', 'password123'))}
          className="px-4 py-2 bg-green-500 text-white rounded"
          disabled={loading}
        >
          Test Login
        </button>
        
        <button 
          onClick={() => runTest('members', membersAPI.getAll)}
          className="px-4 py-2 bg-purple-500 text-white rounded"
          disabled={loading}
        >
          Get Members
        </button>
      </div>

      <div className="mt-6">
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default APITest;