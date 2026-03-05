-- Matrimony App Database Schema
-- PostgreSQL for Aurora Serverless v2

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Cognito)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    cognito_sub VARCHAR(255) UNIQUE NOT NULL,
    account_status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION' CHECK (account_status IN ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DELETED')),
    membership_tier VARCHAR(20) DEFAULT 'FREE' CHECK (membership_tier IN ('FREE', 'PREMIUM', 'GOLD')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    dob DATE NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    height_cm INTEGER,
    education VARCHAR(200),
    occupation VARCHAR(200),
    bio TEXT,
    community_data JSONB NOT NULL DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    photos JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT FALSE,
    profile_completion INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create GIN index on community_data for fast JSONB queries
CREATE INDEX idx_profiles_community_data ON profiles USING GIN (community_data);
CREATE INDEX idx_profiles_preferences ON profiles USING GIN (preferences);
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_is_verified ON profiles(is_verified);

-- Verification queue table
CREATE TABLE verification_queue (
    ticket_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    id_proof_s3_key VARCHAR(500) NOT NULL,
    selfie_s3_key VARCHAR(500),
    admin_notes TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_INFO')),
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_status ON verification_queue(status);
CREATE INDEX idx_verification_user_id ON verification_queue(user_id);

-- Connections/Matches table
CREATE TABLE connections (
    connection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiator_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(initiator_id, receiver_id)
);

CREATE INDEX idx_connections_initiator ON connections(initiator_id);
CREATE INDEX idx_connections_receiver ON connections(receiver_id);
CREATE INDEX idx_connections_status ON connections(status);

-- Swipe history (for recommendations algorithm)
CREATE TABLE swipe_history (
    swipe_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('PASS', 'CONNECT')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_user_id)
);

CREATE INDEX idx_swipe_user_id ON swipe_history(user_id);
CREATE INDEX idx_swipe_target_user_id ON swipe_history(target_user_id);

-- Messages table
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES connections(connection_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_connection ON messages(connection_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verification_updated_at BEFORE UPDATE ON verification_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
