import express, { Request, Response } from "express";
import path from "path";
import { types } from "pg";
import router from "./routes/router.js";
import apirouter from "./routes/apirouter.js";

const DIRNAME = import.meta.dirname;
const PORT = process.env.PORT || 8000;
const STATIC_PATH = path.join(DIRNAME, "public");

types.setTypeParser(types.builtins.DATE, (val) => val);

const app = express();

app.use(express.static(STATIC_PATH));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.set("views", path.join(DIRNAME, "views"));
app.set("view engine", "ejs");

app.use("/api", apirouter);
app.use("/", router);

app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Server listening on port ${PORT}`);
});
