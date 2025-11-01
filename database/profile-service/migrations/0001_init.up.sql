CREATE TYPE user_status AS ENUM ('active', 'deleted');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname VARCHAR(255) NOT NULL,
    nick_tag      VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_picture TEXT,
    description TEXT,
    user_rating FLOAT DEFAULT 0.0,
    status user_status NOT NULL
);

CREATE TABLE followers (
    user_id UUID NOT NULL,
    follower_id UUID NOT NULL,
    PRIMARY KEY (user_id, follower_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

CREATE TABLE members (
    user_id UUID NOT NULL,
    group_id UUID NOT NULL,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TYPE request_status AS ENUM ('waited', 'rejected', 'accepted', 'cancelled');

CREATE TABLE join_group_requests (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    group_id UUID NOT NULL,
    status request_status NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE settings_statuses (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE settings (
    user_id UUID NOT NULL,
    bookmarks_status_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bookmarks_status_id) REFERENCES settings_statuses(id) ON DELETE CASCADE
);

INSERT INTO settings_statuses (type) VALUES
    ('private'),
    ('public');

CREATE UNIQUE INDEX idx_users_nickname ON users(nickname);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_nick_tag ON users(nick_tag);

CREATE INDEX idx_followers_user_id ON followers(user_id);
CREATE INDEX idx_followers_follower_id ON followers(follower_id);

CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_group_id ON members(group_id);

