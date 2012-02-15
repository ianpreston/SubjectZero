var fs = require('fs'), 

    express = require('express'),
    connect = require('connect'),
    mongoose = require('mongoose'),
    log4js = require('log4js'),

    controllers = require('./controllers.js')
    config = require('./config.js').config;

var app = express.createServer();
app.use(connect.basicAuth(config.authUsername, config.authPassword));
app.use(express.bodyParser());

mongoose.connect(config.mongooseUrl);

log4js.addAppender(log4js.fileAppender(config.logFilename));

app.get('/', controllers.indexController);

app.get('/template/create', controllers.templateCreateController);
app.post('/template/create', controllers.templateCreateController);

app.get('/template/:id/edit', controllers.templateEditController);
app.post('/template/:id/edit', controllers.templateEditController);

app.get('/template/:id/delete', controllers.templateDeleteController);
app.post('/template/:id/delete', controllers.templateDeleteController);

app.get('/page/create', controllers.pageCreateController);
app.post('/page/create', controllers.pageCreateController);

app.get('/page/:id/edit', controllers.pageEditController);
app.post('/page/:id/edit', controllers.pageEditController);

app.get('/page/:id/delete', controllers.pageDeleteController);
app.post('/page/:id/delete', controllers.pageDeleteController);

app.get('/media/create', controllers.mediaCreateController);
app.post('/media/create', controllers.mediaCreateController);

app.get('/media/:id/delete', controllers.mediaDeleteController);
app.post('/media/:id/delete', controllers.mediaDeleteController);

app.get('/media/:id/edit', controllers.mediaEditController);
app.post('/media/:id/edit', controllers.mediaEditController);

app.listen(config.httpPort, config.httpHost);
