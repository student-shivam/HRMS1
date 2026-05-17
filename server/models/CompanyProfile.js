const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  name: { type: String, default: 'RavindraNexus Technologies' },
  email: { type: String, default: 'contact@ravindranexus.com' },
  phone: { type: String, default: '+91 98765 43210' },
  website: { type: String, default: 'www.ravindranexus.com' },
  address: { type: String, default: '123 Enterprise Way, Tech Park, Noida, UP, India' },
  logo: { type: String, default: '' },        // Base64 Data URI
  stamp: { type: String, default: '' },       // Base64 Data URI
  seal: { type: String, default: '' },        // Base64 Data URI
  digitalSign: { type: String, default: '' }, // Base64 Data URI
  authorizedSignatoryName: { type: String, default: 'Shivam Yadav' },
  authorizedSignatoryRole: { type: String, default: 'HR Manager' },
  themeColor: { type: String, default: '#4f46e5' }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
