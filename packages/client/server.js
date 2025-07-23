


import path from 'path'
import { readFileSync } from 'node:fs';
import { koa } from '@feathersjs/koa'
import serve from 'koa-static';
import send from 'koa-send';
import packageRoot from 'app-root-path'
import { createServer } from 'https';
import { createServer as _createServer } from 'http';
import dotenv from 'dotenv'
dotenv.config({ path: process.cwd() + '/../../.env.local' })



const app = new koa();
const PORT = parseInt(process.env.VITE_APP_PORT) || 3000;
const HTTPS = process.env.VITE_LOCAL_BUILD ?? false;
const key = process.env.KEY || 'certs/key.pem'
const cert = process.env.CERT || 'certs/cert.pem'

app.use(serve(path.join(packageRoot.path, 'packages', 'client', 'dist'), {
  brotli: true,
  setHeaders: (ctx) => {
    ctx.setHeader('Origin-Agent-Cluster', '?1')
  }
}));

app.use(async (ctx) => {
  await send(ctx, path.join('dist', 'index.html'), {
    root: path.join(packageRoot.path, 'packages', 'client')
  });
});

app.listen = function () {
  let server;
  if (HTTPS) {
    const pathedkey = readFileSync(path.join(packageRoot.path, key))
    const pathedcert = readFileSync(path.join(packageRoot.path, cert))
    server = createServer({key: pathedkey, cert: pathedcert }, this.callback());
  } else {
    server = _createServer(this.callback());
  }
  return server.listen.apply(server, arguments);
};
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
