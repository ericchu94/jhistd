'use strict';
const Sequelize = require('sequelize');

const sequelize = new Sequelize('jhistd', null, null, {
  dialect: 'sqlite',
  storage: 'db.sqlite3',
});

exports.Sequelize = Sequelize;
exports.sequelize = sequelize;
