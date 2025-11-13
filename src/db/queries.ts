import pool from "./pool.js";

async function getAllItems() {
    const query = `
SELECT * FROM items;
`;
    const { rows } = await pool.query(query);
    return rows;
}

async function newItem(
    warehouseID: number,
    sku: string,
    size: string | null,
    notes: string | null,
    quantity: number | null,
    condition: string | null,
    inboundDate: Date | null,
    outboundDate: Date | null
) {
    const query = `
INSERT INTO items (
    warehouseid, 
    sku, 
    size, 
    notes, 
    quantity, 
    condition, 
    inbounddate, 
    outbounddate
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
`;

    const values = [
        warehouseID,
        sku,
        size,
        notes,
        quantity,
        condition,
        inboundDate,
        outboundDate
    ];

    console.log(values);

    await pool.query(query, values);
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
    newItem,
    suggestSKU,
};
