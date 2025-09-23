-- Check current users and their authentication methods
SELECT user, host, plugin FROM mysql.user WHERE user='root';

-- Create a new user with explicit mysql_native_password authentication
-- MySQL 8.x syntax:
--   CREATE USER 'wala_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'walatech-pass';
-- MariaDB syntax (both forms generally work depending on version):
--   CREATE USER 'wala_user'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('walatech-pass');
-- We'll prefer the MySQL style first; if it errors on MariaDB, comment it out and use the VIA form below.
CREATE USER 'wala_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'walatech-pass';

-- For MariaDB fallback (uncomment if needed):
-- CREATE USER 'wala_user'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('walatech-pass');

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

-- If the plugin column is not mysql_native_password, adjust with:
--   ALTER USER 'wala_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'walatech-pass';
-- or for MariaDB:
--   ALTER USER 'wala_user'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('walatech-pass');