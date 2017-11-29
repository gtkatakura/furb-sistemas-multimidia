const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const chokidar = require('chokidar');

const config = require('./webpack/development');
const { app, createServer } = require('./server/bootstrap');

const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));

app.use(webpackHotMiddleware(compiler));

const server = createServer(`${__dirname}/src`);
server.keepAliveTimeout = 0;

const watcher = chokidar.watch('./server');

watcher.on('ready', () => {
  watcher.on('all', () => {
    console.log('Clearing /server/ module cache from server');

    Object.keys(require.cache).forEach((id) => {
      if (/[/\\]server[/\\]/.test(id)) delete require.cache[id];
    });
  });
});
