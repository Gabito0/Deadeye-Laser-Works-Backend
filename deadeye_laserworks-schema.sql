CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  birth_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'regular',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  price DECIMAL(20, 2),
  is_active BOOLEAN DEFAULT TRUE
);  

CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  review_text VARCHAR(400),
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  time TIMESTAMP DEFAULT NOW(),
  service_id INT REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  comment_text VARCHAR(400),
  time TIMESTAMP DEFAULT NOW(),
  review_id INT REFERENCES reviews(id) ON DELETE CASCADE
);

CREATE TABLE users_services (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  service_id INT REFERENCES services(id) ON DELETE CASCADE,
  confirmed_price DECIMAL(20, 2),
  is_completed BOOLEAN DEFAULT FALSE ,
  addition_info TEXT NOT NULL,
  confirmation_code TEXT,
  support_ticket_id INT REFERENCES support_tickets(id) ON DELETE CASCADE,
  requested_date TIMESTAMP DEFAULT NOW(),
  fulfilled_date TIMESTAMP
);

CREATE TABLE ticket_conversations (
  id SERIAL PRIMARY KEY,
  ticket_id INT REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  admin_id INT REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
