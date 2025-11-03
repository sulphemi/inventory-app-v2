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

export default {
    getAllItems,
    newItem,
};
