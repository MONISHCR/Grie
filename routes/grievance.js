const express = require('express');
const Grievance = require('../models/Grievance');
const router = express.Router();

// Submit a grievance
router.post('/', (req, res) => {
  const { description, semester, file } = req.body;

  const newGrievance = new Grievance({
    description,
    semester,
    file,
  });

  newGrievance.save().then(grievance => res.json(grievance));
});

module.exports = router;
