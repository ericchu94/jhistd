'use strict';
const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');
const timestamp = require('monotonic-timestamp');
const cors = require('koa-cors');
const convert = require('koa-convert');
const bodyParser = require('koa-bodyparser');
const IO = require('koa-socket');

const Player = require('./models/player');

const app = new Koa();
const io = new IO();
const api1 = new Router({
  prefix: '/api/v1',
});

async function getPlayers() {
  return await Player.findAll();
}

async function postPlayer(name) {
  return await Player.create({
    name: name,
  });
}

async function getPlayer(id) {
  return await Player.findById(id);
}

async function putPlayer(id, name, score) {
  const values = {};
  if (name)
    values.name = name;
  if (score)
    values.score = score;
  const [affectedCount] = await Player.update(values, {
    where: {
      id: id,
    },
  });
  return affectedCount || null;
}

async function deletePlayer(id) {
  const [affectedCount] = await Player.drop({
    where: {
      id: id,
    },
  });
  return affectedCount || null;
}

api1.get('/swagger.(json|yaml)', async function (ctx) {
  await send(ctx, ctx.path);
});

api1.get('/players', async function (ctx) {
  ctx.body = await getPlayers();
});

api1.post('/players', bodyParser(), async function (ctx) {
  const {name} = ctx.request.body;
  ctx.body = await postPlayer(name);
});

api1.get('/players/:id', async function (ctx) {
  const id = ctx.params.id;
  const body = await getPlayer(id);
  if (body)
    ctx.body = body;
});

api1.put('/players/:id', bodyParser(), async function (ctx) {
  const id = ctx.params.id;
  const {name, score} = ctx.request.body;
  const body = await putPlayer(id, name, score);
  if (body)
    ctx.body = body;
});

api1.delete('/players/:id', async function (ctx) {
  const id = ctx.params.id;
  const body = await deletePlayer(id);
  if (body)
    ctx.body = body;
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

io.attach(app);
app.listen(process.env.PORT || 3000);
