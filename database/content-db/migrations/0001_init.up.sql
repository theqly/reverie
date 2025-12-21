CREATE TABLE access_levels (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE owner_types (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    access_level_id INTEGER NOT NULL,
    owner_id UUID NOT NULL,
    author_id UUID NOT NULL,
    owner_type_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (access_level_id) REFERENCES access_levels(id),
    FOREIGN KEY (owner_type_id) REFERENCES owner_types(id)
);

CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gis_id UUID,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    purpose_name VARCHAR(255),
    type VARCHAR(255)
);

CREATE TABLE pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL,
    author_id UUID NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT,
    rating FLOAT NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    place_id UUID,
    FOREIGN KEY (place_id) REFERENCES places(id)
);

CREATE TABLE board_pins (
    board_id UUID NOT NULL,
    pin_id UUID NOT NULL,
    PRIMARY KEY (board_id, pin_id),
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
);

CREATE TABLE pin_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    pin_id UUID NOT NULL,
    FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
);

CREATE TABLE pin_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
);

CREATE TABLE board_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TYPE complaint_object_type AS ENUM ('pin', 'board', 'user');

CREATE TABLE complaint_types (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE complaint_statuses (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_object_type complaint_object_type NOT NULL,
    complaint_object_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    complaint_type INTEGER NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status INTEGER NOT NULL,
    FOREIGN KEY (complaint_type) REFERENCES complaint_types(id) ON DELETE CASCADE,
    FOREIGN KEY (status) REFERENCES complaint_statuses(id) ON DELETE CASCADE
);

CREATE TABLE reaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE reaction_pins (
    reaction_id UUID NOT NULL,
    pin_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    PRIMARY KEY (reaction_id, pin_id, owner_id),
    FOREIGN KEY (reaction_id) REFERENCES reaction(id) ON DELETE CASCADE,
    FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
);

CREATE TABLE reaction_boards (
    reaction_id UUID NOT NULL,
    board_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    PRIMARY KEY (reaction_id, board_id, owner_id),
    FOREIGN KEY (reaction_id) REFERENCES reaction(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE bookmarks_pins (
    user_id UUID NOT NULL,
    pin_id UUID NOT NULL,
    PRIMARY KEY (user_id, pin_id),
    FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
);

CREATE TABLE bookmarks_boards (
    user_id UUID NOT NULL,
    board_id UUID NOT NULL,
    PRIMARY KEY (user_id, board_id),
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

CREATE TABLE members (
    user_id UUID NOT NULL,
    group_id UUID NOT NULL,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TYPE request_status AS ENUM ('waited', 'rejected', 'accepted', 'cancelled');

CREATE TABLE join_group_requests (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    group_id UUID NOT NULL,
    status request_status NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

INSERT INTO access_levels (type) VALUES
    ('private'),
    ('public'),
    ('group'),
    ('group_public');

INSERT INTO owner_types (type) VALUES
    ('user'),
    ('group');

INSERT INTO reaction (id, type, description)
VALUES
    ('8e2f0e90-3b1a-4f2c-9c0d-1a2b3c4d5e6f', 'like', 'User likes the content')
ON CONFLICT (type) DO NOTHING;

CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_group_id ON members(group_id);


CREATE INDEX idx_boards_owner_id ON boards(owner_id);
CREATE INDEX idx_boards_name ON boards(name);
CREATE INDEX idx_boards_author_id ON boards(author_id);
CREATE INDEX idx_boards_owner_saved_at ON boards(owner_id, saved_at DESC);

CREATE INDEX idx_pins_owner_id ON pins(owner_id);
CREATE INDEX idx_pins_name ON pins(name);
CREATE INDEX idx_pins_author_id ON pins(author_id);
CREATE INDEX idx_pins_owner_saved_at ON pins(owner_id, saved_at DESC);

CREATE INDEX idx_board_pins_pin_id ON board_pins(pin_id);
CREATE INDEX idx_pin_images_pin_id ON pin_images(pin_id);

CREATE INDEX idx_reaction_pins_owner_reaction ON reaction_pins(owner_id, reaction_id);
CREATE INDEX idx_reaction_boards_owner_reaction ON reaction_boards(owner_id, reaction_id);
CREATE INDEX idx_bookmarks_pins_user ON bookmarks_pins(user_id);
CREATE INDEX idx_bookmarks_boards_user ON bookmarks_boards(user_id);