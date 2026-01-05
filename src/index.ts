import dotenv from "dotenv";
import express, { Application } from "express";
import { expressCors, socketCors } from "./configs/cors";
import initWebRoute from "./routes/web.route";
import { Server } from "socket.io";
import http from "http";
import initSocketRoute from "./socket/socket.route";
import { setSocketIO } from "./configs/socket";
import { connectToEsp32 } from "./configs/esp32";

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const app: Application = express();
const server: http.Server = http.createServer(app);
const io: Server = new Server(server, {cors: socketCors});
setSocketIO(io);

expressCors(app);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

initWebRoute(app);
initSocketRoute(io);

connectToEsp32();

server.listen(port, () => {
    console.log("Backend is running on the port: " + port);
})