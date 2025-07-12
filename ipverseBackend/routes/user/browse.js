const express = require('express');
const {
  getAllActiveProjects,
  getProjectDetails,
  searchProjects,
  getFeaturedProjects,
  getProjectCategories
} = require('../../controllers/user/browseController');

const router = express.Router();

// Routes
// GET /api/user/browse/projects
router.get('/projects', getAllActiveProjects);

// GET /api/user/browse/projects/featured
router.get('/projects/featured', getFeaturedProjects);

// GET /api/user/browse/projects/search
router.get('/projects/search', searchProjects);

// GET /api/user/browse/categories
router.get('/categories', getProjectCategories);

// GET /api/user/browse/projects/:id
router.get('/projects/:id', getProjectDetails);

module.exports = router;