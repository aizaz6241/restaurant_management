const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');

router.route('/').get(getMenuItems).post(createMenuItem);
router.route('/:id').put(updateMenuItem).delete(deleteMenuItem);

module.exports = router;
