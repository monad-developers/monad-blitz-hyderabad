const Company = require('../../models/Company');
const Project = require('../../models/Project');

// Create a new company
exports.createCompany = async (req, res) => {
  try {
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(7);
    const registrationNumber = `REG-${timestamp}-${randomStr}`;

 
    const companyData = {
      ...req.body,
      createdBy: req.admin._id,
      registrationNumber,
      // project is not set here, will be updated later
    };
    const company = new Company(companyData);
    console.log(companyData,"company data is hgere");
    await company.save();
    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate('project');
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('project');
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update company
exports.updateCompany = async (req, res) => {
  try {
    let company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }


    company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete company
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Delete associated project if exists
    if (company.project) {
      await Project.findByIdAndDelete(company.project);
    }

    await company.remove();
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// New method to get all company names and IDs
exports.getCompanyNamesAndIds = async (req, res) => {
  try {
    const companies = await Company.find({}, 'name _id'); // Select only name and _id
    const companyList = companies.map(company => ({
      id: company._id,
      name: company.name
    }));
    res.status(200).json({
      success: true,
      count: companyList.length,
      data: companyList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};