'use strict';

const { MongoClient } = require('mongodb');
const logger = require('chpr-logger');
const config = require('../config');

let db;

/**
 * Connect the database
 *
 * @export
 * @return {void}
 */
async function connect() {
  db = await MongoClient.connect(config.mongodb.url, config.mongodb.options);
  logger.info({ db: config.mongodb.name }, '> Database connected');
}

/**
 * Disconnect the database
 *
 * @export
 * @return {void}
 */
async function disconnect() {
  await db.close();
  logger.info({ db: config.mongodb.name }, '> Mongodb disconnected');
}

/**
 * Get the database
 *
 * @export
 * @return {object} the database
 */
function getDb() {
  return db;
}

module.exports = {
  connect,
  disconnect,
  getDb
};
