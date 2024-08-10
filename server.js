const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const grievanceRoutes = require('./routes/grievance');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection String
mongoose.connect('mongodb+srv://Monish:Monish21@cluster0.mtbgshr.mongodb.net/grievanceDB?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Routes
app.use('/api/grievances', grievanceRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
