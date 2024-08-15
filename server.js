const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { jsPDF } = require('jspdf');
require('jspdf-autotable'); // Importing jspdf-autotable
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
  // JSDOM to emulate a browser environment
  const dom = new JSDOM();
  global.window = dom.window;
  global.document = dom.window.document;

  // Initialize jsPDF
  const doc = new jsPDF();

  // Set PDF title and subtitle
  doc.setFontSize(18);
  doc.text('Grievance Report', 14, 22);
  doc.setFontSize(12);
  doc.text('Timeline:', 14, 32);

  // Map grievance data for autoTable
  const grievanceData = grievances.map((grievance, index) => [
    index + 1,
    grievance.description,
    grievance.semester,
    new Date(grievance.createdAt).toLocaleDateString(),
  ]);

  // Generate autoTable
  doc.autoTable({
    head: [['#', 'Description', 'Semester', 'Date']],
    body: grievanceData,
    startY: 40,
  });

  // Output the PDF as an ArrayBuffer
  return Buffer.from(doc.output('arraybuffer'));
}

// Optional: Function to get the last email sent date (stored in DB or file)
async function getLastEmailDate() {
  // This function should return the last date an email was sent
  // Implement according to your storage method (DB, file, etc.)
  // Example: return new Date('2024-01-01');
  return new Date(0); // Start from epoch if not stored yet
}

// Optional: Function to update the last email sent date (stored in DB or file)
async function updateLastEmailDate(date) {
  // This function should update the last date an email was sent
  // Implement according to your storage method (DB, file, etc.)
  // Example: Save the date in a file or DB
}

// Function to fetch grievances and send the PDF via email
async function sendGrievanceReport() {
  try {
    // Get the current date
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB');

    // Get the last email date
    const lastEmailDate = await getLastEmailDate();

    // Fetch grievances from the database created after the last email date
    const grievances = await mongoose.connection.collection('grievances')
      .find({ createdAt: { $gt: lastEmailDate } })
      .toArray();

    // Check if there are any new grievances
    if (grievances.length > 0) {
      // Generate PDF from grievances
      const pdfData = await generateGrievancePDF(grievances);

      // Prepare email options with PDF attachment
      const mailOptions = {
        from: 'kmitcsm.akr21@gmail.com',
        to: ['monish21052004@gmail.com','21bd1a6761csd@gmail.com', 'getshaistha8@gmail.com','parugula.saicharan@gmail.com','harikakolli1648@gmail.com'],
        subject: 'Daily Grievance Report',
        text: `This is an automated message.\nDear Crs, Please find the attached grievance report for today (${formattedDate}).\n Thank You \n Regards \n Assist-Cell(CSM-A)`,
        attachments: [{
          filename: 'Grievance_Report.pdf',
          content: pdfData,
          contentType: 'application/pdf'
        }]
      };

      // Send the email with the PDF
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
          // Update the last email date
          updateLastEmailDate(currentDate);
        }
      });
    } else {
      // Prepare email options with text only
      const mailOptions = {
        from: 'kmitcsm.akr21@gmail.com',
        to: ['monish21052004@gmail.com','21bd1a6761csd@gmail.com', 'getshaistha8@gmail.com','parugula.saicharan@gmail.com','harikakolli1648@gmail.com'],
        subject: 'Daily Grievance Report',
        text: `This is an automated message.\nDear Crs, No new grievances were reported today (${formattedDate}).`,
      };

      // Send the email without the PDF
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }
  } catch (error) {
    console.error('Error generating or sending PDF:', error);
  }
}

// Schedule the task to run at 22:19 IST every day
cron.schedule('53 22 * * *', () => {
  console.log('Running scheduled email job at 22:19 IST');
  sendGrievanceReport();
});

// Routes
app.use('/api/grievances', grievanceRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
