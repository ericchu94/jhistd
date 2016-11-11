'use strict';
const {Sequelize, sequelize} = require('./sequelize');
const Room = require('./room');

const Player = sequelize.define('player', {
});

Room.hasMany(Player);

Player.sync();

module.exports = Player;
