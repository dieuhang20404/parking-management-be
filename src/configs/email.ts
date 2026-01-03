import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.KEY_EMAIL
    },
});

export const sendEmail = async (html: string) => {
    try {
        const info = await transporter.sendMail({
            from: '"Parking" <hale071204@gmail.com>',
            to: "n22dccn123@student.ptithcm.edu.vn",
            subject: "Mã xác thực cho admin",
            html: html
        })
    } catch(e) {
        console.log(e);
        throw e;
    }
}