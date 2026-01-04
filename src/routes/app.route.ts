import express from "express";
import * as controller from "../controllers/app.controller";
import * as controllers from "../controllers/path.controller"

let appRoute = express.Router();

appRoute.get("/test-api", controller.testApiController);
//appRoute.post("/pathFinding", controller.getPathController);
appRoute.post("/find-path", controllers.getPathController);
appRoute.get("/sensors", controllers.getRandomSensorController);



export default appRoute;