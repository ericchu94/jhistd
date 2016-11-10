'use strict';
const {Sequelize, sequelize} = require('./sequelize')

const Room = sequelize.define('room', {
});

Room.sync();

module.exports = Room;
