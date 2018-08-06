/*
 ############################################################################
 ############################### GPL III ####################################
 ############################################################################
 *                         Copyright 2017 CRS4                                 *
 *       This file is part of CRS4 Microservice Core - User (CMC-User).       *
 *                                                                            *
 *       CMC-User is free software: you can redistribute it and/or modify     *
 *     it under the terms of the GNU General Public License as published by   *
 *       the Free Software Foundation, either version 3 of the License, or    *
 *                    (at your option) any later version.                     *
 *                                                                            *
 *       CMC-User is distributed in the hope that it will be useful,          *
 *      but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the        *
 *               GNU General Public License for more details.                 *
 *                                                                            *
 *       You should have received a copy of the GNU General Public License    *
 *       along with CMC-User.  If not, see <http://www.gnu.org/licenses/>.    *
 * ############################################################################
 */


var express = require('express');
var middlewares = require('./middlewares');
var User = require('../models/users').User;
var util = require('util');
var _ = require('underscore')._;
var router = express.Router();
var jwtMiddle = require('./jwtauth');
var conf=require('../config').conf;
var request = require('request');
var comminFunctions=require("./commonfunctions");
var async=require('async');
var array_merge=require('array-merge-by-key');

var microserviceBaseURL=conf.authUrl;
var microserviceToken=conf.auth_token;

router.use(middlewares.parsePagination);
router.use(middlewares.parseFields);



// Begin Macro
/**
 * @apiDefine NotFound
 * @apiError 404_NotFound The Object with specified <code>id</code> was not found.<BR>
 * <b>request.body.error</b> contains an error name specifying the 404_NotFound error.<BR>
 * <b>request.body.error_message</b> contains an error message specifying the 404_NotFound error.<BR>
 */

/**
 * @apiDefine Metadata
 * @apiSuccess {Object} _metadata Object containing metadata for pagination info
 * @apiSuccess {Number} _metadata.skip Number of results of this query skipped
 * @apiSuccess {Number} _metadata.limit Limits the number of results to be returned by this query.
 * @apiSuccess {Number} _metadata.totalCount Total number of query results.
 */

/**
 * @apiDefine  ServerError
 * @apiError 500_ServerError Internal Server Error. <BR>
 * <b>request.body.error</b>: error type message specifying the problem, e.g. <i>Db Internal Microservice Error ....</i><BR>
 * <b>request.body.error_message</b>: error message specifying the problem e.g. <i>Connection Down</i><BR>
 * @apiErrorExample Error-Response: 500 Internal Server Error
 *     HTTP/1.1 500 Internal Server Error
 *      {
 *         "error": 'Internal Error'
 *         "error_message": 'something blew up, ERROR: No MongoDb Connection'
 *      }
 */

/**
 * @apiDefine  BadRequest
 * @apiError 400_BadRequest The server cannot or will not process the request due to something perceived as a client error<BR>
 * <b>request.body.error</b> error type message specifying the problem, e.g. <i>BadRequest ....</i><BR>
 * <b>request.body.error_message</b> error message specifying the problem e.g. <i>malformed request syntax, invalid reques, invalid fields ....</i><BR>
 *
 *  @apiErrorExample Error-Response: 400 BadRequest
 *     HTTP/1.1 400 InvalidRequest
 *      {
 *         error:'BadRequest',
 *         error_message:'no body sended',
 *      }
 */

/**
 * @apiDefine  Unauthorized
 * @apiError 401_Unauthorized Not authorized to call this endpoint.<BR>
 * <b>request.body.error:</b> error type message specifying the problem, e.g. <i>NotAuthorized ....</i><BR>
 * <b>request.body.error_message:</b> error message specifying the problem e.g. <i>only admin user can create admin user</i><BR>
 * @apiErrorExample Error-Response: 401 Unauthorized
 *     HTTP/1.1 401 Unauthorized
 *      {
 *         "error":"invalid_token",
 *         "error_description":"Unauthorized: The access token expired"
 *      }
 */

/**
 * @apiDefine  InvalidUserAndPassword
 * @apiError 403_Unauthorized Username or password not valid.<BR>
 * <b>request.body.error:</b> error type message specifying the problem, e.g. <i>Not Logged ....</i><BR>
 * <b>request.body.error_message:</b> error message specifying the problem e.g. <i>wrong username or password</i><BR>
 * @apiErrorExample Error-Response: 403 Unauthorized
 *     HTTP/1.1 403 Unauthorized
 *      {
 *         "error":"Unauthorized",
 *         "error_description":"Warning: wrong username"
 *      }
 */

/**
 * @apiDefine GetResource
 * @apiSuccess {Object[]} users a paginated array list of users objects
 * @apiSuccess {String} users.id User id identifier
 * @apiSuccess {String} users.field1 field 1 defined in schema
 * @apiSuccess {String} users.field2 field 2 defined in schema
 * @apiSuccess {String} users.fieldN field N defined in schema
 */

/**
 * @apiDefine GetResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *       "users":[
 *                      {
 *                          "_id": "543fdd60579e1281b8f6da92",
 *                          "email": "prova@prova.it",
 *                          "name": "prova",
 *                          "notes": "Notes About prova"
 *                      },
 *                      {
 *                       "id": "543fdd60579e1281sdaf6da92",
 *                          "email": "prova1@prova.it",
 *                          "name": "prova1", *
 *                          "notes": "Notes About prova1"
 *
 *                     },
 *                    ...
 *                 ],
 *
 *       "_metadata":{
 *                   "skip":10,
 *                   "limit":50,
 *                   "totalCount":100
 *                   }
 *     }
 */

// End Macro


//###################################### PROPERTIES FILE DEFAULT.JSON #######################################################
/**
 * @api Configuration Fields
 * @apiVersion 1.0.0
 * @apiName Configuration
 * @apiGroup Configuration
 * @apiSampleRequest off
 *
 * @apiDescription This section lists the configuration parameters of the microservice. You can set these parameters in default.json in
 * config directory (under project root), or by command line thanks to the propertiesmanager package.
 *
 * default.json properties can be overridden and extended by command line parameters.
 *
 * To extend it, you must type in command line --ParamName=ParamValues as in the example below:
 *
 * Override "property_1" properties from default.json :
 *
 * $ npm start -- --property_1="Override_TestOne".
 *
 * The first "--" after npm start command must be used to tell npm that the next parameters must be passed to node bin/www, so if you run your
 * application with node bin/www the first "--" shall not be used, as in:
 *
 * $node bin/www --properties_One="Override_TestOne".
 *
 * To override parameters in a tree data structure as a JSON, you have to access the nested fields by using the dotted (".") syntax.
 *
 * For further examples see propertiesmanager npm package.
 *
 *
 * @apiParam {Number} dbPort mongoDb port number
 * @apiParam {String} dbHost mongoDb host name
 * @apiParam {String} dbName mongoDb database name
 * @apiParam {Number} limit  default limit param used to paginate GET responses
 * @apiParam {Number} skip   default skip param used to paginate GET responses
 * @apiParam {String} logfile log file path
 * @apiParam {String} authUrl URL used to call authorization microservice(authms) resource
 * @apiParam {String} auth_token token used to call authorization microservice
 * @apiParam {Object} AdminDefaultUser admin Admin default user dictionary. The admin default user is registered at microservice startup
 * @apiParam {String} AdminDefaultUser.name Admin Name
 * @apiParam {String} AdminDefaultUser.email Admin username
 * @apiParam {String} AdminDefaultUser.surname Admin surname
 * @apiParam {Object} UserSchema Object containig the mongoDb Schema of Users. If not set, a schema defined in models/users.js will be used
 */
