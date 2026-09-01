const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendEmail = (email, code) => {
    const mailOptions = {
        from: `"병원 관리자" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '이메일 인증번호',
        html: `<p>인증번호: <strong>${code}</strong></p>`
    };
    return transporter.sendMail(mailOptions);
}