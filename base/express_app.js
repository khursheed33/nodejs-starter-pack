var express = require("express");
var mongoose = require("mongoose");
var expressSession = require("express-session");
var http = require("http");
var https = require("https");
var path = require("path");
var expressError = require("express-error");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
const authRouter = require("./routers/auth");
const fs = require("fs");
const errorHandler = require("../error-handling/error_handler");
const allowCORS = require("../base/allow_cross-origin");
const initializeDB = require("../db/connection_mongoose.db");

var Config = require(__dirname + "/../config.json");

console.log(Config);

if (!("port" in Config)) {
  Config.port = 2013;
}

if (!("bind" in Config)) {
  Config.bind = "127.0.0.1";
}

if (!("serveApp" in Config)) {
  Config.serveApp = true;
}

if (!("logging" in Config)) {
  Config.logging = false;
}

if (!("printPort" in Config)) {
  Config.printPort = true;
}

if (!("registration" in Config)) {
  Config.registration = false;
}

global.DEBUG = process.env.NODE_ENV == "development";

//----------------------------------------------------------------------
// Configuration if appfog deployment
//----------------------------------------------------------------------
if ("VMC_APP_PORT" in process.env) {
  //Disable ssl
  if ("ssl" in Config) {
    delete Config.ssl;
  }
  //Overwrite port and host
  Config.port = process.env.VMC_APP_PORT;
  Config.bind = "0.0.0.0";

  Config.printPort = false;
}
if ("MONGOLAB_URI" in process.env) {
  Config.mongoose.options = null;
  Config.mongoose.uri = process.env.MONGOLAB_URI;
}

//----------------------------------------------------------------------
// Setup the database connection
//----------------------------------------------------------------------

initializeDB();

//----------------------------------------------------------------------
// Setup the Cross-Origin
//----------------------------------------------------------------------
app.use(allowCORS);

if (Config.logging === true || DEBUG === true) {
  app.use(express.logger());
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: "true" }));

// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.use(methodOverride());

//Enabling session
app.use(
  expressSession({ secret: "max", saveUninitialized: false, resave: false })
);

// //Enable routing
// app.use(express.Router);

//Enable static file serving
// if(Config.serveApp === true) {
// 	app.use(express.static(__dirname + '/../../client'));
// }

// //Enable error handling
// app.use(function(req, res, next) {
// 	res.statusCode = 404;
// 	var filePath = path.resolve(__dirname + '/../views/errors/404.html');
// 	res.sendfile(filePath);
// });

// if(DEBUG) {
// 	app.use(expressError.express3({contextLinesCount: 3, handleUncaughtException: true}));
// }
// else {
// 	app.use(function(err, req, res, next) {
// 		res.statusCode = 500;
// 		var filePath = path.resolve(__dirname + '/../views/errors/500.html');
// 		res.sendfile(filePath);
// 	});
// }

//Enable static index serving
// if(Config.serveApp === true) {
// 	app.get('/', function(req, res) {
// 		var filePath = path.resolve(__dirname + '/../../client/index.html');
// 		res.sendfile(path.normalize(filePath));
// 	});
// }

//Enable static config serving
app.get("/config.js", function (req, res) {
  console.log(req.path);
  res.setHeader("Content-Type", "application/javascript");

  var ret = "var API_URL = '" + req.protocol + "://" + req.host;
  if (Config.printPort) {
    ret += ":" + (req.secure ? Config.ssl.port : Config.port);
  }
  ret += "/api';";
  ret += "var REGISTRATION_ENABLED=" + Config.registration + ";";

  res.send(ret);
});

//Initialize authentication
require("./models/auth_session").init();
app.use("/api", authRouter);

//Initialize the api callbacks
require("./api").init(app, Config);

app.use("/api", require("./routers/users"));

process.on("uncaughtException", function (err) {
  console.log("!!!!!!!!!!!!!!!!!!!!!! uncaughtException !!!!!!!!!!!!!!!!!!!");
  console.log(err);
});

//Start webapp
if (
  "ssl" in Config &&
  "enabled" in Config.ssl &&
  "key" in Config.ssl &&
  "cert" in Config.ssl &&
  Config.ssl.enabled == true
) {
  var keyFile = Config.ssl.key;
  if (keyFile && keyFile.charAt(0) != "/") {
    keyFile = __dirname + "/" + keyFile;
  }

  var certFile = Config.ssl.cert;
  if (certFile && certFile.charAt(0) != "/") {
    certFile = __dirname + "/" + certFile;
  }

  var options = {
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile),
  };

  if (!("bind" in Config.ssl)) {
    Config.ssl.bind = Config.bind;
  }

  if (!("port" in Config.ssl)) {
    Config.ssl.port = Config.port;
  }

  var server = https
    .createServer(options, app)
    .listen(Config.ssl.port, Config.ssl.bind, function () {
      console.log(
        "Server listening for https on " +
          Config.ssl.bind +
          ":" +
          Config.ssl.port
      );
    });
} else {
  var server = app.listen(Config.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port);
  });
}

app.use(errorHandler);