//###################################### PROPERTIES FILE DEFAULT.JSON #######################################################


/**
 * @api {post} /users/signup Register a new User
 * @apiVersion 1.0.0
 * @apiName Sign Up User
 * @apiGroup Users
 *
 * @apiDescription Protected by access token, creates a new User object and returns the access credentials.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (Body Parameter) {Object} user                 User dictionary with all the fields. email, password and type are mandatory
 * @apiParam (Body Parameter) {String} user.email           User email valid as username to login
 * @apiParam (Body Parameter) {String} user.password        User password
 * @apiParam (Body Parameter) {String} user.type            User type, e.g. admin, cruiser...
 * @apiParam (Body Parameter) {String} [user.name]          User first name
 * @apiParam (Body Parameter) {String} [user.surname]       User surname
 * @apiParam (Body Parameter) {String} [application.avatar] User avatar image id in uploadms
 * @apiParam (Body Parameter) {String} [application.notes]  User notes
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST request
 *  Body:{ "email": "prov@prova.it" , "password":"provami", "type":"crocierista", "name":"nome", "surname":"cognome"}
 *
 * @apiSuccess (201 - CREATED) {Object} access_credentials                          information about access credentials
 * @apiSuccess (201 - CREATED) {Object} access_credentials.apiKey                   information about apiKey
 * @apiSuccess (201 - CREATED) {String} access_credentials.apiKey.token             user Token
 * @apiSuccess (201 - CREATED) {String} access_credentials.apiKey.expires           token expiration date
 * @apiSuccess (201 - CREATED) {Object} access_credentials.refreshToken             information about refreshToken used to renew token
 * @apiSuccess (201 - CREATED) {String} access_credentials.refreshToken.token       user refreshToken
 * @apiSuccess (201 - CREATED) {String} access_credentials.refreshToken.expires     refreshToken expiration date
 * @apiSuccess (201 - CREATED) {Object} Created_resource                            the created User resource dictionary
 * @apiSuccess (201 - CREATED) {String} Created_resource.UserField_1                field 1 defined in User Schema (e.g. name)
 * @apiSuccess (201 - CREATED) {String} Created_resource.UserField_2                field 2 defined in User Schema (e.g. surname)
 * @apiSuccess (201 - CREATED) {String} Created_resource.UserField_N                field N defined in User Schema (e.g. type)
 *
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "created_resource":{
 *                 "name":"Micio",
 *                 "email":"mario@cmc.com",
 *                 "surname":"Macio",
 *                 "id":"57643332ab9293ff0b5da6f0"
 *        },
 *        "access_credentials":{
 *                 "apiKey":{
 *                         "token":"VppR5sHU_hV3U",
 *                         "expires":1466789299072
 *                  },
 *                  "refreshToken":{
 *                          "token":"eQO7de4AJe-syk",
 *                          "expires":1467394099074
 *                   }
 *        }
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiSampleRequest off
 */
router.post('/signup',[jwtMiddle.decodeToken],function(req, res){


    if (!req.body || _.isEmpty(req.body))  return res.status(400).send({
        error: "no_body",
        error_message: 'request body missing'
    });


    var user = req.body.user;

    if (!user) return res.status(400).send({error: 'BadRequest', error_message: "No user provided"});

    if((conf.adminUser.indexOf(user.type)>=0) && (!(conf.adminUser.indexOf(req.User_App_Token.type)>=0)))//to create admin user use a post
        return res.status(401).send({error: 'NotAuthorized', error_message : "Only Admin User can SignUp admin users"});


    var loginUser={
        "email":user.email,
        "password":user.password,
        "type":user.type
    };



    var rqparams = {
        url: microserviceBaseURL + '/authuser/signup',
        headers: {'Authorization': "Bearer " + microserviceToken, 'content-type': 'application/json'},
        body: JSON.stringify({user: loginUser})
    };

    request.post(rqparams, function (error, response, body) {

        try{

        if (error) {
            return res.status(500).send({error: 'internal_microservice_error', error_message: error + ""});
        } else {

            var loginToken = JSON.parse(body);

            if(!loginToken.error){ // ho un token valido
                user._id=loginToken.userId;
                delete user['password'];
                delete user['type'];
                delete loginToken['userId'];
                try {
                    User.create(user, function (err, newUser) {
                        if (err) {
                            rqparams = {
                                url: microserviceBaseURL + '/authuser/' + user._id,
                                headers: {'Authorization': "Bearer " + microserviceToken}
                            };

                            request.delete(rqparams, function (error, response, body) {
                                if (error)
                                    console.log("inconsistent data");
                                //TODO Create an inconsistent data queue. If the user creation is not completed and wiping that user in auth does not succeed, the data can be inconsistent

                            });
                            return res.status(500).send({error: 'internal_Error', error_message: err});

                        } else {
                            var tmpU = JSON.parse(JSON.stringify(newUser));
                            delete tmpU['__v'];
                            //delete tmpU['_id'];
                            return res.status(201).send({"created_resource": tmpU, "access_credentials": loginToken});
                        }
                    });
                } catch (ex) {
                    rqparams = {
                        url: microserviceBaseURL + '/authuser/' + user._id,
                        headers: {'Authorization': "Bearer " + microserviceToken}
                    };
                    request.delete(rqparams, function (error, response, body) {
                        if (error)
                            console.log("inconsistent data");
                        //TODO Create an inconsistent data queue. If the user creation is not completed and wiping that user in auth does not succeed, the data can be inconsistent

                    });
                    return res.status(500).send({
                        error: "signup_error",
                        error_message: 'Unable to register user (err:' + ex + ')'
                    });
                }

            } else {
                return res.status(response.statusCode).send(loginToken);
            }
        }
        }catch (ex){
            return res.status(500).send(ex);
        }
    });

});



