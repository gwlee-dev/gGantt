import "dotenv/config";
import express from "express";
import morgan from "morgan";

const { SERVER_PORT } = process.env;

const app = express();
const { DEST, SRC } = process.env;

app.set("view engine", "pug");
app.set("views", process.cwd() + `/${SRC}/view`);
app.use(morgan("dev"));

app.use("/static", express.static(DEST));
app.use("/", (req, res) => res.render("index"));

app.listen(
    SERVER_PORT,
    console.log(
        `\n\n\n===============================\nServer Listening on: http://localhost:${SERVER_PORT}`
    )
);
