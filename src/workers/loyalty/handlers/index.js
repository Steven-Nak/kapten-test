'use strict';

const handleRideCreatedEvent = require('./rideCreatedEvent');
const handleRideCompletedEvent = require('./rideCompletedEvent');
const handleSignupEvent = require('./signupEvent');
const handleRemovePointsEvent = require('./removePointsEvent');

module.exports = {
  handleRideCreatedEvent,
  handleRideCompletedEvent,
  handleSignupEvent,
  handleRemovePointsEvent
};