/**
 * @api {post} /users/signin User login
 * @apiVersion 1.0.0
 * @apiName Login User
 * @apiGroup Users
 *
 * @apiDescription Protected by access token, logs in the user and returns the access credentials.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (Body Parameter) {String} username     User email
 * @apiParam (Body Parameter) {String} password     User password
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST request
 *  Body:{ "username": "prov@prova.it" , "password":"provami"}
 *
 * @apiSuccess (200 - OK) {Object} access_credentials                       information about access credentials.
 * @apiSuccess (200 - OK) {Object} access_credentials.apiKey                information about apiKey
 * @apiSuccess (200 - OK) {String} access_credentials.apiKey.token          user Token
 * @apiSuccess (200 - OK) {String} access_credentials.apiKey.expires        token expiration date
 * @apiSuccess (200 - OK) {Object} access_credentials.refreshToken          information about refreshToken used to renew token
 * @apiSuccess (200 - OK) {String} access_credentials.refreshToken.token    user refreshToken
 * @apiSuccess (200 - OK) {String} access_credentials.refreshToken.expires  refreshToken expiration date
 * @apiSuccess (200 - OK) {String} access_credentials.userId                user id
 *
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "access_credentials":{
 *                 "apiKey":{
 *                         "token":"VppR5sHU_hV3U",
 *                         "expires":1466789299072
 *                  },
 *                  "refreshToken":{
 *                          "token":"eQO7de4AJe-syk",
 *                          "expires":1467394099074
 *                   }
 *                   "userId":"34324JHGJ89787"
 *        }
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiUse InvalidUserAndPassword
 * @apiSampleRequest off
 */
router.post('/signin', [jwtMiddle.decodeToken], function (req, res) {

    if (!req.body || _.isEmpty(req.body))  return res.status(400).send({
        error: "no_body",
        error_message: 'request body missing'
    });

    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password) return res.status(400).send({
        error: 'BadRequest',
        error_message: "No username o password provided"
    });

    var rqparams = {
        url: microserviceBaseURL + '/authuser/signin',
        headers: {'Authorization': "Bearer " + microserviceToken, 'content-type': 'application/json'},
        body: JSON.stringify({username: username, password: password})
    };

    request.post(rqparams, function (error, response, body) {

        try {
            if (error) {
                return res.status(500).send({error: 'internal_microservice_error', error_message: error + ""});
            } else {

                var loginToken = JSON.parse(body);

                if (!loginToken.error) { // ho un token valido
                    return res.status(200).send({"access_credentials": loginToken});
                }
                else  return res.status(response.statusCode).send(loginToken);
            }
        }catch (ex){
        return res.status(500).send(ex);
        }
    });

});



/**
 * @api {get} /users/ Get all Users
 * @apiVersion 1.0.0
 * @apiName Get User
 * @apiGroup Users
 *
 * @apiDescription Protected by admin access token, returns a paginated list of all Users.
 * Set pagination skip and limit and other filters in the URL request, e.g. "get /users?skip=10&limit=50&name=Mario"
 * filter by type are not valid, use search actions to filter by user type
 * If you need a filter by _id you can done it by set field 'usersId'. usersId field can be in ObjectId on a ObjectId array.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (Query Parameter) {String} UserField_1   query     field 1 used to set filter, e.g. name = "User Name"
 * @apiParam (Query Parameter) {String} UserField_2   query     field 2 used to set filter, e.g. Filed2 = "Field Value"
 * @apiParam (Query Parameter) {String} UserField_etc query     field ... used to set filter, e.g. Filed.. = "Field Value"
 * @apiParam (Query Parameter) {String} UserField_N   query     field N used to set filter, e.g. Field3 = "Field Value"
 *
 * @apiUse Metadata
 * @apiUse GetResource
 * @apiUse GetResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 */


router.get('/', [jwtMiddle.decodeToken], function (req, res,next) {

    if(req.query.type)
        res.status(400).send({error: 'BadRequest', error_message: 'Filter by user type are not valid, use search actions to filter types'});


    var fields = req.dbQueryFields;
    var notReturnType=false;
    if((fields && (!fields.indexOf('type')>=0)) || (fields && (!fields.indexOf('TYPE')>=0)) || (fields && (fields.indexOf('-type')>=0)) || (fields && (fields.indexOf('-TYPE')>=0)))
        notReturnType=true;

    if (!fields)
        fields = '-hash -salt -__v';

    var query = {};

    var ids=(req.query && req.query.usersId) || null;

    if(ids) {
        if (_.isArray(ids)) { //is an array
            query._id={ "$in": ids };
        } else {
            query._id=ids;
        }
    }



    for (var v in req.query) {
        if (User.schema.path(v)) {
            query[v] = req.query[v];
        }
    }


    User.findAll(query, fields, req.dbPagination, function(err, results){

    try {
        if (!err) {

            if (results) {

                if(notReturnType)
                    res.status(200).send(results);
                else
                    upgradeUserInfo(res, results,["all"]);
            }
            else
                res.status(204).send();
        }
        else {
            res.status(500).send({error: 'internal_error', error_message: 'something blew up, ERROR:' + err});
        }
    }catch (ex){
        return res.status(500).send({error:"InternalError", error_message:ex});
    }
    });

});


/**
 * @api {post} /users/ Create User
 * @apiVersion 1.0.0
 * @apiName Create Admin User
 * @apiGroup Users
 *
 * @apiDescription Accessible by access tokens. Creates a new User(included admin users) and returns the access credentials.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] access token that grants access to this resource. It must be sent in [ body || as query param ].
 * if set, the same token sent in Authorization header should be undefined
 * @apiParam (Body Parameter) {Object} user                 User dictionary with all the fields. email, password and type are mandatory
 * @apiParam (Body Parameter) {String} user.email email     User email valid as username to login
 * @apiParam (Body Parameter) {String} user.password        User password
 * @apiParam (Body Parameter) {String} user.type            User type, e.g. admin, cruiser...
 * @apiParam (Body Parameter) {String} [user.name]          User first name
 * @apiParam (Body Parameter) {String} [user.surname]       User surname
 * @apiParam (Body Parameter) {String} [application.avatar] User avatar image id in uploadms
 * @apiParam (Body Parameter) {String} [application.notes]  User notes
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST request
 *  Body:{ "email": "prov@prova.it" , "password":"provami", "type":"crocierista", "name":"nome", "surname":"cognome"}
 *
 * @apiSuccess (201 - CREATED) {Object} access_credentials                      information about access credentials
 * @apiSuccess (201 - CREATED) {Object} access_credentials.apiKey               information about apiKey
 * @apiSuccess (201 - CREATED) {String} access_credentials.apiKey.token         user Token
 * @apiSuccess (201 - CREATED) {String} access_credentials.apiKey.expires       token expiration date
 * @apiSuccess (201 - CREATED) {Object} access_credentials.refreshToken         information about refreshToken used to renew token
 * @apiSuccess (201 - CREATED) {String} access_credentials.refreshToken.token   user refreshToken
 * @apiSuccess (201 - CREATED) {String} access_credentials.refreshToken.expires refreshToken expiration date
 * @apiSuccess (201 - CREATED) {Object} Created_resource                        the created User resource
 * @apiSuccess (201 - CREATED) {String} Created_resource.UserField_1            field 1 defined in User Schema (e.g. name)
 * @apiSuccess (201 - CREATED) {String} Created_resource.UserField_2            field 2 defined in User Schema (e.g. surname)
 * @apiSuccess (201 - CREATED) {String} Created_resource.UserField_N            field N defined in User Schema (e.g. type)
 *
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "created_resource":{
 *                 "name":"Micio",
 *                 "email":"mario@cmc.com",
 *                 "surname":"Macio",
 *                 "id":"57643332ab9293ff0b5da6f0"
 *        },
 *        "access_credentials":{
 *                 "apiKey":{
 *                         "token":"VppR5sHU_hV3U",
 *                         "expires":1466789299072
 *                  },
 *                  "refreshToken":{
 *                          "token":"eQO7de4AJe-syk",
 *                          "expires":1467394099074
 *                   }
 *        }
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiSampleRequest off
 */

