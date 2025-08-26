import { Router, Request, Response } from "express";
import Queries from "../db/queries.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    // note to self wrap this with a try block later
    res.render("index", { keyboards: await Queries.getAllKeyboards() });
});

export default router;
