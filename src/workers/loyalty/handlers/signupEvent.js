'use strict';

const logger = require('chpr-logger');
const { ObjectId } = require('mongodb');

const riderModel = require('../../../models/riders');
const { handleMessageError } = require('../../../lib/workers');

// TODO make test pass if rider already created

/**
 * Bus message handler for user signup events
 *
 * @param   {Object} message The bus message object.
 * @param   {Object} messageFields The bus message metadata.
 * @returns {void}
 */
async function handleSignupEvent(message, messageFields) {
  try {
    const { id: riderId, name } = message;

    // Idempotency (if message was sent more than once)
    const res = await riderModel.findOneById(
      ObjectId.createFromHexString(riderId)
    );

    logger.info(
      { rider_id: riderId, name },
      '[worker.handleSignupEvent] Received user signup event'
    );

    if (res) {
      logger.info(
        '[worker.handleSignupEvent] Rider already treated'
      ); return;
    }

    logger.info(
      { rider_id: riderId, name },
      '[worker.handleSignupEvent] Insert rider');

    await riderModel.insertOne({
      _id: riderId,
      name
    });
  } catch (err) {
    handleMessageError(err, message, messageFields);
  }
}

module.exports = handleSignupEvent;
