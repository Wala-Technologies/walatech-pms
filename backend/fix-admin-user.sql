-- Fix admin user by adding tenant_id
-- This script updates the existing admin user to include the tenant_id

USE wala_pms;

-- Update the admin user to include tenant_id
UPDATE tabUser 
SET tenant_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE email = 'admin@walatech.com';

-- Verify the update
SELECT 
    'Admin user updated:' as info, 
    email, 
    first_name, 
    last_name, 
    tenant_id, 
    enabled 
FROM tabUser 
WHERE email = 'admin@walatech.com';

-- Also verify the tenant exists
SELECT 
    'Tenant info:' as info, 
    id, 
    name, 
    subdomain, 
    status 
FROM tabTenant 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';