import express from "express";
import * as controller from "../../controller/client/bookings.controller.js";
const router = express.Router();
router.get("/history", 
//     ()=>{
//     console.log("Đã vào route /bookings/history");
// }, 
controller.history);
router.get("/detail/:id", controller.getBookingDetail);
export const bookingsRouter = router;
