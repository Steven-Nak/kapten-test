'use strict';

const riders = require('../models/riders');
const fidelity = require('../models/fidelity');

const loyalty = require('./loyalty');

const RIDER_NOT_FOUND = new Error('Rider not found');

/**
 * getLoyaltyInfo tries to fetch rider with its id and return all his info
 * linked to the loyalty program
 *
 * @param {ObjectId} id - the user's mongo id
 *
 * @returns {Object} { rider_exists, { status, points, rides_to_next_status } }
 */
async function getLoyaltyInfo(id) {
  const rider = await riders.findOneById(id, {
    ride_count: 1,
    status: 1,
    points: 1
  });

  if (!rider) {
    throw RIDER_NOT_FOUND;
  }

  const { status, points, ride_count: rideCount } = rider;
  const ridesToNextStatus = loyalty.getRemainingRidesToNextStatus(rideCount);

  return {
    status,
    points,
    rides_to_next_status: ridesToNextStatus
  };
}

/**
 * getLoyaltyStatus tries to fetch rider with its id and return his loyalty status
 *
 * @param {ObjectId} id - the user's mongo id
 *
 * @returns {Object} { rider_exists, { status, points, rides_to_next_status } }
 */
async function getLoyaltyStatus(id) {
  const rider = await fidelity.findOneById(id, {
    loyalty_status: 1
  });

  if (!rider) {
    throw RIDER_NOT_FOUND;
  }

  const fidelityStatus = {};

  Object.keys(rider.loyalty_status).forEach((key) => {
    if (rider.loyalty_status[key].points_spent > 0 && rider.loyalty_status[key].rides_count > 0) {
      fidelityStatus[key] = rider.loyalty_status[key];
    }
  });
  return fidelityStatus;
}

module.exports = {
  getLoyaltyInfo,
  getLoyaltyStatus,
  RIDER_NOT_FOUND
};
