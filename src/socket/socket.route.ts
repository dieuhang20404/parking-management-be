import { Server, Socket } from "socket.io";
import * as controller from "./socket.controller";

const initSocketRoute = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        socket.on("testRequest", (data) => controller.testSocketController(io, socket, data));
    })
}

export default initSocketRoute;