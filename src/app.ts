import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { types } from "pg";
import cookieParser from "cookie-parser";
import authrouter from "./routes/authrouter.js";
import router from "./routes/router.js";
import apirouter from "./routes/apirouter.js";

const DIRNAME = import.meta.dirname;
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8000;
const STATIC_PATH = path.join(DIRNAME, "public");

const AUTH_SECRET = process.env.NG_AUTH_SECRET;

types.setTypeParser(types.builtins.DATE, (val) => val);

const app = express();

app.use(cookieParser());
app.use(express.static(STATIC_PATH));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("views", path.join(DIRNAME, "views"));
app.set("view engine", "ejs");

app.use("/auth", authrouter);


const authGuard = (req: Request, res: Response, next: NextFunction) => {
    const userSecret = req.cookies.NG_AUTH_SECRET;
    if (userSecret === AUTH_SECRET) {
        return next();
    }
    res.redirect("/auth/login");
};

// authGuard applies to everything below this call
app.use(authGuard);

app.use("/api", apirouter);
app.use("/", router);

app.listen(PORT, HOST, () => {
    console.log(`Server listening on port ${PORT}`);
});
