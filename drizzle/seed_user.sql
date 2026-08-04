-- Clear all existing users and insert official account: username 'develzy', PIN '250420'
DELETE FROM `users`;

INSERT INTO `users` (`id`, `username`, `password_hash`, `pin`, `created_at`) 
VALUES ('USR-001', 'develzy', 'dapurelzy', '250420', CURRENT_TIMESTAMP);
