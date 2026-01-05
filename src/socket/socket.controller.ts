import { Server, Socket } from "socket.io";
import * as service from "./socket.service";

export const testSocketController = (io: Server, socket: Socket, data: any) => {
    const returnValue = service.testSocketService(data);
    socket.emit("testResponse", returnValue);
}

// // Nhận dữ liệu cảm biến từ esp32 qua socket
// export const sensorDataSocketController = (io: Server, socket: Socket, data: any) => {
//     const result = service.handleSensorDataSocketService(data);
//     socket.emit("sensorDataResponse", result);
// }

// // Nhận dữ liệu hình ảnh từ esp32 qua socket
// export const imageSocketController = (io: Server, socket: Socket, data: any) => {
//     const result = service.handleImageSocketService(data);
//     socket.emit("imageResponse", result);
// }

// // Gửi tín hiệu điều khiển servo cho esp32 qua socket
// export const servoSignalSocketController = (io: Server, socket: Socket, data: any) => {
//     const result = service.sendServoSignalSocketService(data);
//     socket.emit("servoSignalResponse", result);
// }