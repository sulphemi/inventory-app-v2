import pool from "./pool.js";

const NOT_DELETED = "i.deleted_at IS NULL";

/**
 * @brief Get items that conform to the conditions
 * @param filters Array of { column, value } objects
 * @param sort Array of { column, direction } objects
 * @param notNullColumns Array of column names that must not be null
 */
async function getItems(
    filters: { column: string, value: string }[] = [], 
    sort: { column: string, direction: "ASC" | "DESC" }[] = [], 
    limit: number | null, 
    offset: number,
    notNull: string[] = []
) {
    let baseQuery = `
        FROM items AS i
        JOIN item_conditions AS ic ON i.condition_id = ic.id
        WHERE i.deleted_at IS NULL
    `;

    const values: any[] = [];
    let paramCount = 1;

    // apply prefix filters
    for (const f of filters) {
        baseQuery += ` AND i.${f.column} ILIKE $${paramCount}`;
        values.push(`${f.value}%`); 
        paramCount++;
    }

    // apply not null filters
    for (const col of notNull) {
        baseQuery += ` AND i.${col} IS NOT NULL`;
    }

    // count parameters used in filtering
    const filterParamCount = paramCount - 1;
    const countQuery = `SELECT COUNT(*)::int AS total ${baseQuery}`;

    let dataQuery = `
        SELECT
            i.internal_id, i.warehouse_id, i.sku, i.size, i.notes,
            i.quantity, ic.condition, i.inboundDate, i.outboundDate,
            i.addendum
        ${baseQuery}
    `;

    // apply sorting
    if (sort.length > 0) {
        const sortClauses = sort.map(s => `i.${s.column} ${s.direction}`);
        dataQuery += ` ORDER BY ${sortClauses.join(", ")}`;
    } else {
        dataQuery += ` ORDER BY i.internal_id DESC`;
    }

    // apply limit
    if (limit !== null) {
        dataQuery += ` LIMIT $${paramCount}`;
        values.push(limit);
        paramCount++;
    }

    // apply offset
    dataQuery += ` OFFSET $${paramCount}`;
    values.push(offset);

    const countRes = await pool.query(countQuery, values.slice(0, filterParamCount));
    const dataRes = await pool.query(dataQuery, values);

    return {
        items: dataRes.rows,
        total: countRes.rows[0].total
    };
}

/**
 * @brief Retrieves all item conditions
 * @return Array of condition objects
 */
async function getAllConditions() {
    const { rows } = await pool.query(`SELECT * FROM item_conditions`);
    return rows;
}

/**
 * @brief Inserts a new item into the inventory
 */
async function newItem(
    warehouse_id: string | null,
    sku: string | null,
    size: string | null,
    notes: string | null,
    quantity: number | null,
    condition_id: number | null,
    inboundDate: string | null,
    outboundDate: string | null,
    addendum: string | null
) {
    const query = `
INSERT INTO items (
    warehouse_id, sku, size, notes, quantity, 
    condition_id, inboundDate, outboundDate, 
    addendum
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
`;
    const values = [ warehouse_id, sku, size, notes, quantity, condition_id, inboundDate, outboundDate, addendum ];
    await pool.query(query, values);
}

/**
 * @brief Updates an existing item and returns the updated record
 */
async function editItem(
    internal_id: number,
    warehouse_id: string | null,
    sku: string | null,
    size: string | null,
    notes: string | null,
    quantity: number | null,
    condition_id: number | null,
    inboundDate: string | null,
    outboundDate: string | null,
    addendum: string | null
) {
    const query = `
WITH updated_item AS (
    UPDATE items 
    SET 
        warehouse_id = $1, sku = $2, size = $3, notes = $4, 
        quantity = $5, condition_id = $6, inboundDate = $7, 
        outboundDate = $8, addendum = $9
    WHERE internal_id = $10
    RETURNING *
)
SELECT 
    i.internal_id, i.warehouse_id, i.sku, i.size, i.notes, i.quantity,
    ic.condition, i.inboundDate, i.outboundDate, i.addendum
FROM updated_item i
LEFT JOIN item_conditions ic ON i.condition_id = ic.id
`;
    const values = [ warehouse_id, sku, size, notes, quantity, condition_id, inboundDate, outboundDate, addendum, internal_id ];
    const res = await pool.query(query, values);
    return res.rows[0];
}

/**
 * @brief Performs a soft delete on an item by setting its deleted_at timestamp
 * @param internal_id Primary key of the item to delete
 */
async function deleteItem(internal_id: number) {
    await pool.query(`UPDATE items SET deleted_at = NOW() WHERE internal_id = $1`, [ internal_id ]);
}

/**
 * @brief Suggests existing SKUs based on a partial string match
 * @param partialSKU Prefix to look for
 * @return Array of unique SKU strings { sku: string }[]
 */
async function suggestSKU(partialSKU: string) {
    const query = `SELECT DISTINCT sku FROM items i WHERE sku LIKE $1 || '%' AND ${NOT_DELETED} LIMIT 10`;
    const { rows } = await pool.query(query, [ partialSKU ]);
    return rows;
}

/**
 * @brief Calculates total holding days for active items up to a specific date
 * @param endDate The target date for the calculation
 * @return The sum of days items have been in inventory
 *
 * It only counts the days that have been part of the same month as the 
 * given date
 */
async function countDays(endDate: string) {
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
WHERE inboundDate <= $1::DATE AND deleted_at IS NULL AND inboundDate IS NOT NULL;
`;
    const res = await pool.query(query, [ endDate ]);
    return res.rows[0].total_days;
}

export default {
    getItems,
    getAllConditions,
    newItem,
    editItem,
    deleteItem,
    suggestSKU,
    countDays
};
