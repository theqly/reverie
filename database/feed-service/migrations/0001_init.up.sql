CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tagged_pins (
    pin_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (pin_id, tag_id),
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_tagged_pins_pin_id ON tagged_pins(pin_id);
CREATE INDEX idx_tagged_pins_tag_id ON tagged_pins(tag_id);