router.post('/', [jwtMiddle.decodeToken], function (req, res) {

    if (!req.body || _.isEmpty(req.body))  return res.status(400).send({
        error: "BadRequest",
        error_message: 'request body missing'
    });


    var user = req.body.user;

    if (!user) return res.status(401).send({error: 'no user sent', error_message: "No username provided"});

    //delete user['password'];

    //Create User in Authms microservice
    comminFunctions.createUserAsAdmin(user, function (err, status_code, json) {

        return res.status(status_code).send(json);

    });

});



/**
 * @api {get} /users/:id Get the User by id
 * @apiVersion 1.0.0
 * @apiName GetUserById
 * @apiGroup Users
 *
 * @apiDescription Protected by admin access token or by the user itself, returns the info about a User.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (URL Parameter) {String} id    The user id or username (email)
 *
 * @apiSuccess {String} id      User id
 * @apiSuccess {String} field1  field 1 defined in schema
 * @apiSuccess {String} field2  field 2 defined in schema
 * @apiSuccess {String} fieldN  field N defined in schema
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *        "id": "543fdd60579e1281b8f6da92",
 *        "email": "prova@prova.it",
 *        "name": "prova",
 *        "surname": "surname",
 *        "notes": "Notes About prova"
 *     }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 */
/* GET user by id. */
router.get('/:id', [jwtMiddle.decodeToken, middlewares.ensureUserIsAdminOrSelf], function (req, res) {

    var fields = req.dbQueryFields;
    var notReturnType=false;

    if((fields && (!fields.indexOf('type')>=0)) || (fields && (!fields.indexOf('TYPE')>=0)) || (fields && (fields.indexOf('-type')>=0)) || (fields && (fields.indexOf('-TYPE')>=0)))
        notReturnType=true;


    if (!fields)
        fields = '-hash -salt -__v';

    var id = (req.params.id).toString();

    User.findById(id, fields, function(err, results){
        try {
            if (!err) {
                if(notReturnType)
                    res.send(results);
                else{
                    var rqparams = {
                        url: microserviceBaseURL + "/authuser/"+id,
                        headers: {'Authorization': "Bearer " + microserviceToken, 'content-type': 'application/json'},
                    };

                    request.get(rqparams, function (error, response) {
                        try {
                            if(error) res.status(500).send({error: 'internal_error', error_message: 'something blew up in get user Type from auth ms, ERROR:' + err});

                            response.body=JSON.parse(response.body);
                            var resultWithType=results.toJSON();
                            resultWithType.type=response.body.type || null;
                            res.send(resultWithType);
                        }catch (ex){
                            return res.status(500).send({error:"InternalError", error_message:ex});
                        }
                    });
                }
            }
            else {
                if (results === {} || results === undefined) res.status(404).send({
                    error: 'notFound',
                    error_message: 'user not found'
                });
                else res.status(500).send({error: 'internal_error', error_message: 'something blew up, ERROR:' + err});
            }
        }catch (ex){
            return res.status(500).send({error:"InternalError", error_message:ex});
        }
    });

});



/**
 * @api {put} /users/:id Update User
 * @apiVersion 1.0.0
 * @apiName Update User
 * @apiGroup Users
 *
 * @apiDescription Protected by admin access token or by the user itself, updates an User and returns the updated resource.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (URL Parameter)  {String} id                   User id or username (email)
 * @apiParam (Body Parameter) {Object} user                 User dictionary with all the fields to update. Email (username) field can be updated only by admin token; To change password and enable user, there is a dedicated endpoint
 * @apiParam (Body Parameter) {String} [user.email]         User email valid as username to login. Only by Admin token type
 * @apiParam (Body Parameter) {String} [user.type] type     User type, e.g. admin, cruiser... Only admin token can update user to admin
 * @apiParam (Body Parameter) {String} [user.name]          User first name
 * @apiParam (Body Parameter) {String} [user.surname]       User surname
 * @apiParam (Body Parameter) {String} [application.avatar] User avatar image id in uploadms
 * @apiParam (Body Parameter) {String} [application.notes]  User notes
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 PUT request
 *  Body:{ "name":"nome", "surname":"cognome"}
 *
 * @apiSuccess (200 - OK) {String} UserField_1  field 1 updated and defined in User Schema (e.g. name)
 * @apiSuccess (200 - OK) {String} UserField_2  field 2 updated and defined in User Schema (e.g. surname)
 * @apiSuccess (200 - OK) {String} UserField_N  field N updated and defined in User Schema (e.g. type)
 *
 * @apiSuccessExample {json} Example: 200 OK
 *      HTTP/1.1 200 OK
 *      {
 *        "name":"Micio",
 *        "surname":"Macio",
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiSampleRequest off
 */
router.put('/:id', [jwtMiddle.decodeToken, middlewares.ensureUserIsAdminOrSelf,middlewares.ensureFieldAuthorisedForSomeUsers(comminFunctions.getAdminUsers,["email"],comminFunctions.getRequestBodyUser)], function (req, res) {

    if (!req.body || _.isEmpty(req.body)) {
        return res.status(400).send({error: "BadRequest", error_message: 'request body missing'});
    }

    var id = (req.params.id).toString();

    var newVals;
    try {
        newVals = req.body.user || null; // body already parsed
    } catch (e) {
        return res.status(500).send({error: "update error", error_message: 'no user updated (error:' + e + ')'});
    }


    if(!newVals)
        return res.status(400).send({error: "BadRequest", error_message: 'no mandatory user body field in request'});

    if (newVals.password) {
        return res.status(400).send({
            error: "BadRequest",
            error_message: 'password is not a valid param. You must call reset password API'
        });
    }
    if (newVals.enabled) {
        return res.status(400).send({
            error: "BadRequest",
            error_message: 'enabled or validated is not a valid param. You must call validate API'
        });
    }

    // if (!(conf.adminUser.indexOf(req.User_App_Token.type) >= 0) && newVals.email) {
    //     return res.status(401).send({error: "Forbidden", error_message: 'only admins users can update email'});
    // }

    if (newVals.type) {
        return res.status(400).send({error: "BadRequest", error_message: 'to update User type must use "actions/setusertype/:type" API'});
    }

    updateUser(id,newVals,function(err,updateResults){
        if(err){
            return res.status(err).send(updateResults);
        }else{
            return res.status(200).send(updateResults);
        }
    });


    // User.findOneAndUpdate({_id:id}, newVals, {new: true}, function (err, results) {
    //
    //     try {
    //         if (!err) {
    //             if (results) {
    //                 var tmpU = JSON.parse(JSON.stringify(results));
    //                 delete tmpU['__v'];
    //                 //delete tmpU['_id'];
    //                 res.status(200).send(tmpU);
    //             }
    //             else {
    //                 res.status(404).send({error: "user not found", error_message: 'no user found with specified id'});
    //             }
    //         }
    //         else {
    //             res.status(500).send({error: "internal error", error_message: 'something blew up, ERROR:' + err});
    //         }
    //     }catch (ex){
    //         return res.status(500).send(ex);
    //     }
    // });

});


