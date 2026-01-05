import { prisma, ReturnData } from "../configs/interface";

export const testSocketService = (data: any) => {
    return "abcd";
}


// // Xử lý dữ liệu cảm biến từ esp32 qua socket
// export const handleSensorDataSocketService = (sensorData: Array<{position: number, status: number}>) => {
//     sensorData.forEach(async (sensor) => {
//         await prisma.parkingLot.update({
//             where: { id: sensor.position },
//             data: { status: sensor.status }
//         });
//     });
//     return { message: "Nhận dữ liệu cảm biến qua socket thành công", data: sensorData };
// }

// // Xử lý dữ liệu hình ảnh từ esp32 qua socket
// export const handleImageSocketService = (imageData: any) => {
//     // Gửi lệnh yêu cầu ESP32 gửi hình ảnh qua socket (nếu có)
//     // Lưu vào DB hoặc cloud nếu cần
//     // await prisma.ticket.update({ where: { id: imageData.ticketId }, data: { imageIn: imageData.imageBase64 } });
//     return { message: "Nhận dữ liệu hình ảnh qua socket thành công", data: imageData };
// }

// // Gửi tín hiệu điều khiển servo cho esp32 qua socket
// export const sendServoSignalSocketService = (signal: string) => {
//     // signal là số nguyên góc xoay
//     const angle = parseInt(signal);
//     if (isNaN(angle)) {
//         return { message: "Góc servo không hợp lệ", data: false };
//     }
    
//     const cmd = `SERVO:${angle}`;
//     return { message: "Gửi tín hiệu servo qua socket thành công", data: { angle } };
// }