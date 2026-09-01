const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema({
  to: String,
  message: String,
  status: String,    // 'sent', 'failed'
  sid: String,
  error: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SmsLog', smsLogSchema);