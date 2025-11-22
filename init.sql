CREATE DATABASE ng_inventory;

\c ng_inventory;

CREATE TABLE item_conditions (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  condition TEXT UNIQUE NOT NULL
);

CREATE TABLE item_status (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  status TEXT UNIQUE NOT NULL
);

CREATE TABLE items (
  internalID INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  warehouseID TEXT,
  sku TEXT,
  size TEXT,
  notes TEXT,
  quantity INTEGER DEFAULT 0,
  condition_id INTEGER REFERENCES item_conditions(id),
  inboundDate DATE,
  outboundDate DATE,
  status_id INTEGER REFERENCES item_status(id),
  addendum TEXT
);
