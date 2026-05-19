import express from "express";
import * as controller from "../../controller/client/home.controller.js";
const router = express.Router();
router.get("/", controller.index);
export const homeRouter = router;
