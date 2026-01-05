import express from "express";
import * as controller from "../controllers/app.controller";

let appRoute = express.Router();

appRoute.get("/reload-page", controller.reloadPageController);
appRoute.get("/get-all-ticket", controller.getAllTicketController);
appRoute.get("/get-plate-number", controller.getPlateNumberController);
appRoute.post("/create-ticket", controller.createTicketController);
appRoute.get("/send-otp", controller.sendOtpController);
appRoute.post("/check-otp", controller.checkOtpController);
appRoute.get("/get-empty-position", controller.getEmptyPositionController);
appRoute.get("/get-history", controller.getHistoryController);
appRoute.get("/checkout", controller.checkoutController);
appRoute.get("/create-ticket-test", controller.createTicketTestController);

export default appRoute;