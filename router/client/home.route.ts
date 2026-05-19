import express, { NextFunction }  from "express";
import * as controller from "../../controller/client/home.controller.js" ;
 import { Request, Response } from "express"; 

const router = express.Router();
router.get("/", controller.index);


export const homeRouter = router ;
