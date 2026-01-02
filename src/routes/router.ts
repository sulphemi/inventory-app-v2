import { Router, Request, Response } from "express";
import Queries from "../db/queries.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    // note to self wrap this with a try block later
    res.render("index", { items: await Queries.getAllItems() });
});

router.get("/spreadsheets", async (req: Request, res: Response) => {
    res.render("spreadsheets", { spreadsheets: await Queries.getSpreadsheets() });
});

router.get("/newSpreadsheet", async (req: Request, res: Response) => {
    res.render("newSpreadsheet");
});

router.get("/spreadsheets/:id", async (req: Request, res: Response) => {
    res.redirect(`/spreadsheets/${req.params.id}/1`);
});

router.get("/spreadsheets/:id/:page", async (req: Request, res: Response) => {
    // TODO: set default limit only if there is none given
    const DEFAULT_PAGE_LIMIT = 50;

    const limit = DEFAULT_PAGE_LIMIT;
    const id = +req.params.id;
    const page = +req.params.page;
    const offset = limit * (page - 1);

    res.render("spreadsheetview",
        {
            rows: await Queries.getSpreadsheetRows(id, limit, offset),
            limit: limit,
            currpage: page,
            totalpages: Math.ceil(await Queries.countSpreadsheetRows(id) / limit),
        }
    );
});

router.post("/api/newSpreadsheet", async (req: Request, res: Response) => {
    console.log(req.body);
    await Queries.newSpreadsheet(req.body.spreadsheetname);
    res.redirect("/spreadsheets");
})

router.post("/api/newItem", async (req: Request, res: Response) => {
    console.log(req.body);
    if (req.body.warehouse_id === null || req.body.sku === null) {
        res.redirect("/err");
        return;
    }

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

        res.json(newItem);
    } catch (e: any) {
        res.redirect("/err");
    }
});

router.get("/api/items/:start-:end", async (req: Request, res: Response) => {
    const { start, end } = req.params;
    try {
        res.json(await Queries.getItems(+start, +end));
    } catch (e: any) {
        res.status(400).redirect("/err");
    }
});

router.get("/api/all", async (req: Request, res: Response) => {
    res.json(await Queries.getAllItems());
});

router.get("/api/conditions", async (req: Request, res: Response) => {
    res.json(await Queries.getAllConditions());
});

router.get("/api/status", async (req: Request, res: Response) => {
    res.json(await Queries.getAllStatuses());
});

router.post("/api/suggest", async (req: Request, res: Response) => {
    res.json(await Queries.suggestSKU(req.body.partialSKU || ""));
});

router.post("/api/newCondition", async (req: Request, res: Response) => {
    const { condition } = req.body;
    console.log(`received: ${condition}`);
    await Queries.newCondition(condition);
    res.redirect("/");
});

router.get("/api/newCondition", async (req: Request, res: Response) => {
    res.render("newcondition");
});

router.delete("/api/items/:id", async (req: Request, res: Response) => {
    await Queries.deleteItem(+req.params.id);
    res.json({success: true});
});

router.patch("/api/items/:id", async (req: Request, res: Response) => {
    try {
        const item = await Queries.editItem(
            +req.params.id,
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

        res.json(item);
    } catch (e: any) {
        res.status(500).redirect("/err");
    }
});

router.get("/api/spreadsheets", async (req: Request, res: Response) => {
    res.json(await Queries.getSpreadsheets());
});

router.get("/api/spreadsheets/:spreadsheet_id/items", async (req: Request, res: Response) => {
    const { spreadsheet_id } = req.params;
    const { limit, offset } = req.query;

    const limit_num = limit ? +limit : null;
    const offset_num = offset ? +offset : 0;

    res.json(await Queries.getSpreadsheetRows(+spreadsheet_id, limit_num, offset_num));
});

router.post("/api/spreadsheets/new", async (req: Request, res: Response) => {
    const { name } = req.body;
    res.json(await Queries.newSpreadsheet(name));
});

router.post("/api/status/new", async (req: Request, res: Response) => {
    const { name } = req.body;
    res.json(await Queries.newStatus(name));
});

router.delete("/api/status/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    await Queries.deleteStatus(+id);
    res.json({ success: true });
});

export default router;
