const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Document = require('../models/Document');
const User = require('../models/User');
const Notification = require('../models/Notification');
const CompanyProfile = require('../models/CompanyProfile');
const { encryptText, decryptText } = require('../utils/documentCrypto');
const APP_NAME = process.env.APP_NAME || 'RavindraNexus';

const uploadsRoot = path.join(__dirname, '..', 'uploads');
const secureDocumentsRoot = path.join(__dirname, '..', 'uploads', 'documents');

const ensureDir = (targetPath) => {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
};

ensureDir(uploadsRoot);
ensureDir(secureDocumentsRoot);

const getSafeRelativeFileUrl = (fileUrl) => {
  const normalized = String(fileUrl || '').replace(/^\/+/, '').replace(/\//g, path.sep);
  return path.join(__dirname, '..', normalized);
};

const resolveEmployeeUserId = async (req, employeeIdFromBody) => {
  if (req.user.role === 'admin') {
    if (!employeeIdFromBody || !mongoose.Types.ObjectId.isValid(employeeIdFromBody)) {
      throw new Error('Valid employeeId is required');
    }

    const employeeUser = await User.findById(employeeIdFromBody).select('_id role email name');
    if (!employeeUser) {
      throw new Error('Employee user not found');
    }

    return employeeUser;
  }

  return req.user;
};

const canAccessEmployeeDocuments = (requestUser, employeeId) => (
  requestUser.role === 'admin' || String(requestUser._id) === String(employeeId)
);

const serializeDocument = (document, req) => {
  const record = typeof document.toObject === 'function' ? document.toObject() : document;
  return {
    _id: record._id,
    employeeId: record.employeeId,
    documentType: record.documentType,
    displayName: record.displayName,
    originalName: decryptText(record.originalNameEncrypted),
    uploadedBy: record.uploadedBy,
    uploadedByRole: record.uploadedByRole,
    mimeType: record.mimeType,
    fileSize: record.fileSize,
    status: record.status,
    createdAt: record.createdAt,
    previewUrl: `/api/documents/preview/${record._id}`,
    downloadUrl: `/api/documents/download/${record._id}`,
    canDelete: req.user.role === 'admin' || String(req.user._id) === String(record.employeeId)
  };
};

const buildOfferLetterHtml = ({
  employeeName,
  firstName,
  employeeRole,
  departmentName,
  formattedJoiningDate,
  formattedSalary,
  hrName,
  company
}) => {
  const compName = company?.name || 'RavindraNexus Technologies';
  const compEmail = company?.email || 'contact@ravindranexus.com';
  const compPhone = company?.phone || '+91 98765 43210';
  const compWebsite = company?.website || 'www.ravindranexus.com';
  const compAddress = company?.address || 'Corporate Office, India';
  const authName = company?.authorizedSignatoryName || hrName || 'Shivam Yadav';
  const authRole = company?.authorizedSignatoryRole || 'HR Manager';
  const themeColor = company?.themeColor || '#4f46e5';

  // Base64 Images
  const logoHtml = company?.logo 
    ? `<img src="${company.logo}" style="max-height: 48px; max-width: 180px; margin-bottom: 6px;" alt="Logo" />`
    : `<h1>${compName}</h1>`;

  const signHtml = company?.digitalSign
    ? `<div style="margin: 4px 0;"><img src="${company.digitalSign}" style="max-height: 40px; max-width: 140px;" alt="Signature" /></div>`
    : `<div style="height: 32px;"></div>`;

  const stampHtml = company?.stamp
    ? `<img src="${company.stamp}" style="max-height: 52px; max-width: 120px; position: absolute; bottom: 8px; left: 130px; opacity: 0.85;" alt="Stamp" />`
    : '';

  const sealHtml = company?.seal
    ? `<img src="${company.seal}" style="max-height: 52px; max-width: 120px; position: absolute; bottom: 8px; left: 240px; opacity: 0.85;" alt="Seal" />`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 14mm 14mm 16mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #1f2937;
      font-size: 10.4px;
      line-height: 1.34;
    }
    .page { min-height: 100%; position: relative; }
    .letterhead {
      border-bottom: 1.8px solid ${themeColor};
      padding-bottom: 10px;
      margin-bottom: 12px;
      text-align: center;
    }
    .letterhead h1 {
      margin: 0;
      font-size: 21px;
      letter-spacing: 0.7px;
      color: ${themeColor};
    }
    .letterhead p {
      margin: 3px 0 0;
      font-size: 10px;
      color: #475569;
    }
    .meta {
      display: table;
      width: 100%;
      margin-bottom: 12px;
      font-size: 10.2px;
    }
    .meta-row { display: table-row; }
    .meta-cell {
      display: table-cell;
      width: 50%;
      padding: 0 0 2px;
      vertical-align: top;
    }
    .meta-right { text-align: right; }
    .recipient { margin-bottom: 10px; }
    .recipient-name {
      font-size: 12.2px;
      font-weight: 700;
      color: #111827;
      margin: 3px 0 1px;
    }
    .subject {
      margin: 10px 0;
      padding: 7px 9px;
      border: 1px solid ${themeColor};
      background: ${themeColor};
      color: white;
      font-size: 10.4px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.55px;
      text-align: center;
    }
    p { margin: 0 0 7px; text-align: justify; }
    .section-title {
      margin: 10px 0 5px;
      font-size: 10.5px;
      font-weight: 700;
      color: ${themeColor};
      text-transform: uppercase;
      letter-spacing: 0.45px;
    }
    ul { margin: 0 0 8px; padding-left: 16px; }
    li { margin-bottom: 4px; padding-left: 1px; }
    .signature-wrap {
      margin-top: 12px;
      display: table;
      width: 100%;
      position: relative;
    }
    .signature-col {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      padding-right: 16px;
      position: relative;
    }
    .signature-col:last-child {
      padding-right: 0;
      padding-left: 12px;
    }
    .signature-label {
      font-weight: 700;
      margin-bottom: 8px;
    }
    .signature-line {
      margin-top: 16px;
      border-top: 1px solid #94a3b8;
      width: 88%;
    }
    .muted { color: #475569; }
  </style>
</head>
<body>
  <div class="page">
    <div class="letterhead">
      ${logoHtml}
      <p>${compAddress}</p>
      <p>${compEmail} | ${compPhone} | ${compWebsite}</p>
    </div>

    <div class="meta">
      <div class="meta-row">
        <div class="meta-cell"><strong>Ref No:</strong> ${compName.substring(0, 3).toUpperCase()}/OFFER/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}</div>
        <div class="meta-cell meta-right"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>

    <div class="recipient">
      <div><strong>To,</strong></div>
      <div class="recipient-name">${employeeName}</div>
      <div><strong>Department:</strong> ${departmentName}</div>
    </div>

    <div class="subject">Offer of Employment</div>

    <p>Dear <strong>${firstName}</strong>,</p>

    <p>We are pleased to offer you the position of <strong>${employeeRole}</strong> in the <strong>${departmentName}</strong> department at <strong>${compName}</strong>. Your date of joining will be <strong>${formattedJoiningDate}</strong>, subject to completion of joining formalities, submission of required documents, and verification as per company policy.</p>

    <p>Your annual gross compensation will be <strong>${formattedSalary}</strong>. The salary structure, statutory components, reimbursements, and other benefits applicable to your role will be administered in accordance with prevailing company policy and applicable law.</p>

    <div class="section-title">Key Terms of Employment</div>
    <ul>
      <li><strong>Working Hours:</strong> Your standard working hours will be <strong>10:00 AM to 5:00 PM</strong>, Monday through Saturday, or as otherwise communicated by management.</li>
      <li><strong>Probation and Confirmation:</strong> Your appointment will remain subject to satisfactory performance, conduct, and successful completion of the probation period, where applicable.</li>
      <li><strong>Notice Period:</strong> Either party may terminate employment by giving <strong>30 days</strong> written notice or salary in lieu thereof, subject to company approval and applicable policy.</li>
      <li><strong>Confidentiality:</strong> You will be required to maintain strict confidentiality of all company, client, employee, and business information during and after your employment.</li>
      <li><strong>Compliance:</strong> You are expected to follow all company rules, policies, reporting requirements, and lawful instructions issued by the organization from time to time.</li>
      <li><strong>Verification Requirement:</strong> This offer is contingent upon satisfactory verification of your academic, professional, identity, and other supporting documents.</li>
    </ul>

    <div class="section-title">General Conditions</div>
    <p>This letter, together with applicable company policies, forms the basis of your employment terms. By accepting this offer, you agree to discharge your duties diligently, uphold professional standards, and act in the best interests of the organization at all times.</p>

    <p>Kindly sign and return a copy of this letter as confirmation of your acceptance of the above terms and conditions.</p>

    <div class="signature-wrap">
      <div class="signature-col" style="min-height: 120px;">
        <div class="signature-label">For ${compName}</div>
        ${signHtml}
        <div><strong>${authName}</strong></div>
        <div class="muted">${authRole}</div>
        <div class="muted">Authorized Signatory</div>
        ${stampHtml}
        ${sealHtml}
        <div class="signature-line"></div>
      </div>
      <div class="signature-col">
        <div class="signature-label">Employee Acceptance</div>
        <div style="height: 44px;"></div>
        <div>Name: <strong>${employeeName}</strong></div>
        <div>Signature: ____________________</div>
        <div>Date: ____________________</div>
        <div class="signature-line"></div>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

const buildJoiningLetterHtml = ({
  employeeName,
  firstName,
  employeeRole,
  departmentName,
  formattedJoiningDate,
  formattedSalary,
  hrName,
  company
}) => {
  const compName = company?.name || 'RavindraNexus Technologies';
  const compEmail = company?.email || 'contact@ravindranexus.com';
  const compPhone = company?.phone || '+91 98765 43210';
  const compWebsite = company?.website || 'www.ravindranexus.com';
  const compAddress = company?.address || 'Corporate Office, India';
  const authName = company?.authorizedSignatoryName || hrName || 'Shivam Yadav';
  const authRole = company?.authorizedSignatoryRole || 'HR Manager';
  const themeColor = company?.themeColor || '#4f46e5';

  // Base64 Images
  const logoHtml = company?.logo 
    ? `<img src="${company.logo}" style="max-height: 48px; max-width: 180px; margin-bottom: 6px;" alt="Logo" />`
    : `<h1>${compName}</h1>`;

  const signHtml = company?.digitalSign
    ? `<div style="margin: 4px 0;"><img src="${company.digitalSign}" style="max-height: 40px; max-width: 140px;" alt="Signature" /></div>`
    : `<div style="height: 32px;"></div>`;

  const stampHtml = company?.stamp
    ? `<img src="${company.stamp}" style="max-height: 52px; max-width: 120px; position: absolute; bottom: 8px; left: 130px; opacity: 0.85;" alt="Stamp" />`
    : '';

  const sealHtml = company?.seal
    ? `<img src="${company.seal}" style="max-height: 52px; max-width: 120px; position: absolute; bottom: 8px; left: 240px; opacity: 0.85;" alt="Seal" />`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 14mm 14mm 16mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #1f2937;
      font-size: 10.4px;
      line-height: 1.34;
    }
    .page { min-height: 100%; position: relative; }
    .letterhead {
      border-bottom: 1.8px solid ${themeColor};
      padding-bottom: 10px;
      margin-bottom: 12px;
      text-align: center;
    }
    .letterhead h1 {
      margin: 0;
      font-size: 21px;
      letter-spacing: 0.7px;
      color: ${themeColor};
    }
    .letterhead p {
      margin: 3px 0 0;
      font-size: 10px;
      color: #475569;
    }
    .meta {
      display: table;
      width: 100%;
      margin-bottom: 12px;
      font-size: 10.2px;
    }
    .meta-row { display: table-row; }
    .meta-cell {
      display: table-cell;
      width: 50%;
      padding: 0 0 2px;
      vertical-align: top;
    }
    .meta-right { text-align: right; }
    .recipient { margin-bottom: 10px; }
    .recipient-name {
      font-size: 12.2px;
      font-weight: 700;
      color: #111827;
      margin: 3px 0 1px;
    }
    .subject {
      margin: 10px 0;
      padding: 7px 9px;
      border: 1px solid ${themeColor};
      background: ${themeColor};
      color: white;
      font-size: 10.4px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.55px;
      text-align: center;
    }
    p { margin: 0 0 7px; text-align: justify; }
    .section-title {
      margin: 10px 0 5px;
      font-size: 10.5px;
      font-weight: 700;
      color: ${themeColor};
      text-transform: uppercase;
      letter-spacing: 0.45px;
    }
    ul { margin: 0 0 8px; padding-left: 16px; }
    li { margin-bottom: 4px; padding-left: 1px; }
    .signature-wrap {
      margin-top: 12px;
      display: table;
      width: 100%;
      position: relative;
    }
    .signature-col {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      padding-right: 16px;
      position: relative;
    }
    .signature-col:last-child {
      padding-right: 0;
      padding-left: 12px;
    }
    .signature-label {
      font-weight: 700;
      margin-bottom: 8px;
    }
    .signature-line {
      margin-top: 16px;
      border-top: 1px solid #94a3b8;
      width: 88%;
    }
    .muted { color: #475569; }
  </style>
</head>
<body>
  <div class="page">
    <div class="letterhead">
      ${logoHtml}
      <p>${compAddress}</p>
      <p>${compEmail} | ${compPhone} | ${compWebsite}</p>
    </div>

    <div class="meta">
      <div class="meta-row">
        <div class="meta-cell"><strong>Ref No:</strong> ${compName.substring(0, 3).toUpperCase()}/JOINING/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}</div>
        <div class="meta-cell meta-right"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>

    <div class="recipient">
      <div><strong>To,</strong></div>
      <div class="recipient-name">${employeeName}</div>
      <div><strong>Department:</strong> ${departmentName}</div>
    </div>

    <div class="subject">Letter of Appointment / Joining confirmation</div>

    <p>Dear <strong>${firstName}</strong>,</p>

    <p>With reference to your acceptance of our offer of employment and subsequent joining formalities, we are extremely pleased to confirm your appointment as <strong>${employeeRole}</strong> in the <strong>${departmentName}</strong> department at <strong>${compName}</strong>, effective from your joining date of <strong>${formattedJoiningDate}</strong>.</p>

    <p>Your annual gross compensation is confirmed at <strong>${formattedSalary}</strong>. You will be on probation for a period of six months from your date of joining, which may be extended or shortened at the sole discretion of the management. Upon successful completion of your probation, your services will be confirmed in writing.</p>

    <div class="section-title">Standard Terms & Undertakings</div>
    <ul>
      <li><strong>Duties and Responsibilities:</strong> You shall perform all tasks assigned to your role diligently, follow administrative orders, and represent the organization in a professional manner.</li>
      <li><strong>Adherence to Policies:</strong> You agree to abide by the company's code of conduct, non-disclosure agreements, data security policies, and any other guidelines issued from time to time.</li>
      <li><strong>Exclusivity:</strong> During your employment with us, you will not engage in any other business activity, employment, or consulting role, whether part-time or full-time, without explicit written consent from the management.</li>
      <li><strong>Termination and Notice:</strong> Post probation, either party may terminate the employment contract by providing <strong>30 days</strong> prior written notice or basic salary in lieu thereof, subject to company policies.</li>
    </ul>

    <p>We welcome you to the <strong>${compName}</strong> family and look forward to a mutually successful, long, and rewarding career journey together. We are confident that your expertise and dedication will add great value to our teams.</p>

    <p>Please sign and return the duplicate copy of this appointment letter as a token of your acknowledgement and acceptance of these terms.</p>

    <div class="signature-wrap">
      <div class="signature-col" style="min-height: 120px;">
        <div class="signature-label">For ${compName}</div>
        ${signHtml}
        <div><strong>${authName}</strong></div>
        <div class="muted">${authRole}</div>
        <div class="muted">Authorized Signatory</div>
        ${stampHtml}
        ${sealHtml}
        <div class="signature-line"></div>
      </div>
      <div class="signature-col">
        <div class="signature-label">Employee Acceptance</div>
        <div style="height: 44px;"></div>
        <div>Name: <strong>${employeeName}</strong></div>
        <div>Signature: ____________________</div>
        <div>Date: ____________________</div>
        <div class="signature-line"></div>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

exports.generateOfferLetter = async (req, res) => {
  try {
    const { employeeId, joiningDate, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ success: false, message: 'Invalid employee id' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    let linkedUser = await User.findOne({ email: employee.email });
    if (!linkedUser) {
      const tempPassword = `TempPass@${Math.floor(100000 + Math.random() * 900000)}`;
      linkedUser = await User.create({
        name: employee.name || 'Employee',
        email: employee.email,
        password: tempPassword,
        role: 'employee',
        status: 'approved',
        isApproved: true,
        designation: employee.role || role || '',
        department: employee.department || ''
      });
      console.log(`[AUTO-USER] Created linked User account for ${employee.email} since none existed.`);
    }

    let company = await CompanyProfile.findOne();
    if (!company) {
      company = await CompanyProfile.create({});
    }

    const hrName = req.user?.name || '[HR Name]';
    const employeeRole = role || employee.role || '[Role]';
    const employeeName = employee.name || '[Employee Name]';
    const firstName = employee.name ? employee.name.split(' ')[0] : '[First Name]';
    const departmentName = employee.department || '[Department Name]';
    const formattedJoiningDate = joiningDate
      ? new Date(joiningDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : '[Joining Date]';
    const formattedSalary = employee.salary
      ? `Rs. ${employee.salary.toLocaleString('en-IN')} per annum`
      : '[Salary]';

    const htmlContent = buildOfferLetterHtml({
      employeeName,
      firstName,
      employeeRole,
      departmentName,
      formattedJoiningDate,
      formattedSalary,
      hrName,
      company
    });

    const fileName = `offer_${employee._id}_${Date.now()}.pdf`;
    const absolutePath = path.join(uploadsRoot, fileName);

    const launchOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    } else if (process.platform === 'win32') {
      const winPaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Users\\DELL\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
      ];
      for (const p of winPaths) {
        if (fs.existsSync(p)) {
          launchOptions.executablePath = p;
          break;
        }
      }
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({
      path: absolutePath,
      format: 'A4',
      margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
      printBackground: true
    });
    await browser.close();

    const fileBuffer = fs.readFileSync(absolutePath);
    const fileBase64 = fileBuffer.toString('base64');

    const document = await Document.create({
      employeeId: linkedUser._id,
      documentType: 'Offer Letter',
      displayName: 'Offer Letter',
      originalNameEncrypted: encryptText(`${employeeName}-Offer-Letter.pdf`),
      fileUrlEncrypted: encryptText(`/uploads/${fileName}`),
      mimeType: 'application/pdf',
      fileSize: fs.statSync(absolutePath).size,
      uploadedBy: req.user._id,
      uploadedByRole: req.user.role === 'admin' ? 'admin' : 'employee',
      status: 'Verified',
      fileData: fileBase64,
    });

    const notification = await Notification.create({
      recipient: linkedUser._id,
      message: 'Your offer letter has been generated and added to your Document Vault.',
      type: 'document',
      link: '/employee/documents'
    });

    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const userSocketId = userSockets?.get(String(linkedUser._id));
    if (userSocketId && io) {
      io.to(userSocketId).emit('newNotification', notification);
    }

    res.status(200).json({
      success: true,
      data: {
        ...serializeDocument(document, req),
        employeeEmail: linkedUser.email,
        employeeName,
      }
    });
  } catch (error) {
    console.error('generateOfferLetter error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateJoiningLetter = async (req, res) => {
  try {
    const { employeeId, joiningDate, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ success: false, message: 'Invalid employee id' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    let linkedUser = await User.findOne({ email: employee.email });
    if (!linkedUser) {
      const tempPassword = `TempPass@${Math.floor(100000 + Math.random() * 900000)}`;
      linkedUser = await User.create({
        name: employee.name || 'Employee',
        email: employee.email,
        password: tempPassword,
        role: 'employee',
        status: 'approved',
        isApproved: true,
        designation: employee.role || role || '',
        department: employee.department || ''
      });
      console.log(`[AUTO-USER] Created linked User account for ${employee.email} since none existed.`);
    }

    let company = await CompanyProfile.findOne();
    if (!company) {
      company = await CompanyProfile.create({});
    }

    const hrName = req.user?.name || '[HR Name]';
    const employeeRole = role || employee.role || '[Role]';
    const employeeName = employee.name || '[Employee Name]';
    const firstName = employee.name ? employee.name.split(' ')[0] : '[First Name]';
    const departmentName = employee.department || '[Department Name]';
    const formattedJoiningDate = joiningDate
      ? new Date(joiningDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : '[Joining Date]';
    const formattedSalary = employee.salary
      ? `Rs. ${employee.salary.toLocaleString('en-IN')} per annum`
      : '[Salary]';

    const htmlContent = buildJoiningLetterHtml({
      employeeName,
      firstName,
      employeeRole,
      departmentName,
      formattedJoiningDate,
      formattedSalary,
      hrName,
      company
    });

    const fileName = `joining_${employee._id}_${Date.now()}.pdf`;
    const absolutePath = path.join(uploadsRoot, fileName);

    const launchOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    } else if (process.platform === 'win32') {
      const winPaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Users\\DELL\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
      ];
      for (const p of winPaths) {
        if (fs.existsSync(p)) {
          launchOptions.executablePath = p;
          break;
        }
      }
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({
      path: absolutePath,
      format: 'A4',
      margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
      printBackground: true
    });
    await browser.close();

    const fileBuffer = fs.readFileSync(absolutePath);
    const fileBase64 = fileBuffer.toString('base64');

    const document = await Document.create({
      employeeId: linkedUser._id,
      documentType: 'Joining Letter',
      displayName: 'Joining Letter',
      originalNameEncrypted: encryptText(`${employeeName}-Joining-Letter.pdf`),
      fileUrlEncrypted: encryptText(`/uploads/${fileName}`),
      mimeType: 'application/pdf',
      fileSize: fs.statSync(absolutePath).size,
      uploadedBy: req.user._id,
      uploadedByRole: req.user.role === 'admin' ? 'admin' : 'employee',
      status: 'Verified',
      fileData: fileBase64,
    });

    const notification = await Notification.create({
      recipient: linkedUser._id,
      message: 'Your official joining letter has been generated and added to your Document Vault.',
      type: 'document',
      link: '/employee/documents'
    });

    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const userSocketId = userSockets?.get(String(linkedUser._id));
    if (userSocketId && io) {
      io.to(userSocketId).emit('newNotification', notification);
    }

    res.status(200).json({
      success: true,
      data: {
        ...serializeDocument(document, req),
        employeeEmail: linkedUser.email,
        employeeName,
      }
    });
  } catch (error) {
    console.error('generateJoiningLetter error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid PDF, JPG, or PNG file' });
    }

    const employeeUser = await resolveEmployeeUserId(req, req.body.employeeId);
    if (employeeUser.role !== 'employee' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only employee documents can be uploaded here' });
    }

    const documentType = req.body.documentType || req.body.type;
    if (!['Aadhaar', 'Resume', 'Certificate', 'Other', 'Offer Letter'].includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    const displayName = String(req.body.displayName || req.body.name || path.parse(req.file.originalname).name).trim();
    if (!displayName) {
      return res.status(400).json({ success: false, message: 'Document name is required' });
    }

    const relativeFileUrl = `/uploads/documents/${req.file.filename}`;
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileBase64 = fileBuffer.toString('base64');

    const document = await Document.create({
      employeeId: employeeUser._id,
      documentType,
      displayName,
      originalNameEncrypted: encryptText(req.file.originalname),
      fileUrlEncrypted: encryptText(relativeFileUrl),
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      uploadedByRole: req.user.role === 'admin' ? 'admin' : 'employee',
      status: req.user.role === 'admin' ? 'Verified' : 'Pending',
      fileData: fileBase64,
    });

    res.status(201).json({
      success: true,
      data: serializeDocument(document, req)
    });
  } catch (error) {
    console.error('uploadDocument error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ employeeId: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents.map((document) => serializeDocument(document, req))
    });
  } catch (error) {
    console.error('getMyDocuments error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getEmployeeDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ success: false, message: 'Invalid employee id' });
    }

    if (!canAccessEmployeeDocuments(req.user, employeeId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these documents' });
    }

    const documents = await Document.find({ employeeId }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents.map((document) => serializeDocument(document, req))
    });
  } catch (error) {
    console.error('getEmployeeDocuments error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid document id' });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (req.user.role !== 'admin' && String(req.user._id) !== String(document.employeeId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
    }

    const absolutePath = getSafeRelativeFileUrl(decryptText(document.fileUrlEncrypted));
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await document.deleteOne();
    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('deleteDocument error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const regenerateMissingOfferLetter = async (document, req) => {
  try {
    const linkedUser = await User.findById(document.employeeId);
    if (!linkedUser) {
      throw new Error('Linked user not found for this document');
    }

    const employee = await Employee.findOne({ email: linkedUser.email });
    if (!employee) {
      throw new Error('Employee record not found for this user email');
    }

    let company = await CompanyProfile.findOne();
    if (!company) {
      company = await CompanyProfile.create({});
    }

    const hrName = req.user?.name || 'Human Resources';
    const employeeRole = employee.role || 'Associate';
    const employeeName = employee.name || linkedUser.name || 'Employee';
    const firstName = employeeName.split(' ')[0];
    const departmentName = employee.department || 'Operations';
    
    const joiningDate = employee.createdAt || new Date();
    const formattedJoiningDate = new Date(joiningDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formattedSalary = employee.salary
      ? `Rs. ${employee.salary.toLocaleString('en-IN')} per annum`
      : 'Rs. 3,00,000 per annum';

    const isJoining = document.documentType === 'Joining Letter';
    const htmlContent = isJoining
      ? buildJoiningLetterHtml({
          employeeName,
          firstName,
          employeeRole,
          departmentName,
          formattedJoiningDate,
          formattedSalary,
          hrName,
          company
        })
      : buildOfferLetterHtml({
          employeeName,
          firstName,
          employeeRole,
          departmentName,
          formattedJoiningDate,
          formattedSalary,
          hrName,
          company
        });

    const fileName = isJoining
      ? `joining_${employee._id}_${Date.now()}.pdf`
      : `offer_${employee._id}_${Date.now()}.pdf`;
    const absolutePath = path.join(uploadsRoot, fileName);

    const launchOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    } else if (process.platform === 'win32') {
      const winPaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Users\\DELL\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
      ];
      for (const p of winPaths) {
        if (fs.existsSync(p)) {
          launchOptions.executablePath = p;
          break;
        }
      }
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({
      path: absolutePath,
      format: 'A4',
      margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
      printBackground: true
    });
    await browser.close();

    const fileBuffer = fs.readFileSync(absolutePath);
    const fileBase64 = fileBuffer.toString('base64');

    document.originalNameEncrypted = encryptText(
      isJoining ? `${employeeName}-Joining-Letter.pdf` : `${employeeName}-Offer-Letter.pdf`
    );
    document.fileUrlEncrypted = encryptText(`/uploads/${fileName}`);
    document.fileData = fileBase64;
    document.mimeType = 'application/pdf';
    document.fileSize = fileBuffer.length;
    await document.save();

    console.log(`[REGENERATE] ${document.documentType} regenerated successfully for document ${document._id}`);
    return fileBuffer;
  } catch (error) {
    console.error('[REGENERATE] Failed to regenerate document:', error);
    throw error;
  }
};

exports.previewDocument = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid document id' });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (req.user.role !== 'admin' && String(req.user._id) !== String(document.employeeId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to preview this document' });
    }

    res.setHeader('Content-Type', document.mimeType || 'application/pdf');

    if (document.fileData) {
      const fileBuffer = Buffer.from(document.fileData, 'base64');
      return res.send(fileBuffer);
    }

    let absolutePath = '';
    let fileExists = false;

    try {
      const decryptedUrl = decryptText(document.fileUrlEncrypted);
      if (decryptedUrl) {
        absolutePath = getSafeRelativeFileUrl(decryptedUrl);
        fileExists = fs.existsSync(absolutePath);
      }
    } catch (decryptErr) {
      console.warn('[PREVIEW] Decryption failed (key mismatch):', decryptErr.message);
    }

    if (fileExists) {
      return res.sendFile(absolutePath);
    }

    if (document.documentType === 'Offer Letter' || document.documentType === 'Joining Letter') {
      try {
        console.log(`[PREVIEW] Dynamic regeneration triggered for ${document.documentType}: ${document._id}`);
        const fileBuffer = await regenerateMissingOfferLetter(document, req);
        return res.send(fileBuffer);
      } catch (regenErr) {
        return res.status(500).json({ success: false, message: `Failed to dynamically regenerate ${document.documentType.toLowerCase()}` });
      }
    }

    return res.status(404).json({ success: false, message: 'File not found on server' });
  } catch (error) {
    console.error('previewDocument error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid document id' });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (req.user.role !== 'admin' && String(req.user._id) !== String(document.employeeId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this document' });
    }

    let originalName = 'Offer-Letter.pdf';
    try {
      originalName = decryptText(document.originalNameEncrypted);
    } catch (e) {}

    if (document.fileData) {
      const fileBuffer = Buffer.from(document.fileData, 'base64');
      res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
      res.setHeader('Content-Type', document.mimeType || 'application/pdf');
      return res.send(fileBuffer);
    }

    let absolutePath = '';
    let fileExists = false;

    try {
      const decryptedUrl = decryptText(document.fileUrlEncrypted);
      if (decryptedUrl) {
        absolutePath = getSafeRelativeFileUrl(decryptedUrl);
        fileExists = fs.existsSync(absolutePath);
      }
    } catch (decryptErr) {
      console.warn('[DOWNLOAD] Decryption failed (key mismatch):', decryptErr.message);
    }

    if (fileExists) {
      return res.download(absolutePath, originalName);
    }

    if (document.documentType === 'Offer Letter' || document.documentType === 'Joining Letter') {
      try {
        console.log(`[DOWNLOAD] Dynamic regeneration triggered for ${document.documentType}: ${document._id}`);
        const fileBuffer = await regenerateMissingOfferLetter(document, req);
        res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
        res.setHeader('Content-Type', 'application/pdf');
        return res.send(fileBuffer);
      } catch (regenErr) {
        return res.status(500).json({ success: false, message: `Failed to dynamically regenerate ${document.documentType.toLowerCase()}` });
      }
    }

    return res.status(404).json({ success: false, message: 'File not found on server' });
  } catch (error) {
    console.error('downloadDocument error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
