'use strict';

const { ObjectId } = require('mongodb');
const logger = require('chpr-logger');

const { handleMessageError } = require('../../../lib/workers');
const ridesModel = require('../../../models/rides');
const ridersModel = require('../../../models/riders');
const loyaltyModel = require('../../../lib/loyalty');
const date = require('../../../lib/date');

/**
 * Bus message handler for ride complete events
 *
 * @param   {Object} message The bus message object.
 * @param   {Object} messageFields The bus message metadata.
 * @returns {void}
 */
async function handleRideCompletedEvent(message) {
  const { id: rideId, amount, rider_id: riderId } = message;
  const newRide = { _id: rideId, rider_id: riderId, amount };

  try {
    let ride = await ridesModel.findOneById(ObjectId(rideId));

    logger.info(
      { ride_id: rideId, rider_id: riderId, amount },
      '[worker.handleRideCompletedEvent] Received user ride completed event');

    let rider = await ridersModel.findOneById(ObjectId(riderId));

    if (!rider) {
      logger.info(
        { rider_id: riderId },
      '[worker.handleRideCompletedEvent] Rider does not exists: insert him');

      rider = await ridersModel.insertOne({ _id: riderId });
    }

    if (!ride) {
      if (!message.create_at) newRide.created_at = date.getDate();
      ride = await ridesModel.insertOne(newRide);
      logger.info({ ride_id: rideId, rider_id: riderId },
        '[worker.handleRideCompletedEvent] Insert ride');
    }

    const updateInfo = await loyaltyModel.getRiderUpdate(rider, message.amount);
    const riderUpdate = await ridersModel.updateOne(ObjectId(riderId), {
      ride_count: updateInfo.ride_count,
      points: updateInfo.points,
      status: updateInfo.status
    });

    if (!riderUpdate.result.nModified) throw Error('info of rider not updated');

    logger.info(
      { ride_id: rideId, rider_id: riderId, rider_update: updateInfo },
      '[worker.handleRideCompletedEvent] Update rider'
    );
  } catch (err) {
    handleMessageError(err, message);
  }

  // TODO handle edge cases (no rider, no ride), to make tests pass
  // TODO Complete ride + update rider's status
}

module.exports = handleRideCompletedEvent;
