-- -- All users' passwords will be "password"

-- -- Insert users
-- INSERT INTO "users" (username, first_name, last_name, email, birth_date, password, status, is_verified)
-- VALUES 
-- ('user', 'Regular', 'User', 'user@example.com', '1990-01-01', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'user', TRUE),
-- ('userAdmin', 'Admin', 'User', 'admin@example.com', '1985-01-01', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'admin', TRUE);

-- -- Insert services
-- INSERT INTO services (title, description, price)
-- VALUES 
-- ('Service 1', 'Description for Service 1', 100.00),
-- ('Service 2', 'Description for Service 2', 200.00);

-- -- Insert support tickets
-- INSERT INTO support_tickets (ticket_number, title, description, status, time)
-- VALUES 
-- ('TICK123456', 'Issue 1', 'Description for issue 1', 'open', NOW()),
-- ('TICK123457', 'Issue 2', 'Description for issue 2', 'open', NOW());

-- -- Insert reviews
-- INSERT INTO reviews (user_id, review_text, rating, time, service_id)
-- VALUES 
-- (1, 'Great service!', 5, NOW(), 1),
-- (2, 'Not bad.', 3, NOW(), 2);

-- -- Insert comments
-- INSERT INTO comments (comment_text, time, review_id)
-- VALUES 
-- ('I agree!', NOW(), 1),
-- ('Could be better.', NOW(), 2);

-- -- Insert user services
-- INSERT INTO users_services (user_id, service_id, confirmed_price, is_completed, addition_info, confirmation_code, support_ticket_id, requested_date, fulfilled_date)
-- VALUES 
-- (1, 1, 100.00, TRUE, 'Additional info for user 1 service 1', 'CONFIRM123', 1, NOW(), NOW()),
-- (2, 2, 200.00, FALSE, 'Additional info for user 2 service 2', 'CONFIRM456', 2, NOW(), NULL);

-- -- Insert ticket conversations
-- INSERT INTO ticket_conversations (ticket_id, user_id, admin_id, message, timestamp)
-- VALUES 
-- (1, 1, 2, 'Initial message from user regarding issue 1', NOW()),
-- (1, 2, 2, 'Response from admin regarding issue 1', NOW()),
-- (2, 1, 2, 'Initial message from user regarding issue 2', NOW()),
-- (2, 2, 2, 'Response from admin regarding issue 2', NOW());

-- All users' passwords will be "password"




-- ----------------------------- This should be run before connecting to the React App -------------------------------------

-- -- Insert users
-- INSERT INTO "users" (username, first_name, last_name, email, birth_date, password, status, is_verified)
-- VALUES 
-- ('user', 'Regular', 'User', 'user@example.com', '1990-01-01', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'user', TRUE),
-- ('userAdmin', 'Admin', 'User', 'admin@example.com', '1985-01-01', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'admin', TRUE),
-- ('user2', 'Second', 'User', 'user2@example.com', '1992-02-02', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'user', TRUE),
-- ('user3', 'Third', 'User', 'user3@example.com', '1993-03-03', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'user', TRUE);

-- -- Insert services
-- INSERT INTO services (title, description, price)
-- VALUES 
-- ('Laser Engraving', 'From intricate designs on knives and firearms to personalized metal cards, we ensure every detail is perfect.', 150.00),
-- ('Gold Plating', 'Elevate your items with our premium gold plating service, turning ordinary metal into luxurious, gold-finished masterpieces.', 300.00),
-- ('Custom Designs', 'Our expert team crafts unique, custom designs that reflect your style and vision, whether for personal keepsakes or distinctive business solutions.', 250.00);

-- -- Insert support tickets
-- INSERT INTO support_tickets (ticket_number, title, description, status, time)
-- VALUES 
-- ('TICK123456', 'Issue 1', 'Description for issue 1', 'open', NOW()),
-- ('TICK123457', 'Issue 2', 'Description for issue 2', 'open', NOW());

-- -- Insert reviews
-- INSERT INTO reviews (user_id, review_text, rating, time, service_id)
-- VALUES 
-- (1, 'Great service!', 5, NOW(), 1),
-- (2, 'Not bad.', 3, NOW(), 2),
-- (3, 'Amazing craftsmanship.', 4, NOW(), 3),
-- (4, 'Could be better.', 2, NOW(), 1),
-- (1, 'Top-notch quality!', 5, NOW(), 2),
-- (3, 'Not satisfied.', 1, NOW(), 3);

-- -- Insert comments
-- INSERT INTO comments (comment_text, time, review_id)
-- VALUES 
-- ('I agree!', NOW(), 1),
-- ('Could be better.', NOW(), 2);

