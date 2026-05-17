const CompanyProfile = require('../models/CompanyProfile');

// @desc    Get company profile
// @route   GET /api/company-profile
// @access  Private
exports.getCompanyProfile = async (req, res) => {
  try {
    let profile = await CompanyProfile.findOne();
    if (!profile) {
      profile = await CompanyProfile.create({});
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('getCompanyProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update company profile
// @route   PUT /api/company-profile
// @access  Private/Admin
exports.updateCompanyProfile = async (req, res) => {
  try {
    let profile = await CompanyProfile.findOne();
    if (!profile) {
      profile = new CompanyProfile();
    }

    const {
      name,
      email,
      phone,
      website,
      address,
      logo,
      stamp,
      seal,
      digitalSign,
      authorizedSignatoryName,
      authorizedSignatoryRole,
      themeColor
    } = req.body;

    if (name !== undefined) profile.name = name;
    if (email !== undefined) profile.email = email;
    if (phone !== undefined) profile.phone = phone;
    if (website !== undefined) profile.website = website;
    if (address !== undefined) profile.address = address;
    if (logo !== undefined) profile.logo = logo;
    if (stamp !== undefined) profile.stamp = stamp;
    if (seal !== undefined) profile.seal = seal;
    if (digitalSign !== undefined) profile.digitalSign = digitalSign;
    if (authorizedSignatoryName !== undefined) profile.authorizedSignatoryName = authorizedSignatoryName;
    if (authorizedSignatoryRole !== undefined) profile.authorizedSignatoryRole = authorizedSignatoryRole;
    if (themeColor !== undefined) profile.themeColor = themeColor;

    await profile.save();
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('updateCompanyProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
