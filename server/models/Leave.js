const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fromDate: {
    type: Date,
    required: [true, 'Please add a from date'],
  },
  toDate: {
    type: Date,
    required: [true, 'Please add a to date'],
  },
  reason: {
    type: String,
    required: [true, 'Please add a reason for leave'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Leave', leaveSchema);
