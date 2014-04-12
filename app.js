
/**
 * Module dependencies.
 */

var express = require('express'),
  http      = require('http'),
  path      = require('path'),
  email     = require('emailjs');

var routes  = require('./routes'),
  config    = require('./config');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/contact', routes.contact);

var serv = http.createServer(app);
var io = require('socket.io').listen(serv);

serv.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  socket.on('form-data', function (data, cb) {
    var eServer = email.server.connect({
      user: config.email.username,
      password: config.email.password,
      host: config.email.server_address,
      ssl: config.email.enable_ssl
    });

    eServer.send({
      text: data.contents + "\n\n\nSent By: " + data.email,
      from: 'Your Emailer',
      to: config.email.username,
      subject: data.subject
    }, function (err, msg) {
      if (err) {
        console.log(err);
        return;
      }

      socket.emit('form-done', {
        done: 'Done',
        data: data
      });
    });
  });
});