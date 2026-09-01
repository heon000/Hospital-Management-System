const { sendSMS } = require('../utils/twilio');

exports.sendTestSMS = async (req, res) => {
  const to = req.body.to;
  const message = req.body.message;

  try {
    const result = await sendSMS(to, message);
    res.status(200).json({ success: true, sid: result.sid });
  } catch (err) {
    console.error('SMS 발송 실패:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
