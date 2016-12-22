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

api1.get('/swagger.(json|yaml)', async function (ctx) {
  await send(ctx, ctx.path);
});

async function getPlayers() {
  return await Player.findAll();
}

async function postPlayer(name) {
  const player = await Player.create({
    name: name,
  });
  io.socket.emit('postPlayer', player);
  return player;
}

async function getPlayer(id) {
  return await Player.findById(id);
}

async function putPlayer(id, name, score) {
  const [affectedCount] = await Player.update({
    name: name,
    score: score,
  }, {
    where: {
      id: id,
    },
  });
  if (affectedCount) {
    io.socket.emit('putPlayer', {
      id: id,
      name: name,
      score: score,
    });
  }
  return affectedCount;
}

async function deletePlayer(id) {
  await Player.destroy({
    where: {
      id: id,
    },
  });
  io.socket.emit('deletePlayer', {
    id: id,
  });
  return true;
}

async function addPlayerScore(id, delta) {
  const player = await Player.findById(id)
  await player.increment('score', {
    by: delta,
  });
  await player.reload();
  io.socket.emit('putPlayer', player);
}

io.on('getPlayers', async (ctx, data) => {
  ctx.socket.emit('getPlayers', await getPlayers());
});

io.on('postPlayer', async (ctx, data) => {
  const {name} = data;
  await postPlayer(name);
});

io.on('getPlayer', async (ctx, data) => {
  const {id} = data;
  ctx.socket.emit('getPlayer', await getPlayer(id));
});

io.on('putPlayer', async (ctx, data) => {
  const {id, name, score} = data;
  await putPlayer(id, name, score);
});

io.on('deletePlayer', async (ctx, data) => {
  const {id} = data;
  await deletePlayer(id);
});

io.on('addPlayerScore', async (ctx, data) => {
  const {id, delta} = data;
  await addPlayerScore(id, delta);
});

api1.get('/players', async ctx => {
  ctx.body = await getPlayers();
});

api1.post('/players', bodyParser(), async ctx => {
  const {name} = ctx.request.body;
  ctx.body = await postPlayer(name);
});

api1.get('/players/:id', async ctx => {
  const id = ctx.params.id;
  const body = await getPlayer(id);
  if (body)
    ctx.body = body;
});

api1.put('/players/:id', bodyParser(), async ctx => {
  const id = ctx.params.id;
  const {name, score} = ctx.request.body;
  const body = await putPlayer(id, name, score);
  if (body)
    ctx.body = body;
});

api1.delete('/players/:id', async ctx => {
  const id = ctx.params.id;
  const body = await deletePlayer(id);
  if (body)
    ctx.body = body;
});

app.use(convert(cors({
  origin: 'http://swagger-editor.dev.yelp.com',
})));

app.use(async (ctx, next) => {
  const start = timestamp();
  await next();
  const end = timestamp();
  const diff = end - start;
  console.log(`${ctx.status} ${ctx.method} ${ctx.url} ${diff}ms`);
});

app.use(api1.routes(), api1.allowedMethods());

io.attach(app);
app.listen(process.env.PORT || 3000);
