var Hapi = require('hapi');
var Ejs = require('ejs');

// load config
var Config = require('./config')

// load controllers
var blog = require('./controllers/blog')

// configure and start hapi
var hapiConfig = {
  debug: {
    request: ['error']
  },
  views: {
    engines: {
      ejs: {
        module: Ejs
      }
    },
    path: 'views'
  }
};
var server = Hapi.createServer(Config.server.bind, Config.server.port, hapiConfig);

// add mysql support
server.pack.require('hapi-mysql', Config.mysql, function(err) {
  if (err) {
    console.error(err);
    throw err;
  }
});

// routes
server.route({
  method: 'GET',
  path: '/',
  handler: blog.index
});
server.route({
  method: 'GET',
  path: '/blog/{year}/{month}/{date}/{slug}',
  handler: blog.single
});

// static files
server.route({
  method: 'GET',
  path: '/static/{path*}',
  handler: {
    directory: { path: './public', listing: false, index: true }
  }
});

// Start the server
server.start();