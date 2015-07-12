var http = require('http');
var express = require('express');
var path = require('path');
var Substance = require("substance");
var fs = require('fs');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 5000;

var browserify = require("browserify");
var babelify = require("babelify");

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.json({limit: '3mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

// use static server
app.use(express.static(path.join(__dirname, "public")));

// Backend
// --------------------

app.get('/app.js', function (req, res, next) {
  // var startTime = Date.now();
  browserify({ debug: true, cache: false })
    // .transform(babelify.configure({ only: [
    //   path.join(__dirname, 'src'),
    //   path.join(__dirname, 'node_modules', 'substance-ui')
    // ]}))
    .transform(babelify)
    .add(path.join(__dirname, "src", "app.js"))
    // .on('file', function(file, id, parent) {
    //   console.log('### ', (Date.now() - startTime));
    // })
    .bundle()
    .on('error', function(err, data){
      console.error(err.message);
      res.send('console.log("'+err.message+'");');
    })
    .pipe(res);
});

var handleError = function(err, res) {
  console.error(err);
  res.status(400).json(err);
};

// use static server
app.use(express.static(__dirname));

app.listen(port, function(){
  console.log("Lens running on port " + port);
  console.log("http://127.0.0.1:"+port+"/");
});

// Export app for requiring in test files
module.exports = app;