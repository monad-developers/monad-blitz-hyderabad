const Project = require('../../models/Project');

// Get All Active Projects
const getAllActiveProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter - show all projects except cancelled ones
    const filter = { status: { $ne: 'cancelled' } };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.ipType) {
      filter.ipType = req.query.ipType;
    }
    
    if (req.query.riskLevel) {
      filter.riskLevel = req.query.riskLevel;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.tokenPrice = {};
      if (req.query.minPrice) filter.tokenPrice.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.tokenPrice.$lte = parseFloat(req.query.maxPrice);
    }

    // Build sort options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'price_low':
          sortOptions = { tokenPrice: 1 };
          break;
        case 'price_high':
          sortOptions = { tokenPrice: -1 };
          break;
        case 'funding_high':
          sortOptions = { currentFunding: -1 };
          break;
        case 'ending_soon':
          sortOptions = { endDate: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    }

    const projects = await Project.find(filter)
      .select('-documents') // Exclude sensitive documents from public view
      .sort(sortOptions)
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
    console.error('Get all active projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get Single Project Details
const getProjectDetails = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      status: { $ne: 'cancelled' }
    }).select('-documents'); // Exclude sensitive documents

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or not available'
      });
    }

    res.status(200).json({
      success: true,
      data: { project }
    });

  } catch (error) {
    console.error('Get project details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Search Projects
const searchProjects = async (req, res) => {
  try {
    const { q: searchQuery } = req.query;
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = {
      status: { $ne: 'cancelled' },
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
        { ipType: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    const projects = await Project.find(searchFilter)
      .select('-documents')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(searchFilter);

    res.status(200).json({
      success: true,
      data: {
        projects,
        searchQuery,
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
    console.error('Search projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during search'
    });
  }
};

// Get Featured Projects
const getFeaturedProjects = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    // Get projects with high funding or recent activity
    const projects = await Project.find({
      status: { $ne: 'cancelled' },
      currentFunding: { $gt: 0 }
    })
      .select('-documents')
      .sort({ currentFunding: -1, createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: { projects }
    });

  } catch (error) {
    console.error('Get featured projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get Project Categories
const getProjectCategories = async (req, res) => {
  try {
    const categories = await Project.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const ipTypes = await Project.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$ipType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories,
        ipTypes
      }
    });

  } catch (error) {
    console.error('Get project categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllActiveProjects,
  getProjectDetails,
  searchProjects,
  getFeaturedProjects,
  getProjectCategories
};