const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  'Group ID': Number,
  'Members': Number,
  'Gender': String
});

module.exports = mongoose.model('Group', GroupSchema);
