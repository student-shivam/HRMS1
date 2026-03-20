const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

// @desc    Generate Offer Letter PDF
// @route   POST /api/documents/generate-offer
// @access  Private (Admin only)
exports.generateOfferLetter = async (req, res) => {
  try {
    const { employeeId, joiningDate, role } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    // HTML Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { width: 80%; margin: 0 auto; padding: 40px; border: 1px solid #ccc; margin-top: 50px; }
          .header { text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #4F46E5; margin: 0; }
          .content { margin-bottom: 40px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Dynamic HRMS</h1>
            <p>Official Offer of Employment</p>
          </div>
          
          <div class="content">
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Dear <strong>${employee.name}</strong>,</p>
            
            <p>We are thrilled to offer you the position of <strong>${role || employee.department + ' Specialist'}</strong> at Dynamic HRMS.</p>
            
            <p>Based on your experience and interviews, we are pleased to offer you an annual base salary of <strong>$${employee.salary.toLocaleString()}</strong>.</p>
            
            <p>Your expected joining date will be <strong>${new Date(joiningDate || Date.now()).toLocaleDateString()}</strong>.</p>
            
            <p>We believe your skills will be highly valuable to our team, and we look forward to welcoming you.</p>
            
            <p>Sincerely,</p>
            <p>Human Resources Director<br/>Dynamic HRMS</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const fileName = `offer_letter_${employee._id}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({ path: filePath, format: 'A4', printBackground: true });
    await browser.close();

    // Prepare Document object
    const fileUrl = `/uploads/${fileName}`;
    
    // Attempt to parse out user account ID to notify them directly if linked
    const User = require('../models/User');
    const linkedUser = await User.findOne({ email: employee.email });
    
    const newDoc = {
      name: 'Offer Letter',
      type: 'Offer Letter',
      url: fileUrl
    };

    employee.documents.push(newDoc);
    await employee.save();

    // Notify user if possible
    if (linkedUser) {
      const notification = await Notification.create({
        recipient: linkedUser._id,
        message: `A new document (Offer Letter) has been generated for you.`,
        type: 'document',
        link: fileUrl
      });

      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      const userSocketId = userSockets.get(linkedUser._id.toString());
      if (userSocketId) {
        io.to(userSocketId).emit('newNotification', notification);
      }
    }

    res.status(200).json({
      success: true,
      data: newDoc
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to generate Offer Letter' });
  }
};

// @desc    Download Document
// @route   GET /api/documents/download/:employeeId/:documentId
// @access  Private
exports.downloadDocument = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    
    const doc = employee.documents.id(req.params.documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const filePath = path.join(__dirname, '..', doc.url);
    if (fs.existsSync(filePath)) {
      res.download(filePath, doc.name + '.pdf');
    } else {
      res.status(404).json({ error: 'File not found on server' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};
