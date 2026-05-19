import express from "express";
import * as controller from "../../controller/admin/customer.controller.js";
const router = express.Router();
router.get("/", controller.index);
export const customerRouter = router;
