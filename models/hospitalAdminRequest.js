const mongoose = require('mongoose');

const hospitalAdminRequestSchema = new mongoose.Schema({
  email: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
});

module.exports = mongoose.model('HospitalAdminRequest', hospitalAdminRequestSchema);