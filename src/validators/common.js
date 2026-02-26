const Joi = require('joi');

const objectId = Joi.string().length(24).hex();

module.exports = {
  objectId
};
