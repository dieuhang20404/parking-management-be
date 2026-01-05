import dotenv from "dotenv";
import WebSocket from "ws";
import { uploadBufferToCloudinary } from "./cloudinary";

dotenv.config();
let ws: WebSocket | null = null;
const espIp = process.env.ESP32_IP || "127.0.0.1";
const espPort = Number(process.env.ESP32_PORT) || 5000;

export const connectToEsp32 = () => {
    ws = new WebSocket(`ws://${espIp}:${espPort}`)

    ws.on("open", () => {
        console.log("Connected to ESP32");
    })

    ws.on("close", () => {
        console.log("ESP32 disconnected");
        ws = null;
    });

    ws.on("error", (err) => {
        console.error("WebSocket error:", err);
    });
}

export const captureImage = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            return reject(new Error("ESP32 not connected"));
        }

        const onMessage = async (data: WebSocket.RawData) => {
            if (!Buffer.isBuffer(data)) {
                return;
            }

            try {
                ws?.off("message", onMessage);

                // Tải ảnh lên cloudinary
                const result: any = await uploadBufferToCloudinary(data);

                resolve(result.url);
            } catch (err) {
                reject(err);
            }
        };

        ws.on("message", onMessage);
        
        ws.send("capture");
    });
};

export const openServo = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            return reject(new Error("ESP32 not connected"));
        }

        const onMessage = async (data: WebSocket.RawData) => {
            const msg = data.toString();

            if (msg === "SERVO_OK") {
                ws?.off("message", onMessage);
                resolve("Servo opened");
            }

            if (msg === "SERVO_ERR") {
                ws?.off("message", onMessage);
                reject(new Error("Servo error"));
            }
        };

        ws.on("message", onMessage);
        
        ws.send("servo");
    });
};