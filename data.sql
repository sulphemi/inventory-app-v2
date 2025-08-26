INSERT INTO manufacturers (manufacturerName)
VALUES
  ('Gateron'),
  ('Outemu'),
  ('HMX'),
  ('Leobog'),
  ('Keebmonkey'),
  ('Womier'),
  ('Keychron');

INSERT INTO switches (manufacturerID, switchName, type)
VALUES
  (1, 'Gateron Red', 'Linear'),
  (1, 'Gateron Brown', 'Tactile'),
  (2, 'Outemu White', 'Linear'),
  (2, 'Outemu Blue', 'Clicky'),
  (3, 'HMX Violet', 'Linear'),
  (4, 'LEOBOG Reaper', 'Linear'),
  (4, 'LEOBOG Graywood V3', 'Linear');

INSERT INTO keyboards (manufacturerID, switchID, keyboardName, quantity)
VALUES
  (4, 6, 'LEOBOG Hi75', 3),
  (4, 7, 'LEOBOG K81', 1),
  (5, 5, 'WOBKEY Rainy75', 6),
  (6, 3, 'Womier SK71', 2),
  (6, 5, 'Womier SK75', 5),
  (6, 4, 'Womier WK68', 1),
  (7, 1, 'Keychron Q1 Max', 1),
  (7, 2, 'Keychron V3', 2);
