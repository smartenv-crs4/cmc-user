var express = require('express');
var router = express.Router();
var User = require('../models/users').User;
var conf=require('../config').conf;
var middlewares = require('./middlewares');
var request = require('request');
var jwtMiddle = require('./jwtauth');





/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Caport2020 User API Microservice dev' });
});

module.exports = router;

/* GET home page. */
router.get('/env', function(req, res) {
  var env;
  if (process.env['NODE_ENV'] === 'dev')
    env='dev';
  else
    env='production';

  res.status(200).send({env:env});
});