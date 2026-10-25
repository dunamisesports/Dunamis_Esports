CREATE TABLE membres (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    doc jsonb NOT NULL,
    maison text GENERATED ALWAYS AS (doc->>'maison') STORED,
    primary_archetype text GENERATED ALWAYS AS (doc->>'primary') STORED
);

CREATE INDEX membres_maison_idx ON membres (maison);
CREATE INDEX membres_maison_primary_idx ON membres (maison, primary_archetype);
