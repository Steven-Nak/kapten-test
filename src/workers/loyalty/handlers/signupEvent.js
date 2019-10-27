'use strict';

const logger = require('chpr-logger');
const { ObjectId } = require('mongodb');

const Joi = require('../../../lib/joi');
const { handleMessageError } = require('../../../lib/workers');
const riderModel = require('../../../models/riders');

const messageSchema = Joi.object({
  id: Joi.objectId().required(),
  name: Joi.string().min(6)
});

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
    Joi.attempt(message, messageSchema);

    const { id: riderId, name } = message;
    const res = await riderModel.findOneById(ObjectId(riderId));

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
