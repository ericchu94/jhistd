'use strict';
const {Sequelize, sequelize} = require('./sequelize');
const Player = require('./player');
const suits = require('./suits');

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const Card = sequelize.define('card', {
  rank: {
    type: Sequelize.ENUM(ranks),
    unique: 'composite',
  },
  suit: {
    type: Sequelize.ENUM(suits),
    unique: 'composite',
  },
});

Card.belongsToMany(Player, {through: 'PlayerCard'});
Player.belongsToMany(Card, {through: 'PlayerCard'});

sequelize.sync();

(async function () {
  await Card.sync();

  const promises = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      promises.push(Card.create({
        rank: rank,
        suit: suit,
      }));
    }
  }

  try {
    await Promise.all(promises);
  }
  catch (err) {
    console.log('Cards already created');
  }
})();

module.exports = Card;
