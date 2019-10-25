'use strict';

const logger = require('chpr-logger');
const { ObjectId } = require('mongodb');

const rideModel = require('../../../models/rides');
const riderModel = require('../../../models/riders');
const { handleMessageError } = require('../../../lib/workers');

/**
 * Bus message handler for ride create events
 *
 * @param   {Object} message The bus message object.
 * @returns {void}
 */
async function handleRideCreatedEvent(message) {
  const { id: rideId, rider_id: riderId, amount } = message;
  logger.info(
    { ride_id: rideId, rider_id: riderId, amount },
    '[worker.handleRideCreatedEvent] Received user ride created event');

  try {
    // Idempotency (if message was sent more than once)
    const rider = await riderModel.findOneById(
      ObjectId.createFromHexString(riderId)
    );

    if (!rider) throw Error('this rider is not register in database');

    logger.info(
      { ride_id: rideId, rider_id: riderId },
      '[worker.handleRideCreatedEvent] Insert ride');

    await rideModel.insertOne({
      _id: rideId,
      rider_id: riderId,
      amount
    });
  } catch (err) {
    handleMessageError(err, message);
  }
  // TODO make test pass if no rider
}

module.exports = handleRideCreatedEvent;
