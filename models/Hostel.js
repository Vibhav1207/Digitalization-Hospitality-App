const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
    hostelName: String,
    roomNumber: String,
    capacity: String,
    gender: String
});

module.exports = mongoose.model('Hostek', hostelSchema);