\c ng_inventory

INSERT INTO item_conditions (condition)
VALUES 
  ('OK-二次销售'), 
  ('新货')
ON CONFLICT (condition) DO NOTHING;

INSERT INTO item_status (status)
VALUES
  ('存储'),
  ('出'),
  ('弃置'),
  ('报废')
ON CONFLICT (status) DO NOTHING;
  

INSERT INTO items (
  warehouseID, 
  sku, 
  size, 
  notes, 
  quantity, 
  condition_id, 
  inboundDate, 
  outboundDate,
  status_id,
  addendum
)
SELECT 
  d.warehouseID,
  d.sku,
  d.size,
  d.notes,
  d.quantity,
  ic.id,
  d.inboundDate::DATE,
  d.outboundDate::DATE,
  ist.id,
  d.addendum
FROM (VALUES
  ('23102607', '998-1-黑色亚光', '69', NULL, 1, 'OK-二次销售', '2023-10-26', NULL, '存储', NULL),
  ('23111004', '0999-黑色', '420', NULL, 1, 'OK-二次销售', '2023-11-10', NULL, '存储', NULL),
  ('23111005', '998-1-黑色亚光', '67', NULL, 1, 'OK-二次销售', '2023-11-10', NULL, '存储', NULL),
  ('23111910', '998-1-黑色亚光', '12F', NULL, 1, 'OK-二次销售', '2023-11-19', NULL, '存储', NULL),
  ('23111916', '0999-黑色', 'meow', NULL, 1, 'OK-二次销售', '2023-11-19', NULL, '存储', NULL),
  ('23112803', '0999-黑红', '42', NULL, 1, 'OK-二次销售', '2023-11-28', NULL, '存储', NULL),
  ('23112808', '0999-白色', 'x.x', NULL, 1, 'OK-二次销售', '2023-11-28', NULL, '存储', NULL),
  ('23112812', '998-1-黑色亚光', '12', NULL, 1, 'OK-二次销售', '2023-11-28', NULL, '存储', NULL),
  ('23121017', '0999-黑色', 'US12', NULL, 1, 'OK-二次销售', '2023-12-10', NULL, '存储', NULL),
  ('24000019', '998-1-黑色亚光', '80', NULL, 1, 'OK-二次销售', '2024-08-27', NULL, '存储', NULL),
  ('24000028', '998-1-黑色亚光', '90', NULL, 1, 'OK-二次销售', NULL, NULL, '存储', NULL),
  ('24000029', '998-1-黑色亚光', '100', NULL, 1, 'OK-二次销售', NULL, NULL, '存储', NULL),
  ('24000053', 'B012-1-白色', '200', NULL, 1, '新货', '2023-12-20', NULL, '存储', NULL)
) AS d(warehouseID, sku, size, notes, quantity, condition_text, inboundDate, outboundDate, status_text, addendum)
JOIN item_conditions ic ON d.condition_text = ic.condition
JOIN item_status ist ON d.status_text = ist.status;
