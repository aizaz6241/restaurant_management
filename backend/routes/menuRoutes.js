const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/').get(getMenuItems).post(protectAdmin, createMenuItem);
router.route('/:id').put(protectAdmin, updateMenuItem).delete(protectAdmin, deleteMenuItem);

module.exports = router;
