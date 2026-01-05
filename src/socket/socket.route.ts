import { Server, Socket } from "socket.io";
import * as controller from "./socket.controller";

const initSocketRoute = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        socket.on("testRequest", (data) => controller.testSocketController(io, socket, data));
        
        // // Nhận dữ liệu cảm biến từ esp32
        // socket.on("sensorData", (data) => controller.sensorDataSocketController(io, socket, data));
        // // Nhận dữ liệu hình ảnh từ esp32
        // socket.on("imageData", (data) => controller.imageSocketController(io, socket, data));
        // // Gửi tín hiệu điều khiển servo cho esp32
        // socket.on("servoSignal", (data) => controller.servoSignalSocketController(io, socket, data));
    })
}

export default initSocketRoute;