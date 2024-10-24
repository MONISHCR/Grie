const express = require('express');
const Grievance = require('../models/Grievance');
const router = express.Router();

// Submit a grievance
router.post('/', (req, res) => {
  const { description, semester, branch, file } = req.body;

  // Check if branch is valid
  const allowedBranches = ['CSM', 'CSD', 'IT', 'CSE'];
  if (!allowedBranches.includes(branch)) {
    return res.status(400).json({ error: 'Invalid branch selected' });
  }

  const newGrievance = new Grievance({
    description,
    semester,
    branch,
    file,
  });

  newGrievance
    .save()
    .then(grievance => res.json(grievance))
    .catch(err => res.status(500).json({ error: 'Failed to submit grievance', details: err }));
});

module.exports = router;
