'use strict';
const {Sequelize, sequelize} = require('./sequelize');

const Player = sequelize.define('player', {
  name: Sequelize.STRING,
  score: Sequelize.INTEGER,
});

Player.sync();

module.exports = Player;
