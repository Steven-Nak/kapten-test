'use strict';

const HttpStatus = require('http-status-codes');

const Joi = require('../../lib/joi');
const ridersLib = require('../../lib/riders');

const { getLoyaltyInfoSchema, getLoyaltyStatusSchema } = require('./schemas');

const { RIDER_NOT_FOUND } = ridersLib;

/**
 * Get current rider status
 *
 * @param {Object} req express request
 * @param {Object} res express response
 *
 * @returns {Object} response
 */
async function getLoyaltyInfo(req, res) {
  const { error, value: validatedParams } = Joi
    .validate(req.params, getLoyaltyInfoSchema);

  if (error) {
    req.logger.info({ error }, '[loyalty#getLoyaltyInfo] Error: invalid body');
    return res.sendStatus(HttpStatus.BAD_REQUEST);
  }

  const { rider_id: riderId } = validatedParams;
  req.logger.info(
    { rider_id: riderId },
    '[loyalty#getLoyaltyInfo] Rider info requested');

  let rider;
  try {
    rider = await ridersLib.getLoyaltyInfo(riderId);
  } catch (err) {
    if (err.message === RIDER_NOT_FOUND.message) {
      req.logger.info(
        { rider_id: riderId },
        '[loyalty#getLoyaltyInfo] User does not exist');
      return res.sendStatus(HttpStatus.NOT_FOUND);
    }
    req.logger.info(
      { rider_id: riderId, err },
      '[loyalty#getLoyaltyInfo] Error while fetching user\'s loyalty info');
    return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  return res.send(rider);
}

/**
 * Get current loyalty status
 *
 * @param {Object} req express request
 * @param {Object} res express response
 *
 * @returns {Object} response
 */
async function getLoyaltyStatus(req, res) {
  const { error, value: validatedParams } = Joi
    .validate(req.params, getLoyaltyStatusSchema);

  if (error) {
    req.logger.info({ error }, '[loyalty#getLoyaltyStatus] Error: invalid body');
    return res.sendStatus(HttpStatus.BAD_REQUEST);
  }
  const { id: riderId } = validatedParams;
  req.logger.info(
    { id: riderId },
    '[loyalty#getLoyaltyStatus] Rider info requested');

  let rider;
  try {
    rider = await ridersLib.getLoyaltyStatus(riderId);
  } catch (err) {
    if (err.message === RIDER_NOT_FOUND.message) {
      req.logger.info(
        { id: riderId },
        '[loyalty#getLoyaltyStatus] User does not exist');
      return res.sendStatus(HttpStatus.NOT_FOUND);
    }
    req.logger.info(
      { id: riderId, err },
      '[loyalty#getLoyaltyStatus] Error while fetching user\'s loyalty status');
    return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  return res.send(rider);
}

module.exports = {
  getLoyaltyInfo,
  getLoyaltyStatus
};
