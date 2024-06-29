const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupId: Number,
    members: Number,
    gender: String
});

module.exports = mongoose.model('Group', groupSchema);