import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initSocket } from '../src/config/socket.js';
import dotenv from 'dotenv';
dotenv.config();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// khởi tạo socket
initSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
