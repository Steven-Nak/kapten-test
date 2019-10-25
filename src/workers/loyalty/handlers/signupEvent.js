'use strict';

const logger = require('chpr-logger');
const { ObjectId } = require('mongodb');

const { handleMessageError } = require('../../../lib/workers');
const riderModel = require('../../../models/riders');

/**
 * Bus message handler for user signup events
 *
 * @param   {Object} message The bus message object.
 * @param   {Object} messageFields The bus message metadata.
 * @returns {void}
 */
async function handleSignupEvent(message, messageFields) {
  const { id: riderId, name } = message;

  const res = await riderModel.findOneById(ObjectId(riderId));
  if (res !== null) {
    logger.info(
      { rider_id: riderId, name },
      '[worker.handleSignupEvent] Received user signup event');
    logger.info('[worker.handleSignupEvent] Rider already treated');
  } else {
    logger.info(
      { rider_id: riderId, name },
      '[worker.handleSignupEvent] Received user signup event');

    // TODO make test pass if rider already created

    try {
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
}

module.exports = handleSignupEvent;
