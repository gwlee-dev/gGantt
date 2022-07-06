import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";

const app = express();
const { DEST, SRC } = process.env;

app.set("view engine", "pug");
app.set("views", process.cwd() + `/${SRC}/view/templates`);
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/static", express.static(DEST));
app.use("/", rootRouter);
app.all("*", (req, res) => {
    res.status(404).send("error/404");
});

export default app;
