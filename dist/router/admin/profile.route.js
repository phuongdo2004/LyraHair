import express from "express";
import * as controller from "../../controller/admin/user.controller.js";
import multer from "multer";
import { uploadCloud } from "../../middleware/admin/uploadCloud.middleware.js";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
router.get("/", controller.index);
router.get("/edit", controller.edit);
router.patch("/edit", upload.fields([{ name: "avatar", maxCount: 1 }]), uploadCloud, controller.patchEdit);
// SỬA TẠI ĐÂY: Thêm middleware upload.single
// router.post("/create", 
//   upload.fields([{ name: "images", maxCount: 10 }]),
//    uploadCloud,
//    controller.store);
export const profileRouter = router;
