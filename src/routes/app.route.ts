import express from "express";
import * as controller from "../controllers/app.controller";
import {getFindPathService} from "../services/app.service";

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
// appRoute.get("/get-find-path", async (req, res) => {
//     const startX = parseInt(req.query.x as string) || 0;
//     const startY = parseInt(req.query.y as string) || 0;
//
//     const result = await getFindPathService([startX, startY]);
//     res.json(result);
// });
appRoute.get("/get-find-path", controller.getFindPathController);
// appRoute.get("/get-find-path", async (req, res) => {
//     console.log("\n==========================================");
//     console.log("🚀 NEW REQUEST TO /get-find-path");
//     console.log("==========================================");
//
//     try {
//         console.log("✅ Step 1: Request received");
//         console.log("Query params:", req.query);
//
//         console.log("✅ Step 2: Parsing parameters");
//         const startX = parseInt(req.query.x as string);
//         const startY = parseInt(req.query.y as string);
//         console.log("startX:", startX, "type:", typeof startX, "isNaN:", isNaN(startX));
//         console.log("startY:", startY, "type:", typeof startY, "isNaN:", isNaN(startY));
//
//         const startPosition = (!isNaN(startX) && !isNaN(startY))
//             ? [startX, startY] as [number, number]
//             : undefined;
//
//         console.log("✅ Step 3: Start position determined:", startPosition || "[0,0] default");
//
//         console.log("✅ Step 4: Calling getFindPathService...");
//         const result = await getFindPathService(startPosition);
//
//         console.log("✅ Step 5: Service returned:", JSON.stringify(result, null, 2));
//
//         console.log("✅ Step 6: Sending response");
//         res.json(result);
//
//         console.log("✅ SUCCESS!");
//         console.log("==========================================\n");
//
//     } catch (error) {
//         console.error("\n❌❌❌ CRITICAL ERROR ❌❌❌");
//         console.error("Error name:", error.name);
//         console.error("Error message:", error.message);
//         console.error("Error stack:", error.stack);
//         console.error("==========================================\n");
//
//         res.status(500).json({
//             message: "Xảy ra lỗi ở controller",
//             data: false,
//             code: -1,
//             error: error.message,
//             stack: error.stack
//         });
//     }
// });

export default appRoute;