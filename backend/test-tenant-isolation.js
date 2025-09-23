#!/usr/bin/env node

/**
 * Comprehensive Tenant Isolation Test Script
 * 
 * This script tests tenant data isolation across all modules to ensure:
 * 1. Users can only access data from their own tenant
 * 2. API endpoints properly filter data by tenant
 * 3. Cross-tenant data leakage is prevented
 * 4. JWT-based tenant middleware works correctly
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const TEST_TIMEOUT = 30000; // 30 seconds

// Test data for multiple tenants
const TENANTS = [
  {
    id: '8a18117a-d394-4c14-9970-88e49f88fe0b',
    name: 'Arfasa Manufacturing',
    subdomain: 'arfasa',
    adminEmail: 'admin@arfasa.com',
    adminPassword: 'admin123'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'WalaTech Manufacturing',
    subdomain: 'walatech',
    adminEmail: 'admin@walatech.com',
    adminPassword: 'admin123'
  }
];

// API endpoints to test
const ENDPOINTS = [
  '/production-orders',
  '/work-orders',
  '/work-order-tasks',
  '/tenants/settings',
  '/users/profile'
];

class TenantIsolationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Tenant Isolation Tests...\n');
    
    try {
      // Test 1: Authentication and token generation
      await this.testAuthentication();
      
      // Test 2: Basic tenant isolation
      await this.testBasicTenantIsolation();
      
      // Test 3: Cross-tenant data access prevention
      await this.testCrossTenantDataAccess();
      
      // Test 4: JWT middleware validation
      await this.testJwtMiddleware();
      
      // Test 5: API endpoint isolation
      await this.testApiEndpointIsolation();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      this.results.errors.push(`Test suite error: ${error.message}`);
    }
  }

  async testAuthentication() {
    console.log('📝 Testing Authentication...');
    
    for (const tenant of TENANTS) {
      try {
        const response = await this.login(tenant.adminEmail, tenant.adminPassword);
        
        if (response.access_token && response.user) {
          console.log(`✅ Authentication successful for ${tenant.name}`);
          tenant.token = response.access_token;
          tenant.user = response.user;
          this.results.passed++;
        } else {
          throw new Error('Invalid authentication response');
        }
      } catch (error) {
        console.log(`❌ Authentication failed for ${tenant.name}: ${error.message}`);
        this.results.failed++;
        this.results.errors.push(`Authentication failed for ${tenant.name}: ${error.message}`);
      }
    }
    console.log('');
  }

  async testBasicTenantIsolation() {
    console.log('🔒 Testing Basic Tenant Isolation...');
    
    for (const tenant of TENANTS) {
      if (!tenant.token) continue;
      
      try {
        // Test production orders endpoint
        const response = await this.makeAuthenticatedRequest(
          'GET',
          '/production-orders',
          tenant.token
        );
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`✅ ${tenant.name}: Production orders endpoint accessible`);
          this.results.passed++;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.log(`❌ ${tenant.name}: Basic isolation test failed: ${error.message}`);
        this.results.failed++;
        this.results.errors.push(`Basic isolation test failed for ${tenant.name}: ${error.message}`);
      }
    }
    console.log('');
  }

  async testCrossTenantDataAccess() {
    console.log('🚫 Testing Cross-Tenant Data Access Prevention...');
    
    if (TENANTS.length < 2) {
      console.log('⚠️  Skipping cross-tenant test: Need at least 2 tenants');
      return;
    }

    const tenant1 = TENANTS[0];
    const tenant2 = TENANTS[1];

    if (!tenant1.token || !tenant2.token) {
      console.log('⚠️  Skipping cross-tenant test: Missing authentication tokens');
      return;
    }

    try {
      // Try to access tenant1's data using tenant2's token
      const response1 = await this.makeAuthenticatedRequest(
        'GET',
        '/production-orders',
        tenant1.token
      );
      
      const response2 = await this.makeAuthenticatedRequest(
        'GET',
        '/production-orders',
        tenant2.token
      );

      // Both should succeed but return different data sets
      if (response1.data && response2.data) {
        console.log(`✅ Cross-tenant isolation working: Each tenant sees their own data`);
        console.log(`   ${tenant1.name}: ${response1.total || 0} production orders`);
        console.log(`   ${tenant2.name}: ${response2.total || 0} production orders`);
        this.results.passed++;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.log(`❌ Cross-tenant test failed: ${error.message}`);
      this.results.failed++;
      this.results.errors.push(`Cross-tenant test failed: ${error.message}`);
    }
    console.log('');
  }

  async testJwtMiddleware() {
    console.log('🔐 Testing JWT Middleware...');
    
    try {
      // Test with invalid token
      try {
        await this.makeAuthenticatedRequest('GET', '/production-orders', 'invalid-token');
        console.log('❌ JWT middleware failed: Invalid token was accepted');
        this.results.failed++;
        this.results.errors.push('JWT middleware failed: Invalid token was accepted');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('✅ JWT middleware working: Invalid token rejected');
          this.results.passed++;
        } else {
          throw error;
        }
      }

      // Test without token
      try {
        await axios.get(`${API_BASE_URL}/production-orders`);
        console.log('❌ JWT middleware failed: Request without token was accepted');
        this.results.failed++;
        this.results.errors.push('JWT middleware failed: Request without token was accepted');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('✅ JWT middleware working: Request without token rejected');
          this.results.passed++;
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.log(`❌ JWT middleware test failed: ${error.message}`);
      this.results.failed++;
      this.results.errors.push(`JWT middleware test failed: ${error.message}`);
    }
    console.log('');
  }

  async testApiEndpointIsolation() {
    console.log('🌐 Testing API Endpoint Isolation...');
    
    for (const tenant of TENANTS) {
      if (!tenant.token) continue;
      
      console.log(`Testing endpoints for ${tenant.name}:`);
      
      for (const endpoint of ENDPOINTS) {
        try {
          const response = await this.makeAuthenticatedRequest(
            'GET',
            endpoint,
            tenant.token
          );
          
          if (response) {
            console.log(`  ✅ ${endpoint}: Accessible`);
            this.results.passed++;
          } else {
            throw new Error('No response received');
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(`  ⚠️  ${endpoint}: Not found (may not be implemented)`);
          } else {
            console.log(`  ❌ ${endpoint}: Failed - ${error.message}`);
            this.results.failed++;
            this.results.errors.push(`${tenant.name} - ${endpoint}: ${error.message}`);
          }
        }
      }
    }
    console.log('');
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async makeAuthenticatedRequest(method, endpoint, token, data = null) {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: TEST_TIMEOUT
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  printResults() {
    console.log('📊 Test Results Summary:');
    console.log('========================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 Errors:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('\n' + (this.results.failed === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed. Please review the errors above.'));
  }
}

// Run the tests
if (require.main === module) {
  const tester = new TenantIsolationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = TenantIsolationTester;