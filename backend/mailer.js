const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    services: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(to, subject, body) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text: body
        });
        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error("Failed to send email: ", error);
    }
}

module.exports = sendEmail;