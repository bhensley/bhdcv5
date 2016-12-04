/**
 * Module dependencies.
 */

var express = require('express'),
  http      = require('http'),
  path      = require('path'),
  email     = require('emailjs');

var routes   =  require('./routes'),
  //config        =  require('./config'),
  contact      = require('./contact_helper.js');

var app = express();

// Set up configuration for SMTP server
var eServer = email.server.connect({
  user:     '', //config.email.username,
  password: '', //config.email.password,
  host:     '', //config.email.server_address,
  ssl:      '', //config.email.enable_ssl
});

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


/**
 * Handle our routes
 */
app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/contact', routes.contact);


/**
 * Socket.io implementation for our contact form.
 */
var serv = http.createServer(app);
var io = require('socket.io').listen(serv);

serv.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// This will be called only when the contact form has been submitted
io.sockets.on('connection', function (socket) {
  socket.on('form-data', function (data, cb) {
    var validContact = contact.valid_contact_form(data.subject, data.contents);

    if (validContact) {
      // Send the email
      eServer.send({
        text: data.contents + "\n\n\nSent By: " + data.email,
        from: 'Your Emailer',
        to: config.email.username,
        subject: data.subject
      }, function (err, msg) {
        if (err) {
          return;
        }

        // Email sent successfully, tell that to the client
        socket.emit('form-done', {
          success: true
        });
      });
    } else {
      socket.emit('form-done', {
        success: false
      });
    }
  });
});