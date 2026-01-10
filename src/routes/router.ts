import { Router, Request, Response } from "express";
import Queries from "../db/queries.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    res.render("index");
});

router.get("/items/:page", async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.params.page) || 1);
    const limit = 50; 
    const offset = (page - 1) * limit;

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

        res.render("spreadsheetview", {
            rows: items,
            totalCount: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            currentFilters: req.query 
        });
    } catch (error) {
        console.error("Query Error:", error);
        res.status(500).send("Database Error");
    }
});

router.get("/newItem", async (req: Request, res: Response) => {
    res.render("newItem", {
        conditionList: await Queries.getAllConditions(),
    });
});

router.get("/editItem/:id", async (req: Request, res: Response) => {
    const id = +req.params.id;

    const oldItemDataRows = await Queries.getItemInfo(id);

    if (oldItemDataRows.length === 0) {
        res.status(400).send("Bad id");
        return;
    } 

    console.log(oldItemDataRows);

    res.render("editItem", {
        oldItemInfo: oldItemDataRows[0],
        conditionList: await Queries.getAllConditions(),
    });
});

router.post("/editItem/:id", async (req: Request, res: Response) => {
    const id = +req.params.id;

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

    res.redirect("/redirect");
});

router.post("/newItem", async (req: Request, res: Response) => {
    await Queries.newItem(
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

    res.redirect("/redirect");
});

router.post("/suggest", async (req: Request, res: Response) => {
    res.json(await Queries.suggestSKU(req.body.partialSKU || ""));
});

router.get("/bin", async (req: Request, res: Response) => {
    res.render("bin");
});

router.get("/search", async (req: Request, res: Response) => {
    res.render("search");
});

router.get("/redirect", (req: Request, res: Response) => {
    res.render("redirect");
});

router.post("/delete/:item_id", async (req: Request, res: Response) => {
    const id = +req.params.item_id;
    await Queries.deleteItem(id);
    res.redirect("/redirect");
});

export default router;
