import { Router, Request, Response } from "express";
import Queries from "../db/queries.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    // note to self wrap this with a try block later
    res.render("index", { items: await Queries.getAllItems() });
});

router.post("/newItem", async (req: Request, res: Response) => {
    console.log(req.body);
    if (req.body.warehouseid === null || req.body.sku === null) {
        res.redirect("/err");
        return;
    }

    let warehouseidNumber = +req.body.warehouseid;
    if (!warehouseidNumber) {
        res.redirect("/err");
        return;
    }

    try {
        await Queries.newItem(
            warehouseidNumber,
            req.body.sku! || null,
            req.body.size || null,
            req.body.notes || null,
            req.body.quantity || 0,
            req.body.condition || null,
            req.body.inbounddate ? new Date(req.body.inbounddate) : null,
            req.body.outbounddate ? new Date(req.body.outbounddate) : null,
        );
    } catch (e: any) {
        res.redirect("/err");
    }

    res.redirect("/");
});

router.post("/api/suggest", async (req: Request, res: Response) => {
    // TODO: add error checking please
    console.log("REQUEST BODY ==============");
    console.log(req.body);
    console.log(typeof req.body)
    const partialSKU = req.body.partialSKU;
    console.log(partialSKU);
    res.json(await Queries.suggestSKU(partialSKU));
});

export default router;
