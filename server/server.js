'use strict';
const errors = require('./errors');
const query = require('./boot/query.js');
var loopback = require('loopback');
var boot = require('loopback-boot');
var loopbackSSL = require('loopback-ssl');

var app = module.exports = loopback();
app.use(loopback.token({
  model: app.models.MultiAccessToken
}));


app.use(async function (req, res, next) {
  console.log(req.accessToken)
  if (req.accessToken) {
    console.log("has accesstoken")
    console.log(req.accessToken.principalType)
    var principalType = req.accessToken.principalType
    var userId = req.accessToken.userId
    if (principalType == "userInstitute") {
      req.accessToken.mainUserId = userId
      next()
    } else {
      next()
    }
  } else {
    next()
  }
});


app.query = query;
app.err = errors;
app.start = function () {
  // start the web server
  return loopbackSSL.startServer(app);

  // return app.listen(function () {
  //   app.emit('started');
  //   var baseUrl = app.get('url').replace(/\/$/, '');
  //   console.log('Web server listening at: %s', baseUrl);
  //   if (app.get('loopback-component-explorer')) {
  //     var explorerPath = app.get('loopback-component-explorer').mountPath;
  //     console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
  //   }
  // });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
