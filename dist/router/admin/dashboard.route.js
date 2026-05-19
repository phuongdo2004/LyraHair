import express from "express";
import * as controller from "../../controller/admin/dashboard.controller.js";
const router = express.Router();
router.get("/", controller.index);
export const dashboardRouter = router;
