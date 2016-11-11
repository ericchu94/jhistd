'use strict';
const {Sequelize, sequelize} = require('./sequelize');

const Player = sequelize.define('player', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  score: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

Player.sync();

module.exports = Player;
