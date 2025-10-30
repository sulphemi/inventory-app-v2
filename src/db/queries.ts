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

export default {
    getAllItems,
};
