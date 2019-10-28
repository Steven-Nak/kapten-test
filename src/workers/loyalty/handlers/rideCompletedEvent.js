'use strict';

const { ObjectId } = require('mongodb');
const logger = require('chpr-logger');

const date = require('../../../lib/date');
const ridesModel = require('../../../models/rides');
const ridersModel = require('../../../models/riders');
const loyaltyModel = require('../../../lib/loyalty');
const { handleMessageError } = require('../../../lib/workers');

// TODO handle edge cases (no rider, no ride), to make tests pass
// TODO Complete ride + update rider's status

/**
 * Bus message handler for ride complete events
 *
 * @param   {Object} message The bus message object.
 * @param   {Object} messageFields The bus message metadata.
 * @returns {void}
 */
async function handleRideCompletedEvent(message, messageFields) {
  try {
    const { id: rideId, amount, rider_id: riderId } = message;
    const createRide = { _id: rideId, rider_id: riderId, amount };

    logger.info(
      { ride_id: rideId, rider_id: riderId, amount },
      '[worker.handleRideCompletedEvent] Received user ride completed event'
    );

    const ride = await ridesModel.findOneById(
      ObjectId.createFromHexString(rideId)
    );

    if (ride) {
      logger.info('[worker.handleRideCompletedEvent] Ride already treated');
      return;
    }

    let rider = await ridersModel.findOneById(
      ObjectId.createFromHexString(riderId)
    );

    if (!rider) {
      logger.info(
        { rider_id: riderId },
        '[worker.handleRideCompletedEvent] Rider does not exists: insert him');
      rider = await ridersModel.insertOne({ _id: riderId });
    }

    if (!message.create_at) {
      createRide.created_at = date.getDate();
    }

    await ridesModel.insertOne(createRide);
    logger.info(
      { ride_id: rideId, rider_id: riderId },
      '[worker.handleRideCompletedEvent] Insert ride'
    );

    const updateLoyaltyRider = await loyaltyModel.getRiderUpdate(rider, message.amount);
    const riderUpdate = await ridersModel.updateOne(
      ObjectId.createFromHexString(riderId),
      updateLoyaltyRider
    );

    if (!riderUpdate) {
      logger.info('[worker.handleRideCompletedEvent] Updating rider failed');
      return;
    }

    logger.info(
      { ride_id: rideId, rider_id: riderId, rider_update: updateLoyaltyRider },
      '[worker.handleRideCompletedEvent] Update rider'
    );
  } catch (err) {
    handleMessageError(err, message, messageFields);
  }
}

module.exports = handleRideCompletedEvent;
