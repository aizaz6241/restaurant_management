const express = require('express');
const router = express.Router();
const {
  getSides,
  createSide,
  updateSide,
  deleteSide,
} = require('../controllers/sideController');

router.route('/').get(getSides).post(createSide);
router.route('/:id').put(updateSide).delete(deleteSide);

module.exports = router;
