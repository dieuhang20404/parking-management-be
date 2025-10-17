import { Server, Socket } from "socket.io";
import * as service from "./socker.service";

export const testSocketController = (io: Server, socket: Socket, data: any) => {
    const returnValue = service.testSocketService(data);
    socket.emit("testResponse", returnValue);
}