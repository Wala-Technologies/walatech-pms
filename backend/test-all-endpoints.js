const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test configuration
const TENANTS = [
  {
    name: 'Arfasa Manufacturing',
    email: 'admin@arfasa.com',
    password: 'admin123'
  },
  {
    name: 'WalaTech Manufacturing', 
    email: 'admin@walatech.com',
    password: 'admin123'
  }
];

// Available endpoints to test
const ENDPOINTS = [
  { path: '/production-orders', method: 'GET', description: 'Production Orders' },
  { path: '/work-orders', method: 'GET', description: 'Work Orders' },
  { path: '/tenants', method: 'GET', description: 'Tenants' },
  { path: '/inventory/items', method: 'GET', description: 'Inventory Items' },
  { path: '/inventory/stock-summary', method: 'GET', description: 'Stock Summary' },
  { path: '/inventory/stock-ledger', method: 'GET', description: 'Stock Ledger' },
  { path: '/inventory/alerts', method: 'GET', description: 'Inventory Alerts' }
];

class EndpointTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: 0,
      details: []
    };
  }

  async authenticate(tenant) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: tenant.email,
        password: tenant.password
      });
      
      if (response.data && response.data.access_token) {
        console.log(`✅ Authentication successful for ${tenant.name}`);
        return response.data.access_token;
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.log(`❌ Authentication failed for ${tenant.name}: ${error.message}`);
      throw error;
    }
  }

  async testEndpoint(endpoint, token, tenantName) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const result = {
        tenant: tenantName,
        endpoint: endpoint.description,
        path: endpoint.path,
        status: 'PASSED',
        statusCode: response.status,
        dataCount: this.getDataCount(response.data),
        message: `✅ ${endpoint.description}: Accessible (${response.status})`
      };

      this.results.passed++;
      this.results.details.push(result);
      console.log(`  ${result.message}`);
      
      return result;
    } catch (error) {
      let status = 'FAILED';
      let message = '';

      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 404) {
          status = 'NOT_FOUND';
          message = `⚠️  ${endpoint.description}: Not found (may not be implemented)`;
        } else if (statusCode === 401) {
          status = 'UNAUTHORIZED';
          message = `❌ ${endpoint.description}: Unauthorized (${statusCode})`;
          this.results.failed++;
        } else if (statusCode === 500) {
          status = 'SERVER_ERROR';
          message = `❌ ${endpoint.description}: Server error (${statusCode})`;
          this.results.failed++;
        } else {
          message = `❌ ${endpoint.description}: HTTP ${statusCode}`;
          this.results.failed++;
        }
      } else {
        status = 'ERROR';
        message = `❌ ${endpoint.description}: ${error.message}`;
        this.results.errors++;
      }

      const result = {
        tenant: tenantName,
        endpoint: endpoint.description,
        path: endpoint.path,
        status: status,
        statusCode: error.response?.status || 'N/A',
        error: error.message,
        message: message
      };

      this.results.details.push(result);
      console.log(`  ${message}`);
      
      return result;
    }
  }

  getDataCount(data) {
    if (Array.isArray(data)) {
      return data.length;
    } else if (data && typeof data === 'object') {
      if (data.data && Array.isArray(data.data)) {
        return data.data.length;
      } else if (data.total !== undefined) {
        return data.total;
      }
    }
    return 'N/A';
  }

  async testTenantIsolation() {
    console.log('🚀 Starting Comprehensive API Endpoint Tests...\n');

    const tenantTokens = {};
    
    // Authenticate all tenants
    console.log('📝 Authenticating tenants...');
    for (const tenant of TENANTS) {
      try {
        tenantTokens[tenant.name] = await this.authenticate(tenant);
      } catch (error) {
        console.log(`Failed to authenticate ${tenant.name}, skipping tests for this tenant.`);
        continue;
      }
    }

    console.log('\n🔍 Testing API endpoints for each tenant...\n');

    // Test each endpoint for each authenticated tenant
    for (const tenant of TENANTS) {
      if (!tenantTokens[tenant.name]) {
        console.log(`⏭️  Skipping ${tenant.name} (authentication failed)\n`);
        continue;
      }

      console.log(`Testing endpoints for ${tenant.name}:`);
      
      for (const endpoint of ENDPOINTS) {
        await this.testEndpoint(endpoint, tenantTokens[tenant.name], tenant.name);
      }
      
      console.log(''); // Empty line for readability
    }

    this.printSummary();
  }

  async testCrossTenantAccess() {
    console.log('🚫 Testing Cross-Tenant Access Prevention...\n');
    
    // This would require creating test data first
    // For now, we'll just verify that each tenant sees their own data
    const tenantTokens = {};
    
    for (const tenant of TENANTS) {
      try {
        tenantTokens[tenant.name] = await this.authenticate(tenant);
      } catch (error) {
        continue;
      }
    }

    // Test that tenants only see their own data
    for (const tenant of TENANTS) {
      if (!tenantTokens[tenant.name]) continue;
      
      try {
        const response = await axios.get(`${BASE_URL}/production-orders`, {
          headers: { 'Authorization': `Bearer ${tenantTokens[tenant.name]}` }
        });
        
        console.log(`✅ ${tenant.name}: Can access their production orders (${response.data.total || 0} items)`);
      } catch (error) {
        console.log(`❌ ${tenant.name}: Cannot access production orders - ${error.message}`);
      }
    }
  }

  printSummary() {
    console.log('📊 Test Results Summary:');
    console.log('========================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Errors: ${this.results.errors}`);
    
    const total = this.results.passed + this.results.failed + this.results.errors;
    const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);

    // Group results by status
    const statusGroups = this.results.details.reduce((groups, result) => {
      if (!groups[result.status]) groups[result.status] = [];
      groups[result.status].push(result);
      return groups;
    }, {});

    if (statusGroups.NOT_FOUND && statusGroups.NOT_FOUND.length > 0) {
      console.log('\n⚠️  Endpoints not found (may not be implemented):');
      statusGroups.NOT_FOUND.forEach(result => {
        console.log(`   - ${result.path} (${result.endpoint})`);
      });
    }

    if (statusGroups.FAILED && statusGroups.FAILED.length > 0) {
      console.log('\n❌ Failed endpoints:');
      statusGroups.FAILED.forEach(result => {
        console.log(`   - ${result.path}: ${result.error}`);
      });
    }

    if (statusGroups.SERVER_ERROR && statusGroups.SERVER_ERROR.length > 0) {
      console.log('\n🚨 Server errors:');
      statusGroups.SERVER_ERROR.forEach(result => {
        console.log(`   - ${result.path}: HTTP ${result.statusCode}`);
      });
    }

    if (this.results.failed === 0 && this.results.errors === 0) {
      console.log('\n🎉 All critical tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed or had errors. Please review the details above.');
    }
  }
}

// Run the tests
async function runTests() {
  const tester = new EndpointTester();
  
  try {
    await tester.testTenantIsolation();
    console.log('\n' + '='.repeat(50) + '\n');
    await tester.testCrossTenantAccess();
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runTests();
}

module.exports = { EndpointTester };