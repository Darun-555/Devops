const Joi = require('joi');

const createWardSchema = Joi.object({
  wardName: Joi.string().min(2).max(100).required(),
  department: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('general', 'ICU', 'CCU').default('general'),
  totalBeds: Joi.number().integer().min(1).required(),
  availableBeds: Joi.number().integer().min(0).optional()
});

module.exports = {
  createWardSchema
};
