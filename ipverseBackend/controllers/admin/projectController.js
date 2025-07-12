const Project = require('../../models/Project');
const Company = require('../../models/Company');
const { validationResult } = require('express-validator');
const { uploadImage, deleteImage } = require('../../config/cloudinary');

const projectSchema = require('../../models/Project'); // Import the schema to access enums

// Create New Project
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { companyId } = req.body;
    
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const existing = await Project.findOne({ companyId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This company already has a project'
      });
    }

    // Handle image uploads
    const images = [];
    if (req.body.images && Array.isArray(req.body.images)) {
      for (const image of req.body.images) {
        const imageUrl = await uploadImage(image, 'project-images');
        images.push(imageUrl);
      }
    }

    // Handle document uploads
    const documents = [];
    if (req.body.documents && Array.isArray(req.body.documents)) {
      for (const doc of req.body.documents) {
        const docUrl = await uploadImage(doc, 'project-documents');
        documents.push(docUrl);
      }
    }

    const projectData = {
      ...req.body,
      companyId,
      createdBy: req.admin._id,
      images,
      documents
    };

    const project = new Project(projectData);
    await project.save();

    // Update the company with the project ID
    await Company.findByIdAndUpdate(companyId, { project: project._id });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during project creation'
    });
  }
};

// Get All Projects (Admin view)
const getAllProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const projects = await Project.find(filter)
      .populate('createdBy', 'email')
      .populate('companyId', 'name industry logoUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProjects: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get Single Project
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'email')
      .populate('companyId', 'name industry description logoUrl contactEmail contactPhone');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { project }
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update Project
const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Handle new image uploads
    if (req.body.newImages && Array.isArray(req.body.newImages)) {
      const newImageUrls = [];
      for (const image of req.body.newImages) {
        const imageUrl = await uploadImage(image, 'project-images');
        newImageUrls.push(imageUrl);
      }
      project.images = [...(project.images || []), ...newImageUrls];
    }

    // Handle new document uploads
    if (req.body.newDocuments && Array.isArray(req.body.newDocuments)) {
      const newDocUrls = [];
      for (const doc of req.body.newDocuments) {
        const docUrl = await uploadImage(doc, 'project-documents');
        newDocUrls.push(docUrl);
      }
      project.documents = [...(project.documents || []), ...newDocUrls];
    }

    // Handle image deletions
    if (req.body.deleteImages && Array.isArray(req.body.deleteImages)) {
      for (const imageUrl of req.body.deleteImages) {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await deleteImage(publicId);
        project.images = project.images.filter(img => img !== imageUrl);
      }
    }

    // Handle document deletions
    if (req.body.deleteDocuments && Array.isArray(req.body.deleteDocuments)) {
      for (const docUrl of req.body.deleteDocuments) {
        const publicId = docUrl.split('/').pop().split('.')[0];
        await deleteImage(publicId);
        project.documents = project.documents.filter(doc => doc !== docUrl);
      }
    }

    // Update other project fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && 
          !['newImages', 'newDocuments', 'deleteImages', 'deleteDocuments'].includes(key)) {
        project[key] = req.body[key];
      }
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project }
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during project update'
    });
  }
};

// Delete Project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project can be deleted (no active investments)
    if (project.soldTokens > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete project with active investments'
      });
    }

    // Delete all associated images and documents
    for (const imageUrl of project.images || []) {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await deleteImage(publicId);
    }

    for (const docUrl of project.documents || []) {
      const publicId = docUrl.split('/').pop().split('.')[0];
      await deleteImage(publicId);
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during project deletion'
    });
  }
};

// Get Project Analytics
const getProjectAnalytics = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const fundedProjects = await Project.countDocuments({ status: 'funded' });
    
    const totalFunding = await Project.aggregate([
      { $group: { _id: null, total: { $sum: '$currentFunding' } } }
    ]);

    const categoryStats = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        fundedProjects,
        totalFunding: totalFunding[0]?.total || 0,
        categoryStats
      }
    });

  } catch (error) {
    console.error('Get project analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all unique categories fiind all category list 
const getAllCategories = async (req, res) => {
  try {
    const categories = await Project.distinct('category');
    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all unique risk levels
const getAllRiskLevels = async (req, res) => {
  try {
    const riskLevels = await Project.distinct('riskLevel');
    res.status(200).json({
      success: true,
      data: { riskLevels }
    });
  } catch (error) {
    console.error('Get risk levels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectAnalytics,
  getAllCategories,
  getAllRiskLevels
};