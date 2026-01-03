import { Server } from "socket.io";

let io: Server;

export const setSocketIO = (server: Server) => {
    io = server;
}

export const getSocketIO = (): Server => {
    return io;
}