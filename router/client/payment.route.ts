import express, { NextFunction }  from "express";
import * as controller from "../../controller/client/payment.controller.js" ;
import { Request, Response } from "express"; 
import { requireAuth } from "../../middleware/client/auth.middleware.js";

const router = express.Router();
router.post("/callback", controller.paymentCallback);
router.post("/", requireAuth, controller.payment);
export const paymentRouter = router ;
