CREATE DATABASE ng_inventory;

\c ng_inventory;

CREATE TABLE items (
  internalID INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  warehouseID INTEGER NOT NULL,
  sku VARCHAR(128) NOT NULL,
  notes TEXT,
  quantity INTEGER DEFAULT 0,
  condition VARCHAR(128) NOT NULL,
  inboundDate DATE,
  outboundDate DATE
);
