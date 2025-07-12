const express = require('express');
const router = express.Router();
const  verifyToken  = require('../../middleware/verifyToken');
const verifyAdmin = require('../../middleware/verifyAdmin');

const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompanyNamesAndIds
} = require('../../controllers/admin/companyController');

// Apply authentication middleware to all routes
router.use(verifyToken, verifyAdmin);

// Company routes
router.post('/createcompany', createCompany);
router.get('/listallcompany', getAllCompanies);
router.get('/names-and-ids', getCompanyNamesAndIds); // New route

router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

module.exports = router;