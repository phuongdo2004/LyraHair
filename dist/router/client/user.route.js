import express from "express";
import * as controller from "../../controller/client/user.controller.js";
import { requireAuth } from "../../middleware/client/auth.middleware.js";
import { uploadCloud } from "../../middleware/admin/uploadCloud.middleware.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
router.get("/login", controller.login);
router.post("/login", controller.postLogin);
router.get('/logout', (req, res) => {
    res.clearCookie("tokenCustomer"); // Hoặc xóa session tùy bạn
    res.redirect('/home');
});
router.get("/register", controller.register);
router.post("/register", controller.postRegister);
router.get("/profile", requireAuth, controller.profile);
router.get("/edit", requireAuth, controller.edit);
router.patch("/edit", requireAuth, upload.fields([{ name: "avatar", maxCount: 1 }]), uploadCloud, controller.patchEdit);
export const userRouter = router;
