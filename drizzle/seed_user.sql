-- Clear existing data in database
DELETE FROM users;
DELETE FROM products;
DELETE FROM mitras;
DELETE FROM purchase_batches;
DELETE FROM product_stocks;
DELETE FROM sales;
DELETE FROM stock_movements;
DELETE FROM capital_logs;
DELETE FROM audit_logs;

-- Seed Official User Account 'develzy' with PIN '250423'
INSERT INTO users (id, username, pin, role) 
VALUES ('u-develzy', 'develzy', '250423', 'owner');
