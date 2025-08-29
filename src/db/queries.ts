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
JOIN switches AS s ON s.switchID = k.switchID
`;
    const { rows } = await pool.query(query);
    console.log(rows);
    return rows;
}

export default {
    getAllKeyboards,
};
