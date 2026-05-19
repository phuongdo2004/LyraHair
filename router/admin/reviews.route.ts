import express from "express";
import * as controller from "../../controller/admin/review.controller.js" ;
import multer from "multer";
import { uploadCloud } from "../../middleware/admin/uploadCloud.middleware.js";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
router.get("/", controller.index);


export const reviewsRouter = router;