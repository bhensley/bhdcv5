/**
 * Module dependencies.
 */
var express = require('express'),
  http      = require('http'),
  path      = require('path'),
  email     = require('emailjs');

var methodOverride = require('method-override'),
  bodyParser = require('body-parser'),
  errorHandler = require('errorhandler');

var routes   = require('./routes'),
  contact    = require('./contact_helper.js');

var app = express();

// Set up configuration for SMTP server
var eServer = email.server.connect({
  user:     process.env.EMAIL_USERNAME,
  password: process.env.EMAIL_PASSWORD,
  host:     process.env.EMAIL_SERVER,
  ssl:      process.env.EMAIL_SSL
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
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
        to: process.env.EMAIL_TOADDR,
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