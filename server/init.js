import "dotenv/config";
import app from "./server";

const { SERVER_PORT } = process.env;

app.listen(
    SERVER_PORT,
    console.log(
        `\n\n\n===============================\nServer Listening on: http://localhost:${SERVER_PORT}`
    )
);
