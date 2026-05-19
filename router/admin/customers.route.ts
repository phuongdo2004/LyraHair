import express, { NextFunction }  from "express";
import * as controller from "../../controller/admin/customer.controller.js" ;
 import { Request, Response } from "express"; 

const router = express.Router();
router.get("/", controller.index);


export const customerRouter = router ;