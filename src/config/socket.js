import { Server } from "socket.io";

let ioInstance = null;

export function initSocket(server) {
  ioInstance = new Server(server, {
    cors: { origin: "*" },
  });

  ioInstance.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);
  });
}

export { ioInstance };