function updateUser(id,newVals,callback){
    if (newVals.email) {
        updateAuthMsUserName(id,newVals.email,function(err,response){
            if(err){
                return callback(err,response);
            }else{
                upddateUserToDb(id,newVals,function(err,updateResults){
                    if(err){
                        // restore authMS
                        try {
                            var resp=JSON.parse(response);
                            updateAuthMsUserName(id,resp.username.old,function(err,restore){
                                if(err){
                                    return callback(409,{error:"Conflict", error_message:"Inconsistent data between Auth and User due to after an error on User Update, was not possible to restore Auth"});
                                }else{
                                    return callback(err,updateResults);
                                }
                            });
                        }catch (ex) {
                            return callback(500,{error:"InternalServerError", error_message:"Error while update username " + ex});
                        }

                    }else{
                        return callback(null,updateResults);
                    }
                });
            }
        });
    }else{
        upddateUserToDb(id,newVals,function(err,updateResults){
            if(err){
                return callback(err,updateResults);
            }else{
                return callback(null,updateResults);
            }
        });
    }

};


function upddateUserToDb(id,newVals,callback){
    User.findOneAndUpdate({_id:id}, newVals, {new: true}, function (err, results) {

        try {
            if (!err) {
                if (results) {
                    var tmpU = JSON.parse(JSON.stringify(results));
                    delete tmpU['__v'];
                    return callback(null,tmpU);
                }
                else {
                    return callback(404,{error: "user not found", error_message: 'no user found with specified id'});
                }
            }
            else {
                return callback(500,{error: "internal error", error_message: 'something blew up, ERROR:' + err});
            }
        }catch (ex){
            return callback(500,{error: "internal error", error_message: 'something blew up, ERROR:' + ex});
        }
    });
};

function updateAuthMsUserName(id,username,callback){

    var rqparams = {
        url: microserviceBaseURL + "/authuser/" + id + '/actions/setusername/'+username,
        headers: {'Authorization': "Bearer " + microserviceToken}
    };

    request.post(rqparams, function (error, response, body) {
        if (error) {
            return callback(500,{error: 'internal_User_microservice_error', error_message: error + ""});
        } else {
            return callback(null,body);
        }

    });
}

function enableDisable(req, res, value) {

    var id = (req.params.id).toString();

    var rqparams = {
        url: value ? microserviceBaseURL + "/authuser/" + id + '/actions/enable' : microserviceBaseURL + "/authuser/" + id + '/actions/disable',
        headers: {'Authorization': "Bearer " + microserviceToken}
    };

    request.post(rqparams, function (error, response, body) {
        try {
            if (error) {
                return res.status(500).send({error: 'internal_User_microservice_error', error_message: error + ""});
            } else {
                return res.status(201).send(body);
            }
        }catch (ex){
            return res.status(500).send(ex);
        }
    });

}



/**
 * @api {post} /users/:id/actions/resetpassword Reset User password
 * @apiVersion 1.0.0
 * @apiName ResetPassword
 * @apiGroup Users
 *
 * @apiDescription Protected by admin or authorized application and microservices, creates a reset password Token.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (URL Parameter) {String} id    User id or username (email)
 *
 * @apiSuccess (200 - OK) {String} reset_token  access token to set the new password
 *
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "reset_token":"ffewfh5hfdfds7678d6fsdf7d6fsdfd86d8sf6", *
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiSampleRequest off
 */
//router.post('/:id/actions/resetpassword', [middlewares.ensureUserIsAuthAppOrAdmin], function(req, res){
router.post('/:id/actions/resetpassword', [jwtMiddle.decodeToken], function (req, res) {

    var id = (req.params.id).toString();

    async.series([
            function (callback) {
                try {
                    if (id.indexOf("@") >= 0) { // it is an email address
                        if (id.search(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/igm) >= 0) { // it is a valid email address
                            User.findOne({email: id}, function (err, usr) {
                                if (err) return callback({
                                    err_code: 500,
                                    error: 'internal_error',
                                    error_message: err + ""
                                }, 'one');

                                if (_.isEmpty(usr)) return callback({
                                    err_code: 404,
                                    error: 'NotFound',
                                    error_message: "no User found whith " + id + " email"
                                }, 'one');

                                id = usr._id;
                                return callback(null, 'one');
                            });

                        } else { // it isn't a valid email address
                            return callback({
                                err_code: 400,
                                error: 'BadRequest',
                                error_message: "Please fill a valid email address"
                            }, 'one');
                        }
                    } else {// it isn't an email address but search by User id

                        User.findById(id, function (err, usr) {
                            if (err) {
                                if (err.name == 'CastError')
                                    return callback({
                                        err_code: 400,
                                        error: 'BdRequest',
                                        error_message: "Invalid user id or username (email)"
                                    }, 'one');
                                else
                                    return callback({
                                        err_code: 500,
                                        error: 'internal_error',
                                        error_message: err + ""
                                    }, 'one');
                            }

                            if (_.isEmpty(usr)) return callback({
                                err_code: 404,
                                error: 'NotFound',
                                error_message: "no User found whith id " + id
                            }, 'one');

                            return callback(null, 'one');
                        });
                    }
                }catch (ex){
                    return callback({
                        err_code: 500,
                        error: 'Internal Server Error',
                        error_message: ex
                    }, 'one');
                }
            }
        ],
        function (err, results) {
            try {
                if (err) {
                    return res.status(err.err_code).send({error: err.error, error_message: err.error_message + ""});
                } else {
                    var rqparams = {
                        url: microserviceBaseURL + "/authuser/" + id + '/actions/resetpassword',
                        headers: {'Authorization': "Bearer " + microserviceToken}
                    };

                    request.post(rqparams, function (error, response, body) {
                        if (error) {
                            return res.status(500).send({
                                error: 'internal_User_microservice_error',
                                error_message: error + ""
                            });
                        } else {
                            return res.status(200).send(body);
                        }
                    });
                }
            }catch (ex){
                return res.status(500).send(ex);
            }
        });
});



