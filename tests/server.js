const Koa = require('koa');
const app = new Koa();
const fs = require('fs');
const Router = require('koa-router');
const os = require('os');
const path = require('path');
const AsyncBusboy = require('..');

app.use(async (ctx, next) => {
  try {
    await next(); // next is now a function
  } catch (err) {
    ctx.body = {message: err.message};
    console.log('EXCEPTION', err);
    ctx.status = err.status || 500;
  }
});

const router = new Router();

router.post('/files', async ctx => {
  const busboy = new AsyncBusboy({
    headers: ctx.req.headers
  });

  const resBody = {files: [], fields: []};

  const writes = [];

  await busboy
    .onFile((fieldname, file, filename, encoding, mimetype) => {
      const tmpDir = os.tmpdir();
      const tmpFilePath = path.join(tmpDir, Math.round(Math.random() * 10000000) + filename);
      const write = fs.createWriteStream(tmpFilePath);
      const obj = {fieldname, filename, encoding, mimetype, tmpFilePath};

      file.pipe(write);

      writes.push(new Promise(resolve => {
        write.on('finish', () => {
          resolve(obj);
        });
      }));
    })
    .onField((fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
      resBody.fields.push({fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype});
    })
    .pipe(ctx.req);

  resBody.files = await Promise.all(writes);

  ctx.body = resBody;
});

app.use(router.routes()).use(router.allowedMethods());

app.use(ctx => ctx.status = 404);

module.exports = app;
