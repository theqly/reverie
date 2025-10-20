CREATE TABLE access_levels (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    access_level_id INTEGER NOT NULL,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (access_level_id) REFERENCES access_levels(id)
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
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    place_id UUID,
    description TEXT,
    rating FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    pin_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
);

CREATE TYPE content_type AS ENUM ('pin', 'board');

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    for_type content_type NOT NULL,
    content_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    id SERIAL PRIMARY KEY,
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

INSERT INTO access_levels (type) VALUES
    ('private'),
    ('public'),
    ('group'),
    ('group public');