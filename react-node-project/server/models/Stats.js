const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  users: {
    type: Number,
    default: 0
  },
  tasks: {
    type: Number,
    default: 0
  },
  projects: {
    type: Number,
    default: 0
  },
  messages: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Stats', statsSchema); 