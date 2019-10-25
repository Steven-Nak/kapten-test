'use strict';

const logger = require('chpr-logger');
const { ObjectId } = require('mongodb');

const { handleMessageError } = require('../../../lib/workers');
const riderModel = require('../../../models/riders');
const loyaltyModel = require('../../../lib/loyalty');

/**
 * Bus message handler for ride complete events
 *
 * @param   {Object} message The bus message object.
 * @param   {Object} messageFields The bus message metadata.
 * @returns {void}
 */
async function handleRideCompletedEvent(message) {
  const { id: rideId, amount, rider_id: riderId } = message;
  logger.info(
    { ride_id: rideId, rider_id: riderId, amount },
    '[worker.handleRideCompletedEvent] Received user ride completed event');

  const rider = await riderModel.findOneById(ObjectId(riderId));
  if (rider) {
    const updateRider = await loyaltyModel.getRiderUpdate(rider, message.amount);

    const successUpdate = await riderModel.updateOne(ObjectId(rider._id),
    { ride_count: updateRider.ride_count, points: updateRider.points, status: updateRider.status });

    // Logs to compare initial and final results
    console.log('MESSAGE =========> ', message);
    console.log('RIDER ========> ', rider);
    console.log('UPDATE ==============> ', updateRider);
    console.log('SUCCESS ======> ', successUpdate.result.ok);
  }


  // TODO handle edge cases (no rider, no ride), to make tests pass

  // TODO Complete ride + update rider's status
}

module.exports = handleRideCompletedEvent;
