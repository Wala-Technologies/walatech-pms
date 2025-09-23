-- Setup script to create a default tenant and admin user for testing
-- Run this script after the database tables are created

USE wala_pms;

-- Create a default tenant
INSERT INTO tabTenant (
    id,
    name,
    subdomain,
    status,
    plan
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'WalaTech Manufacturing',
    'walatech',
    'active',
    'enterprise'
);

-- Create an admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt with salt rounds 12
INSERT INTO tabUser (
    id,
    email,
    first_name,
    last_name,
    password,
    enabled,
    language,
    time_zone,
    role_profile_name
) VALUES (
    '660e8400-e29b-41d4-a716-446655440001',
    'admin@walatech.com',
    'System',
    'Administrator',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrKxHqi',
    1,
    'en',
    'Africa/Addis_Ababa',
    'Administrator'
);

-- Verify the data was inserted
SELECT 'Tenant created:' as info, name, subdomain, status FROM tabTenant WHERE subdomain = 'walatech';
SELECT 'Admin user created:' as info, email, first_name, last_name, enabled FROM tabUser WHERE email = 'admin@walatech.com';