/**
 * @api {post} /users/:id/actions/setpassword Set new User password
 * @apiVersion 1.0.0
 * @apiName SetPassword
 * @apiGroup Users
 *
 * @apiDescription Protected by access_token, updates the user password. To call this endpoint, you must have a reset_token (used with authorized app or admin token) or must be the User itself.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (URL Parameter)  {String} id               User id or username (email)
 * @apiParam (Body Parameter) {String} [oldpassword]    Old password to update. If set, reset_token must be undefined
 * @apiParam (Body Parameter) {String} newpassword      New password
 * @apiParam (Body Parameter) {String} [reset_token]    Token used to update password. If set, oldpassword must be undefined
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET request
 *  Body:{ "oldpassword": "prova" , "newpassword":"provami"}
 *
 * @apiSuccess (200 - OK) {Object} access_credentials                       information about access credentials.
 * @apiSuccess (200 - OK) {Object} access_credentials.apiKey                information about apiKey
 * @apiSuccess (200 - OK) {String} access_credentials.apiKey.token          user Token
 * @apiSuccess (200 - OK) {String} access_credentials.apiKey.expires        token expiration date
 * @apiSuccess (200 - OK) {Object} access_credentials.refreshToken          information about refreshToken used to renew token
 * @apiSuccess (200 - OK) {String} access_credentials.refreshToken.token    user refreshToken
 * @apiSuccess (200 - OK) {String} access_credentials.refreshToken.expires  refreshToken expiration date
 * @apiSuccess (200 - OK) {String} access_credentials.userId                user id
 *
 * @apiSuccessExample {json} Example: 200 OK
 *      HTTP/1.1 200 OK
 *      {
 *        "access_credentials":{
 *                 "apiKey":{
 *                         "token":"VppR5sHU_hV3U",
 *                         "expires":1466789299072
 *                  },
 *                  "refreshToken":{
 *                          "token":"eQO7de4AJe-syk",
 *                          "expires":1467394099074
 *                   },
 *                   "userId":"343242354FDGH%"
 *        }
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiSampleRequest off
 */
router.post('/:id/actions/setpassword', [jwtMiddle.decodeToken], function (req, res) {

    if (!req.body) return res.status(400).send({error: "BadREquest", error_message: 'request body missing'});

    var oldpassword = req.body.oldpassword || null;
    var newpassword = req.body.newpassword || null;
    var reset_token = req.body.reset_token || null;

    if (!oldpassword && !reset_token) {
        return res.status(400).send({error: 'BadRequest', error_message: "No oldpassword o reset_token provided"});
    }

    if (oldpassword && reset_token) {
        return res.status(400).send({error: 'BadRequest', error_message: "Use oldpassword or reset_token"});
    }
    if (!newpassword) return res.status(400).send({error: 'BadREquest', error_message: "No newpassword provided"});

    var id = (req.params.id).toString();
    var tmpbody;

    async.series([
            function (callback) {
                try {
                    if (id.indexOf("@") >= 0) { // id is an email address
                        if (id.search(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/igm) >= 0) { // id is a valid email address
                            User.findOne({email: id}, function (err, usr) {
                                if (err) callback({
                                    err_code: 500,
                                    error: 'internal_error',
                                    error_message: err + ""
                                }, 'one');

                                if (!usr) callback({
                                    err_code: 404,
                                    error: 'NotFound',
                                    error_message: "no User found whith " + id + " email"
                                }, 'one');

                                id = usr._id;
                                callback(null, 'one');
                            });

                        } else { // id isn't a valid email address
                            callback({
                                err_code: 400,
                                error: 'BadRequest',
                                error_message: "Please fill a valid email address"
                            }, 'one');
                        }
                    } else {
                        callback(null, 'one'); // id isn't an email address but a user id
                    }
                }catch (ex){
                    return callback({
                        err_code: 500,
                        error: 'Internal Server Error',
                        error_message: ex
                    }, 'one');
                }
            },
            function (callback) {
                try {
                    if (oldpassword) {
                        if (id == req.User_App_Token._id) {
                            tmpbody = {
                                oldpassword: oldpassword,
                                newpassword: newpassword
                            };
                            callback(null, 'two');
                        } else {
                            callback({
                                err_code: 401,
                                error: "Forbidden",
                                error_message: 'you are not authorized to access this resource'
                            });

                        }
                    } else {

                        var rqparams = {
                            url: microserviceBaseURL + "/tokenactions/gettokentypelist",
                            headers: {'Authorization': "Bearer " + microserviceToken}
                        };

                        request.get(rqparams, function (error, response, body) {

                            try {
                                if (error) {
                                    callback({
                                        error: 'internal_User_microservice_error',
                                        error_message: error + ""
                                    }, "two");

                                } else {
                                    var appT = JSON.parse(body).user;
                                    // if is admin user or ms (user itself can not reset password with reset_token but only by oldpassword. to eset password user itself do it by app or Admin token)
                                    if (_.without(appT, conf.adminUser).indexOf(req.User_App_Token.type) >= 0) {
                                        callback({
                                            err_code: 401,
                                            error: "Forbidden",
                                            error_message: 'you are not authorized to access this resource'
                                        }, "two");
                                    } else {
                                        tmpbody = {
                                            reset_token: reset_token,
                                            newpassword: newpassword
                                        };
                                        callback(null, 'two');
                                    }
                                }
                            }catch (ex){
                                callback({
                                    error: 'InternalError',
                                    error_message:ex
                                }, "two");
                            }
                        });
                    }
                }catch (ex){
                    return callback({
                        err_code: 500,
                        error: 'Internal Server Error',
                        error_message: ex
                    }, 'two');
                }
            }
        ],
        function (err, results) {
            try {
                if (err) {
                    return res.status(err.err_code).send({error: err.error, error_message: err.error_message + ""});
                } else {
                    var rqparams = {
                        url: microserviceBaseURL + "/authuser/" + id + '/actions/setpassword',
                        headers: {'Authorization': "Bearer " + microserviceToken, 'content-type': 'application/json'},
                        body: JSON.stringify(tmpbody)
                    };

                    request.post(rqparams, function (error, response, body) {

                        try {
                            if (error) {
                                return res.status(500).send({
                                    error: 'internal_User_microservice_error',
                                    error_message: error + ""
                                });
                            } else {
                                var parsedBody = JSON.parse(body);
                                if (parsedBody.error) {
                                    return res.status(response.statusCode).send(parsedBody);
                                } else {
                                    return res.status(201).send({"access_credentials": JSON.parse(body)});
                                }
                            }
                        }catch (ex){
                            return res.status(500).send(ex);
                        }
                    });
                }
            }catch (ex){
                return res.status(500).send(ex);
            }
        });

});


/**
 * @api {post} /users/:id/actions/changeuserid Change Username (email)
 * @apiVersion 1.0.0
 * @apiName ChangeUserId
 * @apiGroup Users
 * @apiDeprecated use now (#Users:ChangeUsername).
 *
 * @apiDescription Protected by admin access token, updates a user username (email). Only for Admin users
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (URL Parameter) {String} id        User id or username (email)
 * @apiParam (Body Parameter) {String} email    The new username (email)
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET request
 *  Body:{ "email": "prov@prova.it"}
 *
 * @apiSuccess (200- OK) {Object} user  dictionary with new updated username(email)
 *
 * @apiSuccessExample {json} Example: 200 OK
 *      HTTP/1.1 200 OK
 *      {
 *        "name":"Micio",
 *        "surname":"Macio",
 *        "email": "prov@prova.it"
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiSampleRequest off
 */
