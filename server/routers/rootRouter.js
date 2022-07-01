import express from "express";
import { indexController } from "../controllers/rootController";

const rootRouter = express.Router();
rootRouter.get("/", indexController);

export default rootRouter;
