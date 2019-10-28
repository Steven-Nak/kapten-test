'use strict';

const { ObjectId } = require('mongodb');
const logger = require('chpr-logger');

const ridersModel = require('../../../models/riders');
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

    logger.info(
      { id: riderId, points_spent: removePoints },
      '[worker.handleRemovePointsEvent] Received rider remove points event'
    );

    let rider = await ridersModel.findOneById(
      ObjectId.createFromHexString(riderId)
    );

    logger.info(
      { current_rider: rider },
      '[worker.handleRemovePointsEvent] Get current rider'
    );

    rider = await ridersModel.updateOne(
      ObjectId.createFromHexString(riderId),
      { points: rider.points - removePoints }
    );

    if (!rider.result.nModified) {
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