router.post('/:id/actions/changeuserid', [jwtMiddle.decodeToken, middlewares.ensureUserIsAdminOrSelf,middlewares.ensureFieldAuthorisedForSomeUsers(comminFunctions.getAdminUsers,["email"],comminFunctions.getRequestBody)], function (req, res, next) {

    var id = (req.params.id).toString();
    req.url = "/" + id;

    if(!req.body || !req.body.email)
        return res.status(400).send({error:"BadRequest", error_message:"no email field in body. email are mandatory"});

    req.fastForward=conf.fastForwardPsw;

    var body = {user: {email:req.body.email}};
    req.body = body;


    req.method = "PUT";
    try {
        router.handle(req, res, next);
    } catch (ex) {
        res.status(500).send({error: "InternalError", error_message: ex.toString()});
    }

});


/**
 * @api {post} /users/:id/actions/changeusername Change Username (email)
 * @apiVersion 1.0.0
 * @apiName ChangeUsername
 * @apiGroup Users
 *
 * @apiDescription Protected by admin access token, updates a user username (email). Only for Admin users
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (URL Parameter) {String} id        User id or username (email)
 * @apiParam (Body Parameter) {String} email    The new username (email)
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET request
 *  Body:{ "email": "prov@prova.it"}
 *
 * @apiSuccess (200- OK) {Object} user  dictionary with new updated username(email)
 *
 * @apiSuccessExample {json} Example: 200 OK
 *      HTTP/1.1 200 OK
 *      {
 *        "name":"Micio",
 *        "surname":"Macio",
 *        "email": "prov@prova.it"
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiSampleRequest off
 */
router.post('/:id/actions/changeusername', [jwtMiddle.decodeToken,middlewares.ensureUserIsAdminOrSelf,middlewares.ensureFieldAuthorisedForSomeUsers(comminFunctions.getAdminUsers,["email"],comminFunctions.getRequestBody)], function (req, res, next) {

    var id = (req.params.id).toString();
    req.url = "/" + id;

    if(!req.body || !req.body.email)
        return res.status(400).send({error:"BadRequest", error_message:"no email field in body. email are mandatory"});

    req.fastForward=conf.fastForwardPsw;

    var body = {user: {email:req.body.email}};
    req.body = body;

    req.method = "PUT";
    try {
        router.handle(req, res, next);
    } catch (ex) {
        res.status(500).send({error: "InternalError", error_message: ex.toString()});
    }

});





/**
 * @api {post} /users/:id/actions/setusertype/:type Set or update User type
 * @apiVersion 1.0.0
 * @apiName set or update User type
 * @apiGroup Users
 *
 * @apiDescription Protected by access token, set or update User type.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (URL parameter) {String} id    The User id
 * @apiParam (URL parameter) {String} type  The User type to set
 *
 * @apiSuccess (200 - OK) {String} User.id   The User id
 * @apiSuccess (200 - OK) {String} User.tye   The new User type
 *
 * @apiSuccessExample {json} Example: 200 OK
 *      HTTP/1.1 200 OK
 *      {
 *        "id":"02550564065",
 *        "type":"admin"
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiSampleRequest off
 */
router.post('/:id/actions/setusertype/:type', [jwtMiddle.decodeToken], function (req, res) {
    "use strict";

    var id = req.params.id;
    var userType = req.params.type;

    var rqparams = {
        url: microserviceBaseURL + "/authuser/" + id + '/actions/setusertype/' + userType,
        headers: {'Authorization': "Bearer " + microserviceToken}
    };

    request.post(rqparams).pipe(res);

    // request.post(rqparams, function (error, response, body) {
    //     try {
    //         if (error) {
    //             return res.status(500).send({error: 'internal_User_microservice_error', error_message: error + ""});
    //         } else {
    //             return res.status(200).send(body);
    //         }
    //     }catch (ex){
    //         return res.status(500).send(ex);
    //     }
    // });
    // }
});



/**
 * @api {post} /users/:id/actions/enable Enable User
 * @apiVersion 1.0.0
 * @apiName EnableUser
 * @apiGroup Users
 *
 * @apiDescription Protected by admin access token, enables the user.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (URL Parameter) {String} id    The user id
 *
 * @apiSuccess (200 - OK) {String} status  the new user status
 *
 * @apiSuccessExample {json} Example: 200 OK
 *      HTTP/1.1 200 OK
 *      {
 *        "status":"enabled"
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiSampleRequest off
 */
router.post('/:id/actions/enable', [jwtMiddle.decodeToken], function (req, res) {
    enableDisable(req, res, true);
});



/**
 * @api {post} /users/:id/actions/disable Disable User
 * @apiVersion 1.0.0
 * @apiName Disable User
 * @apiGroup Users
 *
 * @apiDescription Protected by admin access tokens, disables the user.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same  token sent in Authorization header should be undefined
 * @apiParam (URL Parameter) {String} id    The user id
 *
 * @apiSuccess (201 - Created) {String} status  the new user status
 *
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "status":"disabled"
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiSampleRequest off
 */
router.post('/:id/actions/disable', [jwtMiddle.decodeToken], function (req, res) {
    enableDisable(req, res, false);
});



/**
 * @api {delete} /users/:id Delete User
 * @apiVersion 1.0.0
 * @apiName Delete User
 * @apiGroup Users
 *
 * @apiDescription Protected by admin access token, deletes the User and returns the deleted resource.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same  token sent in Authorization header should be undefined
 * @apiParam (URL Parameter) {String} id    The user id
 *
 * @apiSuccess (204 - NO CONTENT) {String} UserField_1  field 1 updated and defined in User Schema (e.g. name)
 * @apiSuccess (204 - NO CONTENT) {String} UserField_2  field 2 updated and defined in User Schema (e.g. surname)
 * @apiSuccess (204 - NO CONTENT) {String} UserField_N  field N updated and defined in User Schema (e.g. type)
 *
 * @apiSuccessExample {json} Example: 204 NO CONTENT
 *      HTTP/1.1 204 NO CONTENT
 *      {
 *        "name":"Micio",
 *        "surname":"Macio",
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiSampleRequest off
 */
router.delete('/:id', [jwtMiddle.decodeToken], function (req, res) {

    var id = (req.params.id).toString();

    var rqparams = {
        url: microserviceBaseURL + "/authuser/" + id,
        headers: {'Authorization': "Bearer " + microserviceToken}
    };

    request.delete(rqparams, function (error, response, body) {
        try {
            if (error) {
                return res.status(500).send({error: 'internal_User_microservice_error', error_message: error + ""});
            } else {
                User.findOneAndRemove({_id: id}, function (err, results) {
                    if (!err) {
                        if (results) {
                            return res.status(204).send({deleted_resource: results});
                        }
                        else
                            return res.status(404).send({
                                error: "NotFound",
                                error_message: 'no user found with specified id'
                            });
                    }
                    else {
                        return res.status(500).send({
                            error: "internal_error",
                            error_message: 'something blew up, ERROR:' + err
                        });
                    }
                });
            }
        }catch (ex){
            return res.status(500).send(ex);
        }
    });
});

