CREATE DATABASE keyboard_inventory;

\c keyboard_inventory;

CREATE TABLE manufacturers (
  manufacturerID INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  manufacturerName VARCHAR(128) NOT NULL
);

CREATE TYPE SWITCH_TYPE AS ENUM ('Linear', 'Tactile', 'Clicky', 'Optical', 'Magnetic');

CREATE TABLE switches (
  switchID INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  manufacturerID INTEGER REFERENCES manufacturers(manufacturerID),
  switchName VARCHAR(128) NOT NULL,
  type SWITCH_TYPE NOT NULL
);

CREATE TABLE keyboards (
  keyboardID INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  manufacturerID INTEGER REFERENCES manufacturers(manufacturerID),
  switchID INTEGER REFERENCES switches(switchID),
  keyboardName VARCHAR(128) NOT NULL,
  quantity INTEGER DEFAULT 0
);
