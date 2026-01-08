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
    i.addendum,
    ss.spreadsheet
FROM items AS i
JOIN item_conditions AS ic ON i.condition_id = ic.id
JOIN item_status AS ist ON i.status_id = ist.id
JOIN spreadsheets AS ss ON i.spreadsheet_id = ss.id
`;

    const { rows } = await pool.query(query);
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
    sku: string | null,
    size: string | null,
    notes: string | null,
    quantity: number | null,
    condition_id: number | null,
    inboundDate: string | null,
    outboundDate: string | null,
    status_id: number | null,
    addendum: string | null,
    spreadsheet_id: number
) {
    const query = `
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
    addendum,
    spreadsheet_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
        spreadsheet_id,
    ];

    await pool.query(query, values);
}

// not currently working
async function newItemReturning(
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

async function countSpreadsheetRows(spreadsheet_id: number) {
    const query = `
SELECT COUNT(*)::int AS count
FROM items
WHERE spreadsheet_id = $1
`;

    const { rows } = await pool.query(query, [ spreadsheet_id ]);
    return rows[0].count;
}

async function newSpreadsheet(spreadsheetName: string) {
    const query = `
INSERT INTO spreadsheets (spreadsheet)
VALUES ($1)
`;
    await pool.query(query, [ spreadsheetName ]);
}

async function newStatus(statusName: string) {
    const query = `
INSERT INTO item_status (status)
VALUES ($1)
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

async function countDays(spreadsheet_id: number, endDate: string) {
const query = `
SELECT 
    COALESCE(SUM(
        CASE 
            WHEN date_trunc('month', inboundDate) = date_trunc('month', $1::DATE) 
                THEN ($1::DATE - inboundDate)
            ELSE EXTRACT(DAY FROM $1::DATE)
        END
    ), 0)::INTEGER AS total_days
FROM items
WHERE 
    spreadsheet_id = $2
    AND inboundDate <= $1::DATE
    AND deleted_at IS NULL
    AND inboundDate IS NOT NULL;
`;

    const res = await pool.query(query, [ endDate, spreadsheet_id ]);
    return res.rows[0].total_days;
}


export default {
    getAllItems,
    getAllConditions,
    newCondition,
    getAllStatuses,
    newItem,
    editItem,
    deleteItem,
    suggestSKU,
    getSpreadsheets,
    getSpreadsheetRows,
    countSpreadsheetRows,
    newSpreadsheet,
    newStatus,
    deleteStatus,
    countDays,
};
