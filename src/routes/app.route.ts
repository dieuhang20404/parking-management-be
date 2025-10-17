import express from "express";
import * as controller from "../controllers/app.controller";

let appRoute = express.Router();

appRoute.get("/test-api", controller.testApiController);

export default appRoute;