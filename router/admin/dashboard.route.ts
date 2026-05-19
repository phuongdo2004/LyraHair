import express, { NextFunction }  from "express";
import * as controller from "../../controller/admin/dashboard.controller.js" ;
 import { Request, Response } from "express"; 

const router = express.Router();
router.get("/", controller.index);


export const dashboardRouter = router ;
