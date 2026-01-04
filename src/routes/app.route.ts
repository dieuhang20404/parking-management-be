import express from "express";
import * as controller from "../controllers/app.controller";

let appRoute = express.Router();

appRoute.get("/test-api", controller.testApiController);
appRoute.get("/reload-page", controller.reloadPageController);
appRoute.get("/get-all-ticket", controller.getAllTicketController);
appRoute.get("/get-plate-number", controller.getPlateNumberController);
appRoute.get("/create-ticket", controller.createTicketController);
appRoute.get("/send-otp", controller.sendOtpController);
appRoute.post("/check-otp", controller.checkOtpController);
appRoute.get("/get-empty-position", controller.getEmptyPositionController);
appRoute.get("/get-history", controller.getHistoryController);
appRoute.get("/create-ticket-test", controller.createTicketTestController);

// Nhận dữ liệu từ esp32 (cảm biến)
appRoute.post("/esp32/sensor-data", controller.receiveSensorDataController);

// Nhận dữ liệu từ esp32 (hình ảnh)
appRoute.post("/esp32/image", controller.receiveImageController);

// Gửi tín hiệu điều khiển servo cho esp32
appRoute.post("/esp32/servo", controller.sendServoSignalController);

// Tạo mã QR từ dữ liệu nhận được
appRoute.post("/generate-qr", controller.generateQrController);

export default appRoute;