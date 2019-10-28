'use strict';

const logger = require('chpr-logger');
const { ObjectId } = require('mongodb');

const ridesModel = require('../../../models/rides');
const ridersModel = require('../../../models/riders');
const { handleMessageError } = require('../../../lib/workers');

// TODO make test pass if no rider

/**
 * Bus message handler for ride create events
 *
 * @param   {Object} message The bus message object.
 * @param   {Object} messageFields The bus message metadata.
 * @returns {void}
 */
async function handleRideCreatedEvent(message, messageFields) {
  try {
    const { id: rideId, rider_id: riderId, amount } = message;
    const createRide = { _id: rideId, rider_id: riderId, amount };

    logger.info(
      { ride_id: rideId, rider_id: riderId, amount },
      '[worker.handleRideCreatedEvent] Received user ride created event');

    // Idempotency (if message was sent more than once)
    let rider = await ridersModel.findOneById(
      ObjectId.createFromHexString(riderId)
    );

    if (!rider) {
      rider = await ridersModel.insertOne({
        _id: ObjectId.createFromHexString(riderId)
      });

      createRide.state = 'created';
      createRide.created_at = rider.created_at;
      createRide.rider_status = rider.status;

      logger.info(
        { rider_id: riderId },
      '[worker.handleRideCreatedEvent] Rider does not exists: insert him');
    }

    // Idempotency (if message was sent more than once)
    const ride = await ridesModel.findOneById(
      ObjectId.createFromHexString(rideId)
    );

    if (ride) {
      logger.info(
        '[worker.handleRideCreatedEvent] Ride already created'
      ); return;
    }

    logger.info(
      { ride_id: rideId, rider_id: riderId },
      '[worker.handleRideCreatedEvent] Insert ride'
    );

    await ridesModel.insertOne(createRide);
  } catch (err) {
    handleMessageError(err, message, messageFields);
  }
}

module.exports = handleRideCreatedEvent;
