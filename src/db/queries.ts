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
    i.outboundDate
FROM items AS i
JOIN item_conditions AS ic ON i.condition_id = ic.id;
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
    i.outboundDate
FROM items i
LEFT JOIN item_conditions ic ON i.condition_id = ic.id
ORDER BY i.internalID
LIMIT $1
OFFSET $2
`;

    const { rows } = await pool.query(query, [n, start]);
    return rows;
}

async function getAllConditions() {
    const query = `SELECT * from item_conditions`;
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

async function newItem(
    warehouseID: string | null,
    sku: string | string | null,
    size: string | null,
    notes: string | null,
    quantity: number | null,
    condition_id: number | null,
    inboundDate: Date | null,
    outboundDate: Date | null
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
        outbounddate
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
    i.outboundDate
FROM inserted_item i
LEFT JOIN item_conditions ic ON i.condition_id = ic.id
`;

    const values = [
        warehouseID,
        sku,
        size,
        notes,
        quantity,
        condition_id,
        inboundDate,
        outboundDate
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
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
    newItem,
    suggestSKU,
};
