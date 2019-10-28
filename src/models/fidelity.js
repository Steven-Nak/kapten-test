'use strict';

const { getDb } = require('../lib/mongodb');
const Joi = require('../lib/joi');

const COLLECTION_NAME = 'fidelity';

const modelSchema = Joi.object({
  _id: Joi.objectId().required(),
  loyalty_status: Joi.object().required()
}).unknown();

/**
 * Validate schema consistency
 *
 * @param {Object} model : the model to validate
 * @returns {Object} Referral: valid version of model
 */
function _validateSchema(model) {
  return Joi.attempt(model, modelSchema);
}

/**
 * Return the fidelity collection
 *
 * @returns {Object} object to manipulate rides collection
 */
function collection() {
  return getDb().collection(COLLECTION_NAME);
}

/**
 * Returns a cursor on lots for a given query.
 *
 * @param {object} query       - mongo query
 * @param {object} projections - optional projection of results fields
 *
 * @returns {Promise<Cursor>} The cursor to iterate on messages
 */
function find(query = {}, projections = {}) {
  return collection().find(query, projections);
}

/**
 * Returns a fidelity found with its id
 *
 * @param {ObjectId} riderId    - identifier of the queried rider
 * @param {Object} projections - optional projection of result fields
 *
 * @returns {Object} The mongo document
 */
function findOneById(riderId, projections = {}) {
  return collection().findOne({ _id: riderId }, projections);
}

/**
 * Insert a new fidelity status into the database
 *
 * @param {Object} fidelity - data about the inserted fidelity status
 *
 * @returns {Object} the inserted fidelity
 */
async function insertOne(fidelity) {
  const validatedFidelity = _validateSchema(fidelity);
  const res = await collection().insert(validatedFidelity);

  return res.ops[0];
}

/**
 * Update a fidelity status
 *
 * @param {ObjectId} riderId      - identifier of the updated fidelity status
 * @param {Object} updatedFields - fields that are updated
 *
 * @returns {Object/null} result of update if succeeded, null otherwise
 */
async function updateOne(riderId, updatedFields) {
  const result = await collection().updateOne({ _id: riderId }, { $set: updatedFields });
  return result || null;
}

module.exports = {
  collection,
  findOneById,
  find,
  insertOne,
  updateOne
};
