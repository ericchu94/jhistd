'use strict';
const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');
const timestamp = require('monotonic-timestamp');

const Room = require('./models/room');

const app = new Koa();
const api1 = new Router({
  prefix: '/api/v1',
});

api1.get('/swagger.(json|yaml)', async function (ctx) {
  await send(ctx, ctx.path);
});

api1.get('/rooms', async function (ctx) {
  const rooms = await Room.findAll()
  ctx.body = rooms;
});

app.use(async function (ctx, next) {
  const start = timestamp();
  await next();
  const end = timestamp();
  const diff = end - start;
  console.log(`${ctx.status} ${ctx.method} ${ctx.url} ${diff}ms`);
});

app.use(api1.routes(), api1.allowedMethods());

app.listen(process.env.PORT || 3000);
