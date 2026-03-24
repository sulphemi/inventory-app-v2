CREATE DATABASE ng_inventory;

\c ng_inventory;

CREATE TABLE item_conditions (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  condition TEXT UNIQUE NOT NULL
);

CREATE TABLE items (
  internal_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  warehouse_id INTEGER UNIQUE NOT NULL,
  sku TEXT,
  size TEXT,
  notes TEXT,
  quantity INTEGER DEFAULT 0,
  condition_id INTEGER REFERENCES item_conditions(id) NOT NULL,
  inboundDate DATE,
  outboundDate DATE,
  addendum TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE log (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  item_id INTEGER REFERENCES items(internal_id) NOT NULL,
  log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  old_values JSONB,
  new_values JSONB
);

CREATE FUNCTION log_item_diff()
RETURNS TRIGGER AS $$
DECLARE
    old_row_json JSONB := to_jsonb(OLD);
    new_row_json JSONB := to_jsonb(NEW);
    changed_old JSONB := '{}';
    changed_new JSONB := '{}';
    key_name TEXT;
    old_val JSONB;
    new_val JSONB;
BEGIN
    FOR key_name, new_val IN SELECT * FROM jsonb_each(new_row_json)
    LOOP
        old_val := old_row_json -> key_name;

        IF new_val IS DISTINCT FROM old_val THEN
            changed_old := changed_old || jsonb_build_object(key_name, old_val);
            changed_new := changed_new || jsonb_build_object(key_name, new_val);
        END IF;
    END LOOP;

    IF changed_new <> '{}'::jsonb THEN
        INSERT INTO log (item_id, old_values, new_values)
        VALUES (NEW.internal_id, changed_old, changed_new);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_item_diff
AFTER UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION log_item_diff();

