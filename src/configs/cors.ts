import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import { Application } from "express";

dotenv.config();
export const expressCors = (app: Application) => {
    app.use(cors({
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        credentials: true
    }));
};

export const socketCors: CorsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
}