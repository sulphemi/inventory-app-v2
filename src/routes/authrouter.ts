import { Router, Request, Response } from "express";

const authrouter = Router();
const NG_AUTH_SECRET = process.env.NG_AUTH_SECRET;

authrouter.get("/login", (req: Request, res: Response) => {
    res.render("login");
});

authrouter.post("/login", (req: Request, res: Response) => {
    const { secret } = req.body;
    if (secret === NG_AUTH_SECRET) {
        res.cookie("NG_AUTH_SECRET", secret, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        res.redirect("/");
    }
});

authrouter.get("/logout", (req: Request, res: Response) => {
    res.clearCookie("NG_AUTH_SECRET");
    res.redirect("/login");
});

export default authrouter;
