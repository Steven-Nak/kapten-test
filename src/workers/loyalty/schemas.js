'use strict';

const Joi = require('../../lib/joi');

const signupSchema = Joi.object({
  id: Joi.string().length(24).required(),
  name: Joi.string().min(6).required()
});

const rideCreatedSchema = Joi.object({
  id: Joi.objectId().required(),
  amount: Joi.number().min(0).required(),
  rider_id: Joi.objectId().required()
});

const rideCompletedSchema = Joi.object({
  // TODO add any validation you think necessary
  id: Joi.objectId().required(),
  amount: Joi.number().min(0).required(),
  rider_id: Joi.objectId().required(),
  created_at: Joi.string().optional()
}).unknown();

const rideCompletedWithPointsSchema = Joi.object({
  id: Joi.objectId().required(),
  amount: Joi.number().min(0).required(),
  rider_id: Joi.objectId().required(),
  used_points: Joi.number().min(0).required()
});

module.exports = {
  rideCreatedSchema,
  rideCompletedSchema,
  signupSchema,
  rideCompletedWithPointsSchema
};
