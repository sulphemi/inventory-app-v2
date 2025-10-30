import { Router, Request, Response } from "express";
import Queries from "../db/queries.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    // note to self wrap this with a try block later
    res.render("index", { items: await Queries.getAllItems() });
});

router.post("/newmanufacturer", async (req: Request, res: Response) => {
    console.log(req.body.manufacturername);
    await Queries.newManufacturer(req.body.manufacturername);
    res.redirect("/manufacturers");
});

export default router;
