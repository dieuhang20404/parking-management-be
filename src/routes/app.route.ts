import express from "express";
import * as controller from "../controllers/app.controller";
import * as controllers from "../controllers/parkingFindingUser.controller"
import {getParkingInstruction} from "../controllers/parkingFindingUser.controller";

let appRoute = express.Router();

appRoute.get("/test-api", controller.testApiController);
//appRoute.post("/pathFinding", controller.getPathController);
appRoute.get("/pathFindUser", getParkingInstruction)



export default appRoute;