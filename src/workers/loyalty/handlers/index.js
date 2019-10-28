'use strict';

const handleRideCreatedEvent = require('./rideCreatedEvent');
const handleRideCompletedEvent = require('./rideCompletedEvent');
const handleSignupEvent = require('./signupEvent');
const handleRideCompletedWithPointsEvent = require('./rideCompletedWithPointsEvent');

module.exports = {
  handleRideCreatedEvent,
  handleRideCompletedEvent,
  handleSignupEvent,
  handleRideCompletedWithPointsEvent
};
