const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const jsPDF = require('jspdf');
const autoTable = require('jspdf-autotable');
const { JSDOM } = require('jsdom');

process.removeAllListeners('warning');

const grievanceRoutes = require('./routes/grievance');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection String
mongoose.connect('mongodb+srv://Monish:Monish21@cluster0.mtbgshr.mongodb.net/grievanceDB?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Nodemailer configuration using App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kmitcsm.akr21@gmail.com',
    pass: 'nncd bwgr mfrb zxgl' // App Password here
  }
});

// Function to generate PDF
async function generateGrievancePDF(grievances) {
  const dom = new JSDOM();
  global.window = dom.window;
  global.document = dom.window.document;

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Grievance Report', 14, 22);
  doc.setFontSize(12);
  doc.text('Timeline:', 14, 32);

  const grievanceData = grievances.map((grievance, index) => [
    index + 1,
    grievance.description,
    grievance.semester,
    new Date(grievance.createdAt).toLocaleDateString(),
  ]);

  autoTable(doc, {
    head: [['#', 'Description', 'Semester', 'Date']],
    body: grievanceData,
    startY: 40,
  });

  return doc.output('blob');
}

// Function to fetch grievances and send the PDF via email
async function sendGrievanceReport() {
  try {
    const grievances = await mongoose.connection.collection('grievances').find().toArray();
    const pdfData = await generateGrievancePDF(grievances);

    const mailOptions = {
      from: 'kmitcsm.akr21@gmail.com',
      to: ['monish21052004@gmail.com', 'getshaistha8@gmail.com','parugula.saicharan@gmail.com','harikakolli1648@gmail.com'],
      subject: 'Daily Grievance Report',
      text: 'This is an automated message. Dear Crs, Please find the attached grievance report for today.',
      attachments: [{
        filename: 'Grievance_Report.pdf',
        content: pdfData,
        contentType: 'application/pdf'
      }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  } catch (error) {
    console.error('Error generating or sending PDF:', error);
  }
}

// Schedule the task to run at 9:00 PM IST every day
cron.schedule('30 15 * * *', () => {
  console.log('Running scheduled email job at 14:56 IST');
  sendGrievanceReport();
}, {
  timezone: "Asia/Kolkata"
});

// Routes
app.use('/api/grievances', grievanceRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
