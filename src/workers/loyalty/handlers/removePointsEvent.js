'use strict';

const { ObjectId } = require('mongodb');
const logger = require('chpr-logger');

const ridersModel = require('../../../models/riders');
const fidelityModel = require('../../../models/fidelity');
const { handleMessageError } = require('../../../lib/workers');

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

    const newFidelityStatus = {
      _id: riderId,
      loyalty_status: {
        bronze: { points_spent: 0, rides_count: 0 },
        silver: { points_spent: 0, rides_count: 0 },
        gold: { points_spent: 0, rides_count: 0 },
        platinum: { points_spent: 0, rides_count: 0 }
      }
    };

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

    rider = await ridersModel.updateOne(
      ObjectId.createFromHexString(riderId),
      { points: rider.points - removePoints }
    );

    let res = await fidelityModel.findOneById(
      ObjectId.createFromHexString(riderId)
    );

    if (!res) {
      res = await fidelityModel.insertOne(newFidelityStatus);
    }

    res.loyalty_status[status].points_spent += removePoints;
    res.loyalty_status[status].rides_count += 1;

    const updateFidelity = await fidelityModel.updateOne(
      ObjectId.createFromHexString(riderId),
      res
    );

    if (!updateFidelity.result.nModified) {
      logger.info(
        { id: riderId, points_spent: removePoints },
        '[worker.handleRemovePointsEvent] Updating rider failed'
      );
      return;
    }

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