-- -- Insert user services
-- INSERT INTO users_services (user_id, service_id, confirmed_price, is_completed, addition_info, confirmation_code, support_ticket_id, requested_date, fulfilled_date)
-- VALUES 
-- (1, 1, 150.00, TRUE, 'Additional info for user 1 service 1', 'CONFIRM123', 1, NOW(), NOW()),
-- (2, 2, 300.00, FALSE, 'Additional info for user 2 service 2', 'CONFIRM456', 2, NOW(), NULL),
-- (3, 3, 250.00, TRUE, 'Additional info for user 3 service 3', 'CONFIRM789', NULL, NOW(), NOW());

-- -- Insert ticket conversations
-- INSERT INTO ticket_conversations (ticket_id, user_id, admin_id, message, timestamp)
-- VALUES 
-- (1, 1, 2, 'Initial message from user regarding issue 1', NOW()),
-- (1, 2, 2, 'Response from admin regarding issue 1', NOW()),
-- (2, 1, 2, 'Initial message from user regarding issue 2', NOW()),
-- (2, 2, 2, 'Response from admin regarding issue 2', NOW());




---------------------------- This should be run before connecting to the React App -------------------------------------

-- Insert users
INSERT INTO "users" (username, first_name, last_name, email, birth_date, password, status, is_verified)
VALUES 
('regularUser', 'John', 'Doe', 'user@example.com', '1990-01-01', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'user', TRUE),
('adminUser', 'Jane', 'Smith', 'admin@example.com', '1985-01-01', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'admin', TRUE),
('userTwo', 'Alice', 'Johnson', 'user2@example.com', '1992-02-02', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'user', TRUE),
('userThree', 'Bob', 'Williams', 'user3@example.com', '1993-03-03', '$2b$13$Lbf3ejRakvMzGH6X28oTwOp6hg72ZVNt98VhkbBTRp5KSFAnTZw3G', 'user', TRUE);

-- Insert services
INSERT INTO services (title, description, price)
VALUES 
('Laser Engraving', 'From intricate designs on knives and firearms to personalized metal cards, we ensure every detail is perfect.', 150.00),
('Gold Plating', 'Elevate your items with our premium gold plating service, turning ordinary metal into luxurious, gold-finished masterpieces.', 300.00),
('Custom Designs', 'Our expert team crafts unique, custom designs that reflect your style and vision, whether for personal keepsakes or distinctive business solutions.', 250.00);

-- Insert support tickets
INSERT INTO support_tickets (ticket_number, title, description, status, time)
VALUES 
('TICK123456', 'Issue 1', 'Description for issue 1', 'open', '2023-05-01 10:00:00'),
('TICK123457', 'Issue 2', 'Description for issue 2', 'open', '2023-06-01 10:00:00');

-- Insert reviews
INSERT INTO reviews (user_id, review_text, rating, time, service_id)
VALUES 
(1, 'Great service!', 5, '2023-07-01 12:00:00', 1),
(2, 'Not bad.', 3, '2023-07-02 13:00:00', 2),
(3, 'Amazing craftsmanship.', 4, '2023-07-03 14:00:00', 3),
(4, 'Could be better.', 2, '2023-07-04 15:00:00', 1),
(1, 'Top-notch quality!', 5, '2023-07-05 16:00:00', 2),
(3, 'Not satisfied.', 1, '2023-07-06 17:00:00', 3);

-- Insert comments
INSERT INTO comments (comment_text, time, review_id)
VALUES 
('I agree!', '2023-07-07 18:00:00', 1),
('Could be better.', '2023-07-08 19:00:00', 2);

-- Insert user services
INSERT INTO users_services (user_id, service_id, confirmed_price, is_completed, addition_info, confirmation_code, support_ticket_id, requested_date, fulfilled_date)
VALUES 
(1, 1, 150.00, TRUE, 'Additional info for user 1 service 1', 'CONFIRM123', 1, '2023-07-01 10:00:00', '2023-07-02 10:00:00'),
(2, 2, 300.00, FALSE, 'Additional info for user 2 service 2', 'CONFIRM456', 2, '2023-07-03 10:00:00', NULL),
(3, 3, 250.00, TRUE, 'Additional info for user 3 service 3', 'CONFIRM789', NULL, '2023-07-04 10:00:00', '2023-07-05 10:00:00');

-- Insert ticket conversations
INSERT INTO ticket_conversations (ticket_id, user_id, admin_id, message, timestamp)
VALUES 
(1, 1, 2, 'Initial message from user regarding issue 1', '2023-07-01 10:30:00'),
(1, 2, 2, 'Response from admin regarding issue 1', '2023-07-01 11:00:00'),
(2, 1, 2, 'Initial message from user regarding issue 2', '2023-07-02 10:30:00'),
(2, 2, 2, 'Response from admin regarding issue 2', '2023-07-02 11:00:00');
