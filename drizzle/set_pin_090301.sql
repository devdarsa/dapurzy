-- UPDATE PIN USER DAPURZY TO 090301
UPDATE users SET pin = '090301' WHERE username = 'owner';
INSERT OR IGNORE INTO users (id, username, password_hash, pin) VALUES ('usr-owner', 'owner', 'hash-default', '090301');
