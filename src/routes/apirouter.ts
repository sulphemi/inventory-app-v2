import { Request, Response, Router } from "express";
import Queries from "../db/queries.js";

const apirouter = Router();

const router = apirouter;

router.get("/items", async (req: Request, res: Response) => {
    const offset = req.query.offset;
    const limit = req.query.limit;

    const sorts: { column: string, direction: "ASC" | "DESC" }[] = [];
    if (req.query.sortBy) {
        const columns = (req.query.sortBy as string).split(',');
        const directions = (req.query.direction as string || "ASC").split(',');

        columns.forEach((col, index) => {
            sorts.push({
                column: col.trim(),
                direction: (directions[index]?.toUpperCase() === "DESC") ? "DESC" : "ASC"
            });
        });
    }

    const filters: { column: string, value: string }[] = [];
    if (req.query.filterBy) {
        const filterCols = (req.query.filterBy as string).split(',');
        const filterVals = (req.query.filterValue as string || "").split(',');

        filterCols.forEach((col, index) => {
            const val = filterVals[index];
            if (val !== undefined && val !== "") {
                filters.push({
                    column: col.trim(),
                    value: val.trim()
                });
            }
        });
    }

    const notNullColumns: string[] = [];
    if (req.query.notNull) {
        const cols = (req.query.notNull as string).split(',');
        cols.forEach(col => {
            const trimmed = col.trim();
            if (trimmed) notNullColumns.push(trimmed);
        });
    }

    try {
        const { items, total } = await Queries.getItems(
            filters,
            sorts,
            limit,
            offset,
            notNullColumns
        );

        res.json({ success: true, items });
    } catch (error) {
        res.status(500).json({ success: false, items: null });
    }
});

router.post("/items", async (req: Request, res: Response) => {
    try {
        const newItem = await Queries.newItem(
            req.body.warehouse_id,
            req.body.sku || null,
            req.body.size || null,
            req.body.notes || null,
            req.body.quantity || 0,
            req.body.condition_id || null,
            req.body.inbounddate || null,
            req.body.outbounddate || null,
            req.body.status_id || null,
            req.body.addendum || null,
        );
        res.status(201).json({ success: true, newItem });
    } catch (error) {
        res.status(500).json({ success: false, newItem: null });
    }
});

router.get("/items/details/:id", async (req: Request, res: Response) => {
    const id = +req.params.id;
    const rows = await Queries.getItemInfo(id);

    if (rows.length === 0) {
        return res.status(404).json({ success: false, itemInfo: null });
    } 

    res.json({ success: true, itemInfo: rows[0] });
});

router.put("/items/:id", async (req: Request, res: Response) => {
    const id = +req.params.id;
    try {
        await Queries.editItem(
            id,
            req.body.warehouse_id,
            req.body.sku || null,
            req.body.size || null,
            req.body.notes || null,
            req.body.quantity || 0,
            req.body.condition_id || null,
            req.body.inbounddate || null,
            req.body.outbounddate || null,
            req.body.status_id || null,
            req.body.addendum || null,
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

router.get("/suggest", async (req: Request, res: Response) => {
    const suggestions = await Queries.suggestSKU(req.params.partialSKU || "");
    res.json(suggestions);
});

router.delete("/items/:id", async (req: Request, res: Response) => {
    const id = +req.params.id;
    try {
        await Queries.deleteItem(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

router.get("/conditions", async (req: Request, res: Response) => {
    const conditions = await Queries.getAllConditions();
    res.json(conditions);
});

export default apirouter;
