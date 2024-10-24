-- Create user and grant privileges
CREATE USER 'fc'@'%' IDENTIFIED BY 'fc';
GRANT ALL PRIVILEGES ON fc.* TO 'fc'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;