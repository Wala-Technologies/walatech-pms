-- Check current users and their authentication methods
SELECT user, host, plugin FROM mysql.user WHERE user='root';

-- Create a new user with mysql_native_password authentication
CREATE USER 'wala_user'@'localhost' IDENTIFIED BY 'walatech-pass';

-- Grant all privileges to the new user
GRANT ALL PRIVILEGES ON *.* TO 'wala_user'@'localhost' WITH GRANT OPTION;

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS wala_pms;

-- Grant specific privileges on the wala_pms database
GRANT ALL PRIVILEGES ON wala_pms.* TO 'wala_user'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Show the new user
SELECT user, host, plugin FROM mysql.user WHERE user='wala_user';