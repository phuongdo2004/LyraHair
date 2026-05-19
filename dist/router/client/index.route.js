import express from "express";
import { homeRouter } from "./home.route.js";
import { userRouter } from "./user.route.js";
import { serviceRouter } from "./service.route.js";
import { requireAuth } from "../../middleware/client/auth.middleware.js";
import { paymentRouter } from "./payment.route.js";
const app = express();
export const clientRouter = (app) => {
    app.use("/user", userRouter);
    app.use("/payment", paymentRouter);
    app.use(requireAuth);
    app.use("/home", homeRouter);
    app.use("/service", serviceRouter);
};
