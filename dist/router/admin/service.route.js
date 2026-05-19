import express from "express";
import * as controller from "../../controller/admin/service.controller.js";
import multer from "multer";
import { uploadCloud } from "../../middleware/admin/uploadCloud.middleware.js";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
router.get("/", controller.index);
router.get("/create", controller.create);
router.get("/detail/:id", controller.detail);
router.get("/edit/:id", controller.edit);
router.post("/edit/:id", upload.fields([{ name: "images", maxCount: 10 }]), uploadCloud, controller.editPost);
// SỬA TẠI ĐÂY: Thêm middleware upload.single
router.post("/create", upload.fields([{ name: "images", maxCount: 10 }]), uploadCloud, controller.store);
// Xóa mềm
router.patch("/delete/:id", controller.deleted);
export const serviceRouter = router;
