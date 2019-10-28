'use strict';

const Joi = require('../../lib/joi');

const getLoyaltyInfoSchema = Joi.object().keys({
  rider_id: Joi.objectId().required()
});

const getLoyaltyStatusSchema = Joi.object().keys({
  id: Joi.objectId().required()
});

module.exports = {
  getLoyaltyInfoSchema,
  getLoyaltyStatusSchema
};
