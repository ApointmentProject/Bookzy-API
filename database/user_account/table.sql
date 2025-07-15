CREATE TABLE user_account (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number TEXT NOT NULL,
    birthday DATE NOT NULL,
    id_number VARCHAR(50) UNIQUE NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')) NOT NULL,
    password_hash TEXT NOT NULL,
    uid TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_account
ADD COLUMN profile_pic TEXT;

