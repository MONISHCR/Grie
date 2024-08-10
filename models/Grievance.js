const mongoose = require('mongoose');

const GrievanceSchema = new mongoose.Schema({
  description: { type: String, required: true },
  semester: { type: String, required: true },
  file: { type: String }, // File path or URL
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Grievance', GrievanceSchema);
