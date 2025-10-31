import pool from "./pool.js";

async function getAllItems() {
    const query = `
SELECT * FROM items;
`;
    const { rows } = await pool.query(query);
    return rows;
}

async function newManufacturer(name: string) {
    const query = `
INSERT INTO manufacturers (manufacturerName)
VALUES ('${name}');
`
    await pool.query(query);
}

async function newItem(
    warehouseID: number,
    sku: string,
    notes: string,
    quantity: number,
    condition: string,
    inboundDate: Date,
    outboundDate: Date
) {
    const query = `
INSERT INTO items (
    warehouse_id, 
    sku, 
    notes, 
    quantity, 
    condition, 
    inbound_date, 
    outbound_date
)
VALUES (
    $1, 
    $2, 
    $3, 
    $4, 
    $5, 
    $6, 
    $7
)
`;

    const values = [
        warehouseID,
        sku,
        notes,
        quantity,
        condition,
        inboundDate,
        outboundDate
    ];

    await pool.query(query, values);
}

export default {
    getAllItems,
    newItem,
};
