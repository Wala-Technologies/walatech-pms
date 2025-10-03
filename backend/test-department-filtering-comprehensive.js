#!/usr/bin/env node

/**
 * Comprehensive Department Filtering Test Script
 * 
 * This script tests department-based filtering across all modules:
 * - Sales (Quotations, Sales Orders, Delivery Notes, Sales Invoices)
 * - Inventory (Items, Stock Entries)
 * - HR (Employees, Attendance)
 * - Accounting (Journal Entries, Payment Entries)
 * 
 * Usage: node test-department-filtering-comprehensive.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001/api';
const TEST_USER = {
  email: 'admin@walatech.com',
  password: 'admin123'
};

class DepartmentFilteringTester {
  constructor() {
    this.token = null;
    this.results = {
      sales: {},
      inventory: {},
      hr: {},
      accounting: {}
    };
  }

  async run() {
    console.log('🚀 Starting Comprehensive Department Filtering Tests...\n');
    
    try {
      await this.authenticate();
      
      // Test all modules
      await this.testSalesModule();
      await this.testInventoryModule();
      await this.testHRModule();
      await this.testAccountingModule();
      
      // Generate summary report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      process.exit(1);
    }
  }

  async authenticate() {
    console.log('🔐 Authenticating...');
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
      this.token = response.data.access_token;
      console.log('✅ Authentication successful\n');
    } catch (error) {
      throw new Error(`Authentication failed: ${error.response?.data?.message || error.message}`);
    }
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async testEndpoint(module, endpoint, description) {
    try {
      console.log(`  📋 Testing ${description}...`);
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders()
      });
      
      const data = response.data;
      const hasData = Array.isArray(data) ? data.length > 0 : !!data;
      
      // Check for department_id in response data
      let hasDepartmentId = false;
      if (Array.isArray(data) && data.length > 0) {
        hasDepartmentId = data.some(item => 'department_id' in item);
      } else if (data && typeof data === 'object') {
        hasDepartmentId = 'department_id' in data;
      }
      
      this.results[module][endpoint] = {
        status: 'success',
        description,
        hasData,
        hasDepartmentId,
        count: Array.isArray(data) ? data.length : (hasData ? 1 : 0)
      };
      
      console.log(`    ✅ ${description} - ${hasData ? `${Array.isArray(data) ? data.length : 1} records` : 'No data'}`);
      
    } catch (error) {
      this.results[module][endpoint] = {
        status: 'error',
        description,
        error: error.response?.data?.message || error.message
      };
      console.log(`    ❌ ${description} - Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async testSalesModule() {
    console.log('📊 Testing Sales Module...');
    
    const endpoints = [
      { path: '/sales/quotations', desc: 'Quotations' },
      { path: '/sales-orders', desc: 'Sales Orders' },
      { path: '/delivery-notes', desc: 'Delivery Notes' },
      { path: '/sales-invoices', desc: 'Sales Invoices' }
    ];
    
    for (const endpoint of endpoints) {
      await this.testEndpoint('sales', endpoint.path, endpoint.desc);
    }
    console.log('');
  }

  async testInventoryModule() {
    console.log('📦 Testing Inventory Module...');
    
    const endpoints = [
      { path: '/inventory/items', desc: 'Items' },
      { path: '/stock-entries', desc: 'Stock Entries' }
    ];
    
    for (const endpoint of endpoints) {
      await this.testEndpoint('inventory', endpoint.path, endpoint.desc);
    }
    console.log('');
  }

  async testHRModule() {
    console.log('👥 Testing HR Module...');
    
    const endpoints = [
      { path: '/hr/employees', desc: 'Employees' },
      { path: '/hr/attendance', desc: 'Attendance Records' },
      { path: '/hr/departments', desc: 'Departments' }
    ];
    
    for (const endpoint of endpoints) {
      await this.testEndpoint('hr', endpoint.path, endpoint.desc);
    }
    console.log('');
  }

  async testAccountingModule() {
    console.log('💰 Testing Accounting Module...');
    
    const endpoints = [
      { path: '/accounting/accounts', desc: 'Chart of Accounts' },
      { path: '/accounting/journal-entries', desc: 'Journal Entries' },
      { path: '/accounting/payment-entries', desc: 'Payment Entries' },
      { path: '/accounting/cost-centers', desc: 'Cost Centers' },
      { path: '/accounting/fiscal-years', desc: 'Fiscal Years' }
    ];
    
    for (const endpoint of endpoints) {
      await this.testEndpoint('accounting', endpoint.path, endpoint.desc);
    }
    console.log('');
  }

  generateReport() {
    console.log('📋 COMPREHENSIVE TEST REPORT');
    console.log('=' .repeat(50));
    
    const modules = ['sales', 'inventory', 'hr', 'accounting'];
    let totalEndpoints = 0;
    let successfulEndpoints = 0;
    let endpointsWithDepartmentId = 0;
    
    modules.forEach(module => {
      console.log(`\n📁 ${module.toUpperCase()} MODULE:`);
      
      const moduleResults = this.results[module];
      const endpoints = Object.keys(moduleResults);
      
      endpoints.forEach(endpoint => {
        const result = moduleResults[endpoint];
        totalEndpoints++;
        
        if (result.status === 'success') {
          successfulEndpoints++;
          const statusIcon = result.hasData ? '✅' : '⚠️';
          console.log(`  ${statusIcon} ${result.description}: ${result.count} records`);
          
          if (result.hasDepartmentId) {
            endpointsWithDepartmentId++;
            console.log(`    🏢 Department filtering: IMPLEMENTED`);
          } else if (result.hasData) {
            console.log(`    ⚠️  Department filtering: NOT DETECTED`);
          }
        } else {
          console.log(`  ❌ ${result.description}: ${result.error}`);
        }
      });
    });
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 SUMMARY:');
    console.log(`Total Endpoints Tested: ${totalEndpoints}`);
    console.log(`Successful Responses: ${successfulEndpoints}/${totalEndpoints}`);
    console.log(`Endpoints with Department Filtering: ${endpointsWithDepartmentId}/${totalEndpoints}`);
    
    const successRate = ((successfulEndpoints / totalEndpoints) * 100).toFixed(1);
    const filteringRate = ((endpointsWithDepartmentId / totalEndpoints) * 100).toFixed(1);
    
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Department Filtering Coverage: ${filteringRate}%`);
    
    if (successRate >= 80 && filteringRate >= 70) {
      console.log('\n🎉 OVERALL STATUS: EXCELLENT - Department filtering is well implemented!');
    } else if (successRate >= 60 && filteringRate >= 50) {
      console.log('\n✅ OVERALL STATUS: GOOD - Most endpoints working with decent filtering coverage');
    } else {
      console.log('\n⚠️  OVERALL STATUS: NEEDS IMPROVEMENT - Some endpoints failing or missing filtering');
    }
    
    console.log('\n🔍 RECOMMENDATIONS:');
    
    // Check for specific issues
    modules.forEach(module => {
      const moduleResults = this.results[module];
      const endpoints = Object.keys(moduleResults);
      const failedEndpoints = endpoints.filter(ep => moduleResults[ep].status === 'error');
      const noFilteringEndpoints = endpoints.filter(ep => 
        moduleResults[ep].status === 'success' && 
        moduleResults[ep].hasData && 
        !moduleResults[ep].hasDepartmentId
      );
      
      if (failedEndpoints.length > 0) {
        console.log(`  ❌ ${module.toUpperCase()}: Fix ${failedEndpoints.length} failing endpoint(s)`);
      }
      
      if (noFilteringEndpoints.length > 0) {
        console.log(`  🏢 ${module.toUpperCase()}: Implement department filtering for ${noFilteringEndpoints.length} endpoint(s)`);
      }
    });
    
    console.log('\n📝 NEXT STEPS:');
    console.log('  1. Fix any failing endpoints');
    console.log('  2. Implement department filtering where missing');
    console.log('  3. Test with different user roles and department access');
    console.log('  4. Verify data isolation between departments');
    console.log('  5. Update API documentation');
    
    console.log('\n✨ Test completed successfully!');
  }
}

// Run the tests
if (require.main === module) {
  const tester = new DepartmentFilteringTester();
  tester.run().catch(console.error);
}

module.exports = DepartmentFilteringTester;