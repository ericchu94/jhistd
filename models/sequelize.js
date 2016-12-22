'use strict';
const Sequelize = require('sequelize');

const sequelize = new Sequelize('jhistd', 'jhistd', 'jhistd', {
  dialect: 'mysql',
  dialectOptions: {
    socketPath: '/var/run/mysqld/mysqld.sock',
  },
});

exports.Sequelize = Sequelize;
exports.sequelize = sequelize;
