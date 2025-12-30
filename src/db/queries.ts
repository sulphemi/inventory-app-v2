import pool from "./pool.js";

async function getAllItems() {
    const query = `
SELECT
    i.internal_id,
    i.warehouse_id,
    i.sku,
    i.size,
    i.notes,
    i.quantity,
    ic.condition,
    i.inboundDate,
    i.outboundDate,
    ist.status,
    i.addendum
FROM items AS i
JOIN item_conditions AS ic ON i.condition_id = ic.id
JOIN item_status AS ist ON i.condition_id = ist.id
`;

    const { rows } = await pool.query(query);
    return rows;
}

async function getItems(start: number, end: number) {
    start--;
    const n = end - start;

    const query = `
SELECT 
    i.internal_id,
    i.warehouse_id,
    i.sku,
    i.size,
    i.notes,
    i.quantity,
    ic.condition,
    i.inboundDate,
    i.outboundDate,
    ist.status,
    i.addendum
FROM items i
LEFT JOIN item_conditions ic ON i.condition_id = ic.id
LEFT JOIN item_status ist ON i.status_id = ist.id
ORDER BY i.internal_id
LIMIT $1
OFFSET $2
`;

    const { rows } = await pool.query(query, [ n, start ]);
    return rows;
}

async function getAllConditions() {
    const query = `SELECT * FROM item_conditions`;
    const { rows } = await pool.query(query);
    return rows;
}

async function newCondition(condition: string) {
    const query = `
INSERT INTO item_conditions (condition)
VALUES ($1)
`;
    await pool.query(query, [ condition ]);
}

async function getAllStatuses() {
    const query = `SELECT * FROM item_status`;
    const { rows } = await pool.query(query);
    return rows;
}

async function newItem(
    warehouse_id: string | null,
    sku: string | string | null,
    size: string | null,
    notes: string | null,
    quantity: number | null,
    condition_id: number | null,
    inboundDate: string | null,
    outboundDate: string | null,
    status_id: number | null,
    addendum: string | null
) {
    const query = `
WITH inserted_item AS (
    INSERT INTO items (
        warehouse_id, 
        sku, 
        size, 
        notes, 
        quantity, 
        condition_id, 
        inbounddate, 
        outbounddate,
        status_id,
        addendum
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
)
SELECT 
    i.internal_id,
    i.warehouse_id,
    i.sku,
    i.size,
    i.notes,
    i.quantity,
    ic.condition,
    i.inboundDate,
    i.outboundDate,
    ist.status,
    addendum
FROM inserted_item i
LEFT JOIN item_conditions ic ON i.condition_id = ic.id
LEFT JOIN item_status ist ON i.status_id = ist.id
`;

    const values = [
        warehouse_id,
        sku,
        size,
        notes,
        quantity,
        condition_id,
        inboundDate,
        outboundDate,
        status_id,
        addendum,
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
}

async function editItem(
    internal_id: number,
    warehouse_id: string | null,
    sku: string | string | null,
    size: string | null,
    notes: string | null,
    quantity: number | null,
    condition_id: number | null,
    inboundDate: string | null,
    outboundDate: string | null,
    status_id: number | null,
    addendum: string | null
) {
    const query = `
WITH updated_item AS (
    UPDATE items 
    SET 
        warehouse_id = $1, 
        sku = $2, 
        size = $3, 
        notes = $4, 
        quantity = $5, 
        condition_id = $6, 
        inbounddate = $7, 
        outbounddate = $8,
        status_id = $9,
        addendum = $10
    WHERE internal_id = $11
    RETURNING *
)
SELECT 
    i.internal_id,
    i.warehouse_id,
    i.sku,
    i.size,
    i.notes,
    i.quantity,
    ic.condition,
    i.inboundDate,
    i.outboundDate,
    ist.status,
    i.addendum
FROM updated_item i
LEFT JOIN item_conditions ic ON i.condition_id = ic.id
LEFT JOIN item_status ist ON i.status_id = ist.id
`;

    const values = [
        warehouse_id,
        sku,
        size,
        notes,
        quantity,
        condition_id,
        inboundDate,
        outboundDate,
        status_id,
        addendum,
        internal_id
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
}

async function deleteItem(internal_id: number) {
    const query = `DELETE FROM items WHERE internal_id = $1`;
    await pool.query(query, [internal_id]);
}

async function suggestSKU(partialSKU: string) {
    const query = `
SELECT DISTINCT sku FROM items WHERE sku LIKE $1 || '%' LIMIT 10
`
    const { rows } = await pool.query(query, [ partialSKU ]);
    return rows;
}

async function getSpreadsheets() {
    const query = `SELECT * FROM spreadsheets`;

    const { rows } = await pool.query(query);
    return rows;
}

async function getSpreadsheetRows(spreadsheet_id: number, limit: number | null, offset: number) {
    const query = `
SELECT 
    i.internal_id,
    i.warehouse_id,
    i.sku,
    i.size,
    i.notes,
    i.quantity,
    ic.condition,
    i.inboundDate,
    i.outboundDate,
    ist.status,
    i.addendum
FROM items i
LEFT JOIN item_conditions ic ON i.condition_id = ic.id
LEFT JOIN item_status ist ON i.status_id = ist.id
WHERE spreadsheet_id = $1
ORDER BY i.internal_id
LIMIT $2
OFFSET $3
`;

    const { rows } = await pool.query(query, [spreadsheet_id, limit, offset]);
    return rows;
}

async function newSpreadsheet(spreadsheetName: string) {
    const query = `
INSERT INTO spreadsheets (spreadsheet)
VALUES $1
`;
    await pool.query(query, [ spreadsheetName ]);
}

async function newStatus(statusName: string) {
    const query = `
INSERT INTO item_status (status)
VALUES $1
`;
    await pool.query(query, [ statusName ]);
}

async function deleteStatus(status_id: number) {
    const query = `
DELETE FROM item_status
WHERE id = $1
`;
    await pool.query(query, [ status_id ]);
}

export default {
    getAllItems,
    getItems,
    getAllConditions,
    newCondition,
    getAllStatuses,
    newItem,
    editItem,
    deleteItem,
    suggestSKU,
    getSpreadsheets,
    getSpreadsheetRows,
    newSpreadsheet,
    newStatus,
    deleteStatus,
};
