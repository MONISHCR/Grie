const mongoose = require('mongoose');

// Allowed branches
const allowedBranches = ['CSM', 'CSD', 'IT', 'CSE'];

const GrievanceSchema = new mongoose.Schema({
  description: { type: String, required: true },
  semester: { type: String, required: true },
  branch: { 
    type: String, 
    required: true, 
    enum: allowedBranches // Ensures only valid branches are allowed
  },
  file: { type: String }, // File path or URL
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Grievance', GrievanceSchema);
