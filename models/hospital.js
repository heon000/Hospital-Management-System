const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: String,
    address: String,
    phone : String,
    approved: { type: Boolean, default: false },
});

module.exports = mongoose.model('Hospital', hospitalSchema);