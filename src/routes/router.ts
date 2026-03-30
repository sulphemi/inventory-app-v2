import { Router, Request, Response } from "express";
import path from "path";
import express from "express";

const router = Router();
const FRONTEND_PATH = process.env.FRONTEND_PATH || path.join(process.cwd(), "frontend", "dist");

router.use(express.static(FRONTEND_PATH));

router.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

export default router;
