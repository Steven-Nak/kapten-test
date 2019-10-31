'use strict';

const { ObjectId } = require('mongodb');
const logger = require('chpr-logger');

const ridersModel = require('../../../models/riders');
const fidelityModel = require('../../../models/fidelity');
const { handleMessageError } = require('../../../lib/workers');

const loyaltyScale = {
  bronze: { points_spent: 0, rides_count: 0 },
  silver: { points_spent: 0, rides_count: 0 },
  gold: { points_spent: 0, rides_count: 0 },
  platinum: { points_spent: 0, rides_count: 0 }
};

/**
 * Bus message handler for remove points events
 *
 * @param   {Object} message The bus message object.
 * @param   {Object} messageFields The bus message metadata.
 * @returns {void}
 */
async function handleRemovePointsEvent(message, messageFields) {
  try {
    const { id: riderId, points_spent: removePoints } = message;
    const newLoyaltyStatus = { _id: riderId, loyalty_status: loyaltyScale };

    logger.info(
      { id: riderId, points_spent: removePoints },
      '[worker.handleRemovePointsEvent] Received rider remove points event'
    );

    // no check if rider exists, if this handler is called,
    // rider is already save in db because we used his points to update his profile
    let rider = await ridersModel.findOneById(
      ObjectId.createFromHexString(riderId)
    );

    const status = rider.status;

    logger.info(
      { current_rider: rider },
      '[worker.handleRemovePointsEvent] Get current rider'
    );

    if (removePoints > rider.points) {
      throw Error('Rider has not enough points');
    }

    rider = await ridersModel.updateOne(
      ObjectId.createFromHexString(riderId),
      { points: rider.points - removePoints }
    );

    if (!rider.result.nModified) {
      throw Error('Updating points of rider failed');
    }

    let riderLoyalty = await fidelityModel.findOneById(
      ObjectId.createFromHexString(riderId)
    );

    // first time rider used his points, create and save in database his loyalty status
    if (!riderLoyalty) {
      riderLoyalty = await fidelityModel.insertOne(newLoyaltyStatus);
    }

    riderLoyalty.loyalty_status[status].points_spent += removePoints;
    riderLoyalty.loyalty_status[status].rides_count += 1;

    const updateFidelity = await fidelityModel.updateOne(
      ObjectId.createFromHexString(riderId),
      riderLoyalty
    );

    if (!updateFidelity.result.nModified) {
      throw Error('Updating loyalty status of rider failed');
    }

    // get rider to print new infos
    rider = await ridersModel.findOneById(
      ObjectId.createFromHexString(riderId)
    );

    logger.info(
      { rider_update: rider },
      '[worker.handleRemovePointsEvent] Update rider'
    );
  } catch (err) {
    handleMessageError(err, message, messageFields);
  }
}

module.exports = handleRemovePointsEvent;
