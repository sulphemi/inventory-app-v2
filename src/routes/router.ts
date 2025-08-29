import { Router, Request, Response } from "express";
import Queries from "../db/queries.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    // note to self wrap this with a try block later
    res.render("index", { keyboards: await Queries.getAllKeyboards() });
});

router.get("/manufacturers", async (req: Request, res: Response) => {
    res.render("manufacturers", { manufacturers:
        await Queries.getManufacturers() });
});

router.get("/newproduct", async (req: Request, res: Response) => {
    res.render("newproduct", { manufacturers:
        await Queries.getManufacturers() });
});

router.get("/newmanufacturer", (req: Request, res: Response) => {
    res.render("newmanufacturer");
});

router.post("/newmanufacturer", async (req: Request, res: Response) => {
    console.log(req.body.manufacturername);
    await Queries.newManufacturer(req.body.manufacturername);
    res.redirect("/manufacturers");
});

export default router;
