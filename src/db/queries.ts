import pool from "./pool.js";

async function getAllKeyboards() {
    const query = `
SELECT
    k.keyboardID,
    k.keyboardName,
    m.manufacturerName,
    s.switchName,
    k.quantity
FROM keyboards AS k
JOIN manufacturers AS m
ON k.manufacturerID = m.manufacturerID
JOIN switches AS s ON s.switchID = k.switchID;
`;
    const { rows } = await pool.query(query);
    return rows;
}

async function getManufacturers() {
    const query = `
SELECT manufacturerName
FROM manufacturers;
`
    const { rows } = await pool.query(query);
    console.log(rows);
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
    getAllKeyboards,
    getManufacturers,
    newManufacturer,
};
