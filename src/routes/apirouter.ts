import { PassThrough } from "stream";
import { Request, Response, Router } from "express";
import archiver from "archiver";
import Queries from "../db/queries.js";
import { QueryFilter, QuerySort } from "../types.js";
import Excel from "../db/excel.js";

const apirouter = Router();

const router = apirouter;

router.get("/items", async (req: Request, res: Response) => {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : null;

    const sorts: QuerySort[] = [];
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

    const filters: QueryFilter[] = [];
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
        const items = await Queries.getItems(
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

router.get("/count", async (req: Request, res: Response) => {
    const offset = req.query.offset;
    const limit = req.query.limit;

    const sorts: QuerySort[] = [];
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

    const filters: QueryFilter[] = [];
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
        const count = await Queries.getItemsCount(filters, notNullColumns);
        res.json({ success: true, length: count });
    } catch (error) {
        res.status(500).json({ success: false, items: null });
    }
});

router.get("/export", async (req: Request, res: Response) => {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : null;

    const sorts: QuerySort[] = [];
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

    const filters: QueryFilter[] = [];
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
        const items = await Queries.getItems(
            filters,
            sorts,
            limit,
            offset,
            notNullColumns
        );

        const filename = `export-${new Date()}.xlsx`;

        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        await Excel.create_export(res, items);
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
            req.body.addendum || null,
        );
        res.status(201).json({ success: true, newItem });
    } catch (error) {
        res.status(500).json({ success: false, newItem: null });
    }
});

router.get("/items/:id", async (req: Request, res: Response) => {
    const id = +req.params.id;
    const row = await Queries.getItemInfo(id);

    if (row == null) {
        return res.status(404).json({ success: false, message: "not found" });
    }
    const { item, history } = row;

    res.json({ success: true, item, history });
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
            req.body.addendum || null,
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

router.get("/suggest", async (req: Request, res: Response) => {
    const suggestions = await Queries.suggestSKU((req.query.partialSKU as string) || "");
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

router.get("/monthly_summary", async (req: Request, res: Response) => {
    const enddate = (req.query.date as string || "").replaceAll("-", "/");

    // temporary solution, should probably store this in the db
    const warehouses = [
        { name: "A", prefixes: ["23", "15", "16", "17", "18", "19"] },
        { name: "B", prefixes: ["24", "25", "26", "27", "28", "29", "55"] },
        { name: "C", prefixes: ["35", "36", "37", "38", "39"] },
        { name: "D", prefixes: ["50", "51", "56", "57", "58"] },
        { name: "E", prefixes: ["45", "46", "47", "48", "49"] },
        { name: "F", prefixes: ["66", "67", "68", "69"] },
    ];

    // set proper headers
    res.attachment("monthly_summaries.zip");
    res.setHeader("Content-Type", "application/zip");

    // creating a zip file to pipe back to the client
    const archive = archiver("zip", { zlib: { level: 0 } });
    archive.pipe(res);

    for (const warehouse of warehouses) {
        const filename = `${warehouse.name}.xlsx`;
        const data = [];

        // collect the data
        // TODO: should write this as one query instead of looping getItems
        for (const prefix of warehouse.prefixes) {
            const items = await Queries.getItems(
                [{ column: "warehouse_id", value: prefix }],
                [], null, 0, []
            );
            data.push(...items);
        }

        // create a stream to write the workbook file
        const workbook_stream = new PassThrough();

        // add the workbook file to the zip
        archive.append(workbook_stream, { name: filename });

        // create the workbook and write it into the stream
        await Excel.monthly_summary(workbook_stream, data, enddate);
    }

    await archive.finalize();
});

export default apirouter;
