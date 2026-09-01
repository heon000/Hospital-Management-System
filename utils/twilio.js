const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

function sendSMS(to, message) {
  to = String(to).trim();
  console.log('문자 전송됨');
  console.log(to);
  client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    })
    .then(message =>{
      console.log('전송된 메시지:', message.sid);
    })
    .catch(error => {
      console.error('SMS 전송 오류:', error);
    });
  }

module.exports = { sendSMS };