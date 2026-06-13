const express = require('express');
const router = express.Router();
const {
  getSides,
  createSide,
  updateSide,
  deleteSide,
} = require('../controllers/sideController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/').get(getSides).post(protectAdmin, createSide);
router.route('/:id').put(protectAdmin, updateSide).delete(protectAdmin, deleteSide);

module.exports = router;
