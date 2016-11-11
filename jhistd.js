'use strict';
const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');
const timestamp = require('monotonic-timestamp');
const cors = require('koa-cors');
const convert = require('koa-convert');
const bodyParser = require('koa-bodyparser');

const Player = require('./models/player');

const app = new Koa();
const api1 = new Router({
  prefix: '/api/v1',
});

api1.get('/swagger.(json|yaml)', async function (ctx) {
  await send(ctx, ctx.path);
});

api1.get('/players', async function (ctx) {
  const players = await Player.findAll({
  });
  ctx.body = players;
});

api1.post('/players', bodyParser(), async function (ctx) {
  const {name} = ctx.request.body;
  const player = await Player.create({
    name: name,
  });
  ctx.body = player;
});

api1.get('/players/:id', async function (ctx) {
  const player = await Player.findById(ctx.params.id, {
  });
  if (player)
    ctx.body = player;
});

api1.put('/players/:id', bodyParser(), async function (ctx) {
  const {name, score} = ctx.request.body;
  const [affectedCount] = await Player.update({
    name: name,
    score: score,
  }, {
    where: {
      id: ctx.params.id,
    },
  });
  if (affectedCount > 0)
    ctx.status = 200;
});

api1.delete('/players/:id', async function (ctx) {
  const [affectedCount] = await Player.drop({
    where: {
      id: ctx.params.id,
    },
  });
  if (affectedCount > 0)
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
