import express from "express";
import * as controller from "../../controller/admin/categories.controller.js"; ;
import multer from "multer";
import { uploadCloud } from "../../middleware/admin/uploadCloud.middleware.js";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
router.get("/", controller.index);
router.get("/create", controller.create);
router.post("/create", controller.store);
router.get("/edit/:id", controller.edit);
router.patch("/edit/:id", controller.update);
router.get("/detail/:id", controller.details);
router.patch("/delete/:id", controller.deleteCategory);

export const serviceCategoryRouter   = router;