const cron = require('node-cron');
const Reservation = require('../models/reservation');
const { sendSMS } = require('./smsSender');
const SmsLog = require('../models/smsLog');

// 매일 오전 9시에 실행
cron.schedule('0 9 * * *', async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const targetDate = tomorrow.toISOString().slice(0, 10); // yyyy-mm-dd

  try {
    const reservations = await Reservation.find({
      status: '승인',
      reservedTime: { $regex: `^${targetDate}` }
    });

    for (const res of reservations) {
      const msg = `[안내] ${res.patientName}님, 예약하신 진료가 내일입니다. 병원에 방문해주세요.`;
      const result = await sendSMS(res.phoneNumber, msg);

      await new SmsLog({
        to: res.phoneNumber,
        message: msg,
        status: result.success ? 'sent' : 'failed',
        sid: result.sid || null,
        error: result.error || null
      }).save();
    }

    console.log(`[cron] ${reservations.length}건 문자 발송 시도 완료`);
  } catch (err) {
    console.error('[cron] 예약 전날 문자 발송 오류:', err);
  }
});