const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HostelSchema = new Schema({
  'Hostel Name': String,
  'Room Number': Number,
  'Capacity': Number,
  'Gender': String
});

module.exports = mongoose.model('Hostel', HostelSchema);