/**
 * @api {get} /actions/email/find/:term Search all Users
 * @apiVersion 1.0.0
 * @apiName Search user by email
 * @apiGroup Users
 * @apiDeprecated use now (#Users:Search Users).
 *
 * @apiDescription Protected by admin access token, returns the paginated list of all Users matching the search term
 * Set pagination skip and limit, in the URL request, e.g. "get /users?skip=10&limit=50"
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same  token sent in Authorization header should be undefined
 * @apiParam (URL Parameter)    {String} term   (URL Param)     Query string
 * @apiParam (Query Parameter)  {String} skip   (Query param)   Pagination start
 * @apiParam (Query Parameter)  {String} limit  (Query param)   Number of elements
 *
 * @apiUse Metadata
 * @apiUse GetResource
 * @apiUse GetResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 */
router.get('/actions/email/find/:term', [jwtMiddle.decodeToken], function (req, res) {

    return util.deprecate( function() {
        var term = req.params.term,
            size = req.query.size ? parseInt(req.query.size) : 10,
            query = {},
            sortParams = {};

        if (!term) return res.json({'status': true, err: 1, 'message': 'term not found', data: [],'warning':'actions/email/find/:term route is deprecated. Use /actions/search route instead'});

        query.email = new RegExp(term, 'i');

        User.find(query, null, {
            limit: size,
            sort: sortParams
        }, function (err, data) {
            try {
                if (err) return res.json({'status': false, 'err': err,'warning':'actions/email/find/:term route is deprecated. Use /actions/search route instead'});

                return res.json({status: true, data: data,'warning':'actions/email/find/:term route is deprecated. Use /actions/search route instead'});
            }catch (ex){
                return res.status(500).send({error:"InternalError", error_message: ex,'warning':'actions/email/find/:term route is deprecated. Use /actions/search route instead'});
            }
        });
    },'actions/email/find/:term route is deprecated. Use /actions/search route instead.')();


});




/**
 * @api {post} /users//actions/search Search all Users
 * @apiVersion 1.0.0
 * @apiName Search Users
 * @apiGroup Users
 *
 * @apiDescription Protected by admin access token, returns a list of all Users that match a search terms.
 * If you need a filter by _id you can done it by set field 'usersId'. usersId field can be in ObjectId on a ObjectId array.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in query param must be undefined
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as query param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (body Parameter) {Object} searchterm                   Object containing search terms
 * @apiParam (body Parameter) {Array} [searchterm.type]             Array of strings containing user type filter. If filter is not set, user type information are not available in search results. If user type filter is not needed but user type information are, set type to ["all"]
 * @apiParam (body Parameter) {String} [searchterm.UserField_1]     String containing a filter on user field "UserField_1", e.g. UserField_1 : "UserField_1_Substring"
 * @apiParam (body Parameter) {String} [searchterm.UserField_2]     String containing a filter on user field "UserField_2", e.g. UserField_2 : "UserField_2_Substring"
 * @apiParam (body Parameter) {String} [searchterm.UserField_3]     String containing a filter on user field "UserField_3", e.g. UserField_3 : "UserField_1_Substring"
 * @apiParam (body Parameter) {Array} fields Array of strings containing the name of all the user fields that must be returned
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST request
 *  Body:{ "searchterm":{"email": "@prova.it" , "type":"crocierista"}, fields:["name","surname"]}
 * @apiUse Metadata
 * @apiUse GetResource
 * @apiUse GetResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse ServerError
 */


router.post('/actions/search', [jwtMiddle.decodeToken], function (req, res,next) {



    if (!req.body) return res.status(400).send({error: "BadRequest", error_message: "body missing"});
    if (!req.body.searchterm) return res.status(400).send({error: "BadRequest", error_message: "mandatory 'searchterm' body param not found"});

    if (req.body.fields && !(Array.isArray(req.body.fields)) ) return res.status(400).send({
        error: "BadRequest",
        error_message: "field param must be an array"
    });


    var fields = req.body.fields;

    if (!fields)
        fields = '-hash -salt -__v';
    else
        fields = fields.join(" ");



    var searchterm=req.body.searchterm;



    var query = {};

    var ids=(searchterm.usersId) || null;

    if(ids) {
        if (_.isArray(ids)) { //is an array
            query._id={ "$in": ids };
        } else {
            query._id=ids;
        }
    }



    for (var v in searchterm) {
        if (User.schema.path(v)) {
            query[v] = new RegExp(searchterm[v], 'i');
        }
    }




    var typeOption=query.type || searchterm.type || null;
    if(typeOption){
        if(!_.isArray(typeOption))
            return res.status(400).send({
                error: "BadRequest",
                error_message: "field searchterm.type must be an array"
            });
        delete query.type;

    }


    User.find(query, fields, function(err, results){

        try {
            if (!err) {

                if (results) {
                    var responseResults={users:results,_metadata:{totalCount:results.length, skip:-1,limit:-1}};

                    if (typeOption && (responseResults._metadata.totalCount>0))
                        upgradeUserInfo(res, responseResults,typeOption);
                    else
                        res.status(200).send(responseResults);
                }
                else
                    res.status(204).send();
            }
            else {
                res.status(500).send({error: 'internal_error', error_message: 'something blew up, ERROR:' + err});
            }
        }catch (ex){
            return res.status(500).send({error: 'internal_error', error_message: 'something blew up, ERROR:' + ex});
        }
    });

});





function upgradeUserInfo(res, results,type){


    // get usersId
    var ids=_.map(results.users,function(element){
        return element.id;
    });


    //make a request to authMs
    var rqparams = {
        url: microserviceBaseURL + "/authuser/actions/ids/find",
        headers: {'Authorization': "Bearer " + microserviceToken, 'content-type': 'application/json'},
        body: JSON.stringify({ids:ids,fields:["type"]})
    };

    request.post(rqparams, function (error, response, body) {

        try {
            if (error) {
                return res.status(500).send({
                    error: 'InternalError',
                    error_message: error + ""
                });
            } else {

                var parsedBody = JSON.parse(body);
                if (parsedBody.error) {
                    return res.status(response.statusCode).send(parsedBody);
                } else {

                    var authUserResults= JSON.parse(body);

                    if(authUserResults._metadata.totalCount>0 && (authUserResults._metadata.totalCount==results._metadata.totalCount)){
                        var usersList=array_merge("_id", JSON.parse(JSON.stringify(results.users)),authUserResults.users);

                        type=type.map(function(val){
                           return val.toLowerCase();
                        });

                        if(type[0]!='all'){
                            usersList=_.filter(usersList, function(currentUser){
                                return (type.indexOf(currentUser.type.toLowerCase())>=0);
                            });
                        }

                        results.users=usersList;
                        results._metadata.totalCount=usersList.length;
                        return res.status(200).send(results);
                    }else{
                        return res.status(409).send({
                            error: 'conflict',
                            error_message: "Inconsistent User Data between userms and authms"
                        });
                    }
                }
            }
        }catch (ex){
            return res.status(500).send({
                error: 'InternalError',
                error_message: ex + ""
            });
        }
    });
}


module.exports = router;