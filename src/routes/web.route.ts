import { Application } from "express";
import appRoute from "./app.route";

const initWebRoute = (app: Application) => {
    app.use("/", appRoute);
}

export default initWebRoute;