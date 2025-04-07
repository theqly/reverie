CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    profile_picture TEXT,
    description TEXT,
    user_rating FLOAT DEFAULT 0.0
);

CREATE TABLE followers (
    user_id UUID NOT NULL,
    follower_id UUID NOT NULL,
    PRIMARY KEY (user_id, follower_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_followers_user_id ON followers(user_id);
CREATE INDEX idx_followers_follower_id ON followers(follower_id);