'use strict';
const {Sequelize, sequelize} = require('./sequelize');
const suits = require('./suits');

const Room = sequelize.define('room', {
  cards: Sequelize.INTEGER,
  clinton: Sequelize.ENUM(suits),
});

Room.sync();

module.exports = Room;
