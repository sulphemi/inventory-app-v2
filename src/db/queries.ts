import pool from "./pool";

async function getAllKeyboards() {
    const { rows } = await pool.query("SELECT * FROM keyboards");
    console.log(rows);
    return rows;
}

export default {
    getAllKeyboards,
};
