const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSubdomainAvailability() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'wala_pms',
    port: process.env.DB_PORT || 3306,
  });

  console.log('Connected to database successfully!\n');

  try {
    // Get all existing subdomains
    const [rows] = await connection.execute(
      'SELECT subdomain, name, status FROM tabTenant ORDER BY subdomain'
    );

    console.log('=== EXISTING SUBDOMAINS ===');
    console.log('Subdomain\t\t\tTenant Name\t\t\tStatus');
    console.log('─'.repeat(80));
    
    const existingSubdomains = new Set();
    rows.forEach(row => {
      existingSubdomains.add(row.subdomain);
      console.log(`${row.subdomain.padEnd(25)}\t${row.name.padEnd(25)}\t${row.status}`);
    });

    console.log(`\nTotal existing subdomains: ${existingSubdomains.size}\n`);

    // Function to check if a subdomain is available
    function checkSubdomain(subdomain) {
      // Check reserved subdomains
      const reservedSubdomains = [
        'www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'shop',
        'support', 'help', 'docs', 'status', 'cdn', 'assets', 'static'
      ];

      if (reservedSubdomains.includes(subdomain)) {
        return { available: false, reason: 'Reserved subdomain' };
      }

      // Check subdomain format
      const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
      if (!subdomainRegex.test(subdomain) || subdomain.length < 3 || subdomain.length > 63) {
        return { 
          available: false, 
          reason: 'Invalid format (must be 3-63 characters, lowercase letters, numbers, and hyphens only)' 
        };
      }

      // Check if already exists
      if (existingSubdomains.has(subdomain)) {
        return { available: false, reason: 'Already taken' };
      }

      return { available: true, reason: 'Available' };
    }

    // Function to suggest alternatives
    function suggestAlternatives(baseSubdomain) {
      const suggestions = [];
      const cleanBase = baseSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
      
      // Try with numbers
      for (let i = 1; i <= 10; i++) {
        const suggestion = `${cleanBase}${i}`;
        const check = checkSubdomain(suggestion);
        if (check.available) {
          suggestions.push(suggestion);
        }
      }

      // Try with common suffixes
      const suffixes = ['corp', 'inc', 'ltd', 'co', 'org', 'biz', 'tech', 'pro'];
      suffixes.forEach(suffix => {
        const suggestion = `${cleanBase}-${suffix}`;
        const check = checkSubdomain(suggestion);
        if (check.available) {
          suggestions.push(suggestion);
        }
      });

      return suggestions.slice(0, 5); // Return top 5 suggestions
    }

    // Test some common subdomains
    console.log('=== SUBDOMAIN AVAILABILITY CHECK ===');
    const testSubdomains = ['test', 'demo', 'sample', 'new-company', 'my-business'];
    
    testSubdomains.forEach(subdomain => {
      const result = checkSubdomain(subdomain);
      console.log(`${subdomain.padEnd(20)}: ${result.available ? '✅ Available' : '❌ ' + result.reason}`);
      
      if (!result.available && result.reason === 'Already taken') {
        const suggestions = suggestAlternatives(subdomain);
        if (suggestions.length > 0) {
          console.log(`   Suggestions: ${suggestions.join(', ')}`);
        }
      }
    });

    console.log('\n=== INTERACTIVE SUBDOMAIN CHECKER ===');
    console.log('You can use this script to check any subdomain:');
    console.log('Example: node check-subdomain-availability.js your-subdomain');
    
    // Check command line argument
    const argSubdomain = process.argv[2];
    if (argSubdomain) {
      console.log(`\nChecking: "${argSubdomain}"`);
      const result = checkSubdomain(argSubdomain);
      console.log(`Result: ${result.available ? '✅ Available' : '❌ ' + result.reason}`);
      
      if (!result.available) {
        const suggestions = suggestAlternatives(argSubdomain);
        if (suggestions.length > 0) {
          console.log(`Suggestions: ${suggestions.join(', ')}`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkSubdomainAvailability().catch(console.error);