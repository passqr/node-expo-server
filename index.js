var express = require('express');
var bodyParser = require('body-parser');
var Expo = require('exponent-server-sdk');

// Create a new Expo SDK client
let expo = new Expo();

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// set port
app.set('port', (process.env.PORT || 5000));

app.get('/', (request, response) => {
  response.format({
    html: () => {
      response.json({
        title: '😄 Welcome to QRGuard',
        url: 'https://qrguard.com/',
        endpoints: [
          {
            url: '/notification',
            method: 'POST',
            description: 'Send push notification. Configured by the body object received { token, title, description, delay }.'
          },
          {
            url: '/welcome/:token',
            method: 'POST',
            description: 'Send push notification with welcome message to :token device'
          },
          {
            url: '/photo/:token',
            method: 'POST',
            description: 'Send push notification advising :token device photo is uploaded'
          },
          {
            url: '/sendping/:token/:from',
            method: 'POST',
            description: 'Send push notification with a PING to :token device'
          }
        ]
      })
    }
  });
});

app.post('/notification', (request, response) => {
  const { token, title, description, delay } = request.body;

  let isPushToken = Expo.isExponentPushToken(token);

  if (isPushToken) {
    sendPush(token, title, description, response, delay);
  } else {
    response.json({
        icon: '❌',
        message: 'Your token is invalid',
        token: token,
        status: 'error'
    });
  }
});

app.post('/welcome/:token', (request, response) => {
  var token = request.params.token;
  var message = 'Welcome to QRGuard!';
  var description = 'Push notification with welcome message to ' + token + ' device sent';

  let isPushToken = Expo.isExponentPushToken(token);

  if (isPushToken) {
    sendPush(token, message, description, response);
  } else {
    response.json({
        icon: '❌',
        message: 'Your token is invalid',
        token: token,
        status: 'error'
    });
  }
});

app.post('/photo/:token', (request, response) => {
  var token = request.params.token;
  var message = 'Your photo has been successfully uploaded!';
  var description = 'Push notification advising' + token + ' device photo is uploaded sent';

  if (isPushToken) {
    sendPush(token, message, description, response);
  } else {
    response.json({
        icon: '❌',
        message: 'Your token is invalid',
        token: token,
        status: 'error'
    });
  }
});

app.post('/sendyo/:token/:from', (request, response) => {
  var token = request.params.token;
  var from = request.params.from;
  var message = 'PING! from ' + from;
  var description = from + ' send PING - QRGuard';

  if (isPushToken) {
    sendPush(token, message, description, response);
  } else {
    response.json({
        icon: '❌',
        message: 'Your token is invalid',
        token: token,
        status: 'error'
    });
  }
});

var sendPush = (token, title, description, response, delay) => {
  var delayPushNotification = delay || 0;

  setTimeout(() => {
    expo.sendPushNotificationAsync({
      // The push token for the app user you want to send the notification to
      to: token,
      sound: 'default',
      title: title || 'Push notification title',
      body: description || 'Push notification description',
      data: {
        title,
        description
      },
    })
    .then((res) => {
      response.json({
            icon: '✅',
            message: title,
            description: description,
            token: token,
            status: 'sent',
            res: res
        });
    }, err => {
      response.json({
          icon: '❌',
          message: title,
          description: description,
          token: token,
          status: 'error'
      });
    });
  }, delayPushNotification);
}

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
