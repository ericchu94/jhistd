'use strict';
const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');
const timestamp = require('monotonic-timestamp');
const cors = require('koa-cors');
const convert = require('koa-convert');
const bodyParser = require('koa-bodyparser');

const Room = require('./models/room');
const Player = require('./models/player');
const Card = require('./models/card');

const app = new Koa();
const api1 = new Router({
  prefix: '/api/v1',
});

api1.get('/swagger.(json|yaml)', async function (ctx) {
  await send(ctx, ctx.path);
});

api1.get('/rooms', async function (ctx) {
  const rooms = await Room.findAll({
    include: [Player], 
  });
  ctx.body = rooms;
});

api1.get('/rooms/:id', async function (ctx) {
  const room = await Room.findById(ctx.params.id);
  if (room)
    ctx.body = room;
});

api1.post('/rooms', async function (ctx) {
  const room = await Room.create();
  ctx.body = room;
});

api1.post('/players', async function (ctx) {
  const player = await Player.create();
  ctx.body = player;
});

api1.get('/players/:id', async function (ctx) {
  const player = await Player.findById(ctx.params.id, {
    include: [Card],
  });
  if (player)
    player.setDataValue('cardCount', player.cards.length);
    ctx.body = player;
});

api1.get('/cards', async function (ctx) {
  const cards = await Card.findAll();
  ctx.body = cards;
});

api1.post('/join', bodyParser(), async function (ctx) {
  const {roomId, playerId} = ctx.request.body;
  const room = await Room.findById(ctx.request.body.roomId);
  if (room) {
    room.addPlayer(playerId);
    room.save();
    ctx.status = 200;
  }
});

api1.post('/leave', bodyParser(), async function (ctx) {
  const {playerId} = ctx.request.body;
  const ret = await Player.update({
    roomId: null,
  }, {
    where: {
      id: playerId,
    },
  });
  if (ret[0] > 0)
    ctx.status = 200;
});

api1.post('/cards/:roomId', bodyParser(), async function (ctx) {
  const roomId = ctx.params.roomId;
  const {cards} = ctx.request.body;
  const ret = await Room.update({
    cards: cards,
  }, {
    where: {
      id: roomId,
    }
  });
  if (ret[0] > 0)
    ctx.status = 200;
});

api1.post('/clinton/:roomId', bodyParser(), async function (ctx) {
  const roomId = ctx.params.roomId;
  const {clinton} = ctx.request.body;
  const ret = await Room.update({
    clinton: clinton,
  }, {
    where: {
      id: roomId,
    }
  });
  if (ret[0] > 0)
    ctx.status = 200;
});

app.use(convert(cors({
  origin: 'http://swagger-editor.dev.yelp.com',
})));

app.use(async function (ctx, next) {
  const start = timestamp();
  await next();
  const end = timestamp();
  const diff = end - start;
  console.log(`${ctx.status} ${ctx.method} ${ctx.url} ${diff}ms`);
});

app.use(api1.routes(), api1.allowedMethods());

app.listen(process.env.PORT || 3000);
