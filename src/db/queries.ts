import pool from "./pool.js";

async function getAllItems() {
    const query = `
SELECT
    i.internalID,
    i.warehouseID,
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
    i.internalID,
    i.warehouseID,
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
ORDER BY i.internalID
LIMIT $1
OFFSET $2
`;

    const { rows } = await pool.query(query, [n, start]);
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
    warehouseID: string | null,
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
        warehouseid, 
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
    i.internalID,
    i.warehouseID,
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
        warehouseID,
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
    internalID: number,
    warehouseID: string | null,
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
        warehouseid = $1, 
        sku = $2, 
        size = $3, 
        notes = $4, 
        quantity = $5, 
        condition_id = $6, 
        inbounddate = $7, 
        outbounddate = $8,
        status_id = $9,
        addendum = $10
    WHERE internalID = $11
    RETURNING *
)
SELECT 
    i.internalID,
    i.warehouseID,
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
        warehouseID,
        sku,
        size,
        notes,
        quantity,
        condition_id,
        inboundDate,
        outboundDate,
        status_id,
        addendum,
        internalID
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
}

async function deleteItem(internalID: number) {
    const query = `DELETE FROM items WHERE internalID = $1`;
    await pool.query(query, [internalID]);
}

async function suggestSKU(partialSKU: string) {
    const query = `
SELECT DISTINCT sku FROM items WHERE sku LIKE $1 || '%' LIMIT 10
`
    const { rows } = await pool.query(query, [ partialSKU ]);
    return rows;
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
};
