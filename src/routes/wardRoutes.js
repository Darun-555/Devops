const express = require('express');
const wardController = require('../controllers/wardController');
const validateRequest = require('../middleware/validateRequest');
const requireRole = require('../middleware/requireRole');
const { createWardSchema } = require('../validators/wardValidators');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post(
  '/',
  requireRole('admin'),
  validateRequest(createWardSchema),
  asyncHandler(wardController.createWard)
);

router.get('/', asyncHandler(wardController.listWards));

module.exports = router;
