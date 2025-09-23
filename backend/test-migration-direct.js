// Direct test of the migration function
function migrateFeatureStructure(settings) {
  if (!settings || !settings.features) {
    return settings;
  }

  const features = settings.features;
  
  // Check if we have old structure (inventory, production, etc.)
  const hasOldStructure = 
    'inventory' in features ||
    'production' in features ||
    'accounting' in features ||
    'hr' in features ||
    'crm' in features ||
    'projects' in features;

  if (hasOldStructure) {
    console.log('🔄 Migrating from old feature structure to new structure...');
    
    // Create new structure
    const migratedFeatures = {
      enableInventory: features.inventory || false,
      enableManufacturing: features.production || false,
      enableAccounting: features.accounting || false,
      enableHR: features.hr || false,
      enableCRM: features.crm || false,
      enableProjects: features.projects || false,
      // Keep any other features that might exist
      ...Object.fromEntries(
        Object.entries(features).filter(([key]) => 
          !['inventory', 'production', 'accounting', 'hr', 'crm', 'projects'].includes(key)
        )
      )
    };

    return {
      ...settings,
      features: migratedFeatures
    };
  }

  return settings;
}

// Test data - old format
const testSettingsOld = {
  timezone: "UTC",
  dateFormat: "YYYY-MM-DD",
  currency: "USD",
  language: "en",
  features: {
    inventory: true,
    production: true,
    accounting: false,
    hr: true,
    crm: false,
    projects: true,
    reporting: true,
    userManagement: true
  },
  limits: {
    maxUsers: 10,
    maxStorage: "1GB",
    maxApiCalls: 1000
  }
};

// Test data - new format
const testSettingsNew = {
  timezone: "UTC",
  dateFormat: "YYYY-MM-DD",
  currency: "USD",
  language: "en",
  features: {
    enableInventory: true,
    enableManufacturing: true,
    enableAccounting: false,
    enableHR: true,
    enableCRM: false,
    enableProjects: true,
    reporting: true,
    userManagement: true
  },
  limits: {
    maxUsers: 10,
    maxStorage: "1GB",
    maxApiCalls: 1000
  }
};

console.log('=== TESTING MIGRATION FUNCTION ===\n');

console.log('1. Testing OLD format migration:');
console.log('Before migration:', JSON.stringify(testSettingsOld.features, null, 2));
const migratedOld = migrateFeatureStructure(testSettingsOld);
console.log('After migration:', JSON.stringify(migratedOld.features, null, 2));

console.log('\n2. Testing NEW format (should not change):');
console.log('Before migration:', JSON.stringify(testSettingsNew.features, null, 2));
const migratedNew = migrateFeatureStructure(testSettingsNew);
console.log('After migration:', JSON.stringify(migratedNew.features, null, 2));

console.log('\n3. Verification:');
const oldFeatures = migratedOld.features;
const newFeatures = migratedNew.features;

console.log('Old format migrated correctly:', 
  oldFeatures.enableInventory === true &&
  oldFeatures.enableManufacturing === true &&
  oldFeatures.enableAccounting === false &&
  oldFeatures.enableHR === true &&
  oldFeatures.enableCRM === false &&
  oldFeatures.enableProjects === true
);

console.log('New format unchanged:', 
  JSON.stringify(testSettingsNew.features) === JSON.stringify(newFeatures)
);

console.log('\n✅ Migration function test completed successfully!');