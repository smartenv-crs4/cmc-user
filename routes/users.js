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

var microserviceBaseURL=conf.authProtocol + "://" + conf.authHost + ":" + conf.authPort;
var microserviceTokem=conf.auth_token;

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


/**
 * @api {post} /users/signup Register a new User
 * @apiVersion 1.0.0
 * @apiName Sign Up User
 * @apiGroup Users
 *
 * @apiDescription Accessible by access tokens of type specified in "SignUpAuthorizedAppAndMS" field in config.js. Creates a new User object and returns the access credentials.
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String} user the user dictionary with all the fields. Email, password and type are mandatory
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST request
 *  Body:{ "email": "prov@prova.it" , "password":"provami", "type":"crocierista", "name":"nome", "surname":"cognome"}
 *
 * @apiSuccess (201 - CREATED) {Object} access_credentials  contains information about access credentials
 * @apiSuccess (201 - CREATED) {Object} access_credentials.apiKey  contains information about apiKey
 * @apiSuccess (201 - CREATED) {String} access_credentials.apiKey.token  user Token
 * @apiSuccess (201 - CREATED) {String} access_credentials.apiKey.expires  token expiration date
 * @apiSuccess (201 - CREATED) {Object} access_credentials.refreshToken  contains information about refreshToken used to renew token
 * @apiSuccess (201 - CREATED) {String} access_credentials.refreshToken.token  user refreshToken
 * @apiSuccess (201 - CREATED) {String} access_credentials.refreshToken.expires  refreshToken expiration date
 * @apiSuccess (201 - CREATED) {Object} Created_resource contains the created User resource
 * @apiSuccess (201 - CREATED) {String} Created_resource.UserField_1  field 1 defined in User Schema (e.g. name)
 * @apiSuccess (201 - CREATED) {String} Created_resource.UserField_2  field 2 defined in User Schema (e.g. surname)
 * @apiSuccess (201 - CREATED) {String} Created_resource.UserField_N  field N defined in User Schema (e.g. type)
 *
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "created_resource":{
 *                 "name":"Micio",
 *                 "email":"mario@caport.com",
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
 */
//router.post('/signup',[middlewares.ensureUserIsAuthAppOrAdmin] ,function(req, res){
router.post('/signup',[jwtMiddle.decodeToken],function(req, res){

    //console.log("USER SIGNUP " + conf.SignUpAuthorizedAppAndMS);
    // if(req.user.valid){ //if ot valid retuen in jwtaut midleware
    //  if(conf.SignUpAuthorizedAppAndMS.indexOf(req.User_App_Token.type)>=0 ){ // se il token è di un app che può fare login

    if (!req.body || _.isEmpty(req.body))  return res.status(400).send({
        error: "no_body",
        error_message: 'request body missing'
    });

    //console.log("signUp request user body"+JSON.stringify(req.body.user));
    var user = req.body.user;
    //var password = req.body.user.password;

    if (!user) return res.status(400).send({error: 'BadRequest', error_message: "No user provided"});

    if((conf.adminUser.indexOf(user.type)>=0) && (!(conf.adminUser.indexOf(req.User_App_Token.type)>=0)))//to create admin user use a post
        return res.status(401).send({error: 'NotAuthorized', error_message : "Only Admin User can SignUp admin users"});

    //if (!password) return res.status(400).send({error: 'no password sent', error_message : "No password provided"});
    //delete user['password'];
    //registra l'utente sul microservizio autenticazione
    //console.log("signUp request user body"+JSON.stringify(user));


    var loginUser={
        "email":user.email,
        "password":user.password,
        "type":user.type
    };

    var rqparams = {
        url: microserviceBaseURL + '/authuser/signup',
        headers: {'Authorization': "Bearer " + microserviceTokem, 'content-type': 'application/json'},
        body: JSON.stringify({user: loginUser})
    };

    //console.log("signUp request param"+JSON.stringify(rqparams));
    request.post(rqparams, function (error, response, body) {

        if (error) {
            return res.status(500).send({error: 'internal_microservice_error', error_message: error + ""});
        } else {

            console.log("signUp response body" + body);
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
                                headers: {'Authorization': "Bearer " + microserviceTokem}
                            };

                            request.delete(rqparams, function (error, response, body) {
                                if (error)
                                    console.log("inconsistent data");
                                //TODO se in seguito ad una creazione utente non andat a buon fine l'eliminazione dell utente sul microservizio auth non va a buon fine si hanno dati inconsistenti

                            });
                            return res.status(500).send({error: 'internal_Error', error_message: err});

                        } else {
                            var tmpU = JSON.parse(JSON.stringify(newUser));
                            console.log("new user:" + util.inspect(tmpU));
                            delete tmpU['__v'];
                            //delete tmpU['_id'];
                            return res.status(201).send({"created_resource": tmpU, "access_credentials": loginToken});
                        }
                    });
                } catch (ex) {
                    //console.log("ECCCEPTIO "+ ex);
                    rqparams = {
                        url: microserviceBaseURL + '/authuser/' + user._id,
                        headers: {'Authorization': "Bearer " + microserviceTokem}
                    };
                    request.delete(rqparams, function (error, response, body) {
                        if (error)
                            console.log("inconsistent data");
                        //TODO se in seguito ad una creazione utente non andat a buon fine l'eliminazione dell utente sul microservizio auth non va a buon fine si hanno dati inconsistenti

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
    });

    //} else{
    //   res.status(401).send({error: "invalid_token", error_description: "Unauthorized: The access token is not valid to access the resource. Use access_token of this type:" + conf.SignUpAuthorizedAppAndMS});
    //}
    //}else{
    //    res.status(401).send({error: "invalid_token", error_description:req.user.error_description });
    //}

});



/**
 * @api {post} /users/signin User login
 * @apiVersion 1.0.0
 * @apiName Login User
 * @apiGroup Users
 *
 * @apiDescription Accessible by access tokens of type specified in "SignInAuthorizedAppAndMS" field in config.js. Logs in the User and returns the access credentials.
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String} username the user email
 * @apiParam {String} password the user password
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST request
 *  Body:{ "username": "prov@prova.it" , "password":"provami"}
 *
 * @apiSuccess (200 - OK) {Object} access_credentials  contains information about access credentials.
 * @apiSuccess (200 - OK) {Object} access_credentials.apiKey  contains information about apiKey
 * @apiSuccess (200 - OK) {String} access_credentials.apiKey.token  user Token
 * @apiSuccess (200 - OK) {String} access_credentials.apiKey.expires  token expiration date
 * @apiSuccess (200 - OK) {Object} access_credentials.refreshToken  contains information about refreshToken used to renew token
 * @apiSuccess (200 - OK) {String} access_credentials.refreshToken.token  user refreshToken
 * @apiSuccess (200 - OK) {String} access_credentials.refreshToken.expires  refreshToken expiration date
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
 *        }
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse ServerError
 * @apiUse InvalidUserAndPassword
 */
//router.post('/signin',[middlewares.ensureUserIsAuthAppSignIn] ,function(req, res){
router.post('/signin', [jwtMiddle.decodeToken], function (req, res) {

    // if(req.user.valid){ //if ot valid retuen in jwtaut midleware
    //  if(conf.SignUpAuthorizedAppAndMS.indexOf(req.User_App_Token.type)>=0 ){ // se il token è di un app che può fare login

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
        headers: {'Authorization': "Bearer " + microserviceTokem, 'content-type': 'application/json'},
        body: JSON.stringify({username: username, password: password})
    };

    request.post(rqparams, function (error, response, body) {

        if (error) {
            return res.status(500).send({error: 'internal_microservice_error', error_message: error + ""});
        } else {

            console.log("signUp response body" + body);
            var loginToken = JSON.parse(body);

            if (!loginToken.error) { // ho un token valido
                return res.status(200).send({"access_credentials": loginToken});
            }
            else  return res.status(response.statusCode).send(loginToken);
        }
    });

});



/**
 * @api {get} /users/ Get all Users
 * @apiVersion 1.0.0
 * @apiName Get User
 * @apiGroup Users
 *
 * @apiDescription Accessible by admin user access tokens specified "adminUser" field in config.js. Returns the paginated list of all Users.
 * Set pagination skip and limit in the URL request, e.g. "get /users?skip=10&limit=50"
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String} UserField_1 query field 2 used to set filter, e.g. name = "User Name"
 * @apiParam {String} UserField_2 query field 2 used to set filter, e.g. Filed2 = "Field Value"
 * @apiParam {String} UserField_N query field N used to set filter, e.g. Field3 = "Field Value"
 *
 * @apiUse Metadata
 * @apiUse GetResource
 * @apiUse GetResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 */

//router.get('/', [middlewares.ensureUserIsAdmin], function(req, res) {
router.get('/', [jwtMiddle.decodeToken], function (req, res) {

    //given an authenticated user (by token)
    //console.log(req);

    var fields = req.dbQueryFields;
    if (!fields)
        fields = '-hash -salt -__v';

    var query = {};

    for (var v in req.query)
        if (User.schema.path(v))
            query[v] = req.query[v];

        User.findAll(query, fields, req.dbPagination, function(err, results){

        if(!err){

            if (results)
                res.status(200).send(results);
            else
                res.status(204).send();
        }
        else {
            res.status(500).send({error: 'internal_error', error_message: 'something blew up, ERROR:' + err});
        }
    });
});


/**
 * @api {post} /users/ Register a new User
 * @apiVersion 1.0.0
 * @apiName Create User
 * @apiGroup Users
 *
 * @apiDescription Accessible by access tokens of admin type. Creates a new User object and returns the access credentials.
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String} user the user dictionary with all the fields. Email, password and type are mandatory
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST request
 *  Body:{ "email": "prov@prova.it" , "password":"provami", "type":"crocierista", "name":"nome", "surname":"cognome"}
 *
 * @apiSuccess (201 - CREATED) {Object} access_credentials  contains information about access credentials
 * @apiSuccess (201 - CREATED) {Object} access_credentials.apiKey  contains information about apiKey
 * @apiSuccess (201 - CREATED) {String} access_credentials.apiKey.token  user Token
 * @apiSuccess (201 - CREATED) {String} access_credentials.apiKey.expires  token expiration date
 * @apiSuccess (201 - CREATED) {Object} access_credentials.refreshToken  contains information about refreshToken used to renew token
 * @apiSuccess (201 - CREATED) {String} access_credentials.refreshToken.token  user refreshToken
 * @apiSuccess (201 - CREATED) {String} access_credentials.refreshToken.expires  refreshToken expiration date
 * @apiSuccess (201 - CREATED) {Object} Created_resource  contains the created User resourcce
 * @apiSuccess (201 - CREATED) {String} Created_resource.UserField_1  field 1 defined in User Schema (e.g. name)
 * @apiSuccess (201 - CREATED) {String} Created_resource.UserField_2  field 2 defined in User Schema (e.g. surname)
 * @apiSuccess (201 - CREATED) {String} Created_resource.UserField_N  field N defined in User Schema (e.g. type)
 *
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "created_resource":{
 *                 "name":"Micio",
 *                 "email":"mario@caport.com",
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
 */
//router.post('/',[middlewares.ensureUserIsAdmin], function(req, res) {   //FIXME: replace with signup???
router.post('/', [jwtMiddle.decodeToken], function (req, res) {   //FIXME: replace with signup???
                                                                  //Authorized just admins

    // if(req.user.valid){ //if ot valid retuen in jwtaut midleware
    //  if(conf.SignUpAuthorizedAppAndMS.indexOf(req.User_App_Token.type)>=0 ){ // se il token è di un app che può fare login

    if (!req.body || _.isEmpty(req.body))  return res.status(400).send({
        error: "BadRequest",
        error_message: 'request body missing'
    });

    //console.log("signUp request user body"+JSON.stringify(req.body.user));
    var user = req.body.user;
    //var password = req.body.user.password;

    if (!user) return res.status(401).send({error: 'no user sent', error_message: "No username provided"});
    //if (!password) return res.status(400).send({error: 'no password sent', error_message : "No password provided"});
    //delete user['password'];

    //registra l'utente sul microservizio autenticazione
    //console.log("signUp request user body"+JSON.stringify(user));

    comminFunctions.createUserAsAdmin(user, function (err, status_code, json) {

        return res.status(status_code).send(json);

    });

});



/**
 * @api {get} /users/:id Get the User by id
 * @apiVersion 1.0.0
 * @apiName GetUser
 * @apiGroup Users
 *
 * @apiDescription Accessible by admin access tokens or by the user itself. Returns the info about a User.
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String} id the user id or username (email)
 *
 * @apiSuccess {String} user.id User id
 * @apiSuccess {String} user.field1 fiend 1 defined in schema
 * @apiSuccess {String} user.field2 fiend 2 defined in schema
 * @apiSuccess {String} user.fieldN fiend N defined in schema
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
    //TODO: must be changed to return only authorized users
    //given an authenticated user (by token)

    console.log("################################# get /:ID");

    var fields = req.dbQueryFields;
    if (!fields)
        fields = '-hash -salt -__v';

    var id = (req.params.id).toString();

    User.findById(id, fields, function(err, results){
        if(!err){
                res.send(results);
        }
        else {
            if (results === {} || results === undefined)   res.status(404).send({
                error: 'notFound',
                error_message: 'user not found'
            });
            else res.status(500).send({error: 'internal_error', error_message: 'something blew up, ERROR:' + err});
        }
    });

});



/**
 * @api {put} /users/:id Update User
 * @apiVersion 1.0.0
 * @apiName Update User
 * @apiGroup Users
 *
 * @apiDescription Accessible by admin access tokens or by the user itself. Creates a new User object and returns the updated resource.
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String-URL} id the user id or username (email)
 * @apiParam {Object} user the user dictionary with all the fields to update. Email (username) field can be updated only by admin token; for password there is a dedicated endpoint; user type cannot be updated
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
 */
router.put('/:id', [jwtMiddle.decodeToken, middlewares.ensureUserIsAdminOrSelf], function (req, res) {

    if (!req.body || _.isEmpty(req.body)) {
        return res.status(400).send({error: "BadRequest", error_message: 'request body missing'});
    }

    var id = (req.params.id).toString();

    var newVals;
    try {
        newVals = req.body.user; // body already parsed
    } catch (e) {
        res.status(500).send({error: "update error", error_message: 'no user updated (error:' + e + ')'});
    }
    if (newVals.password) {
        return res.status(400).send({
            error: "BadRequest",
            error_message: 'password is not a valid param. You must call reset pasword enpoint'
        });
    }
    if (newVals.enabled) {
        return res.status(400).send({
            error: "BadRequest",
            error_message: 'enabled or validated is not a valid param. You must call validate enpoint'
        });
    }
    if (!(conf.adminUser.indexOf(req.User_App_Token.type) >= 0) && newVals.email) {
        return res.status(401).send({error: "Forbidden", error_message: 'only admins users can update email'});
    }

    User.findOneAndUpdate({_id:id}, newVals, {new: true}, function (err, results) {

        if (!err) {
            if (results) {
                var tmpU = JSON.parse(JSON.stringify(results));
                console.log("new user:" + util.inspect(tmpU));
                delete tmpU['__v'];
                //delete tmpU['_id'];
                    res.status(200).send(tmpU);
            }
            else {
                res.status(404).send({error: "user not found", error_message: 'no user found with specified id'});
            }
        }
        else {
            res.status(500).send({error: "internal error", error_message: 'something blew up, ERROR:' + err});
        }
    });

});


function enableDisable(req, res, value) {

    var id = (req.params.id).toString();

    var rqparams = {
        url: value ? microserviceBaseURL + "/authuser/" + id + '/actions/enable' : microserviceBaseURL + "/authuser/" + id + '/actions/disable',
        headers: {'Authorization': "Bearer " + microserviceTokem}
    };

    console.log(util.inspect(rqparams));

    request.post(rqparams, function (error, response, body) {

        if (error) {
            return res.status(500).send({error: 'internal_User_microservice_error', error_message: error + ""});
        } else {
            return res.status(201).send(body);
        }
    });

}



/**
 * @api {post} /users/:id/actions/resetpassword Reset User password
 * @apiVersion 1.0.0
 * @apiName ResetPassword
 * @apiGroup Users
 *
 * @apiDescription Accessible by admin or AuthApp access tokens define in config.js. Creates a reset password Token.
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String} id the user id or username (email)
 *
 * @apiSuccess (200 - OK) {String} reset_token  grant token to set the new password
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
 */
//router.post('/:id/actions/resetpassword', [middlewares.ensureUserIsAuthAppOrAdmin], function(req, res){
router.post('/:id/actions/resetpassword', [jwtMiddle.decodeToken], function (req, res) {

    var id = (req.params.id).toString();

    async.series([
            function (callback) {
                if (id.indexOf("@") >= 0) { // è un ndirizzo email
                    if (id.search(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/igm) >= 0) { // è una mail valida
                        User.findOne({email: id}, function (err, usr) {
                            if (err) callback({err_code: 500, error: 'internal_error', error_message: err + ""}, 'one');

                            if (!usr)callback({
                                err_code: 404,
                                error: 'NotFound',
                                error_message: "no User found whith " + id + " email"
                            }, 'one');

                            id = usr._id;
                            callback(null, 'one');
                        });

                    } else { // non è na mail valida
                        callback({
                            err_code: 400,
                            error: 'BadRequest',
                            error_message: "Please fill a valid email address"
                        }, 'one');
                    }
                } else {
                    callback(null, 'one'); // ho passto l'id utente e non lo username
                }
            }
        ],
        function (err, results) {

            if (err) {
                return res.status(err.err_code).send({error: err.error, error_message: err.error_message + ""});
            } else {
                var rqparams = {
                    url: microserviceBaseURL + "/authuser/" + id + '/actions/resetpassword',
                    headers: {'Authorization': "Bearer " + microserviceTokem}
                };

                console.log("req" + util.inspect(rqparams));

                request.post(rqparams, function (error, response, body) {

                    if (error) {
                        return res.status(500).send({
                            error: 'internal_User_microservice_error',
                            error_message: error + ""
                        });
                    } else {
                        //TODO send Email
                        return res.status(200).send(body);
                    }
                });
            }
        });

});



/**
 * @api {post} /users/:id/actions/setpassword Set new User password
 * @apiVersion 1.0.0
 * @apiName SetPassword
 * @apiGroup Users
 *
 * @apiDescription Accessible by access_token, It update user password. To call this endpoint must have a reset_token (used with authorized app or admin token) or must be the User itself.
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String-URL} id the user id or username (email)
 * @apiParam {String-BODY} oldpassword the old password to update. If set, reset_token must be undefined
 * @apiParam {String-BODY} newpassword the new password
 * @apiParam {String-BODY} reset_token this token is used to update password. Must be undefined if oldpassword is set
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET request
 *  Body:{ "oldpassword": "prova" , "newpassword":"provami"}
 *
 * @apiSuccess (200 - OK) {Object} access_credentials  contains information about access credentials.
 * @apiSuccess (200 - OK) {Object} access_credentials.apiKey  contains information about apiKey
 * @apiSuccess (200 - OK) {String} access_credentials.apiKey.token  user Token
 * @apiSuccess (200 - OK) {String} access_credentials.apiKey.expires  token expiration date
 * @apiSuccess (200 - OK) {Object} access_credentials.refreshToken  contains information about refreshToken used to renew token
 * @apiSuccess (200 - OK) {String} access_credentials.refreshToken.token  user refreshToken
 * @apiSuccess (200 - OK) {String} access_credentials.refreshToken.expires  refreshToken expiration date
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
 *                   }
 *        }
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
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
                if (id.indexOf("@") >= 0) { // è un ndirizzo email
                    if (id.search(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/igm) >= 0) { // è una mail valida
                        User.findOne({email: id}, function (err, usr) {
                            if (err) callback({err_code: 500, error: 'internal_error', error_message: err + ""}, 'one');

                            if (!usr)callback({
                                err_code: 404,
                                error: 'NotFound',
                                error_message: "no User found whith " + id + " email"
                            }, 'one');

                            id = usr._id;
                            callback(null, 'one');
                        });

                    } else { // non è Una mail valida
                        callback({
                            err_code: 400,
                            error: 'BadRequest',
                            error_message: "Please fill a valid email address"
                        }, 'one');
                    }
                } else {
                    callback(null, 'one'); // ho passato l'id utente e non lo username
                }
            },
            function (callback) {

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
                        headers: {'Authorization': "Bearer " + microserviceTokem}
                    };

                    request.get(rqparams, function (error, response, body) {

                        if (error) {
                            callback({error: 'internal_User_microservice_error', error_message: error + ""}, "two");

                        } else {
                            var appT = JSON.parse(body).user;
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
                    });
                }
            }
        ],
        function (err, results) {

            if (err) {
                return res.status(err.err_code).send({error: err.error, error_message: err.error_message + ""});
            } else {
                var rqparams = {
                    url: microserviceBaseURL + "/authuser/" + id + '/actions/setpassword',
                    headers: {'Authorization': "Bearer " + microserviceTokem, 'content-type': 'application/json'},
                    body: JSON.stringify(tmpbody)
                };


                console.log("req" + util.inspect(rqparams));

                request.post(rqparams, function (error, response, body) {

                    if (error) {
                        return res.status(500).send({
                            error: 'internal_User_microservice_error',
                            error_message: error + ""
                        });
                    } else {
                        return res.status(201).send({"access_credentials": JSON.parse(body)});
                    }
                });
            }
        });

});



/**
 * @api {post} /users/:id/actions/changeuserid Change User Id (email)
 * @apiVersion 1.0.0
 * @apiName ChangeUserId
 * @apiGroup Users
 *
 * @apiDescription Accessible by admin access tokens. Creates a new userId (email) used to login.
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String-URL} id the user id or username (email)
 * @apiParam {String-URL} email the new username (email)
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET request
 *  Body:{ "email": "prov@prova.it"}
 *
 * @apiSuccess (200- OK) {String} email  the updated email field
 *
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
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
 */
//router.post('/:id/actions/resetpassword', [middlewares.ensureUserAdmin], function(req, res){
router.post('/:id/actions/changeuserid', [jwtMiddle.decodeToken], function (req, res, next) {

    var id = (req.params.id).toString();
    req.url = "/" + id;

    var body = {user: req.body};
    req.body = body;

    req.method = "PUT";
    try {
        router.handle(req, res, next);
    } catch (ex) {
        res.status(500).send({error: "InternalError", error_message: ex.toString()});
    }

});



/**
 * @api {post} /users/:id/actions/enable enable user
 * @apiVersion 1.0.0
 * @apiName EnableUser
 * @apiGroup Users
 *
 * @apiDescription Accessible by admin access tokens. Enables the user.
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String} id the user id
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
 */

//router.post('/:id/actions/enable', [middlewares.ensureUserIsAdmin], function(req, res){
router.post('/:id/actions/enable', [jwtMiddle.decodeToken], function (req, res) {
    enableDisable(req, res, true);
});



/**
 * @api {post} /users/:id/actions/disable disable user
 * @apiVersion 1.0.0
 * @apiName DisableUser
 * @apiGroup Users
 *
 * @apiDescription Accessible by admin access tokens. Disables the user.
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String} id the user id
 *
 * @apiSuccess (201 - Created) {String} status  contains the new user status
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
 */
//router.post('/:id/actions/disable', [middlewares.ensureUserIsAdmin], function(req, res){
router.post('/:id/actions/disable', [jwtMiddle.decodeToken], function (req, res) {
    enableDisable(req, res, false);
});



/**
 * @api {delete} /users/:id delete User
 * @apiVersion 1.0.0
 * @apiName Delete User
 * @apiGroup Users
 *
 * @apiDescription Accessible by admin access tokens. Deletes User and returns the deleted resource.
 * To call this endpoint must have an admin token.
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String} id the user id
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
 */
//router.delete('/:id',[middlewares.ensureUserIsAdmin], function(req, res) {
router.delete('/:id', [jwtMiddle.decodeToken], function (req, res) {

    var id = (req.params.id).toString();

    var rqparams = {
        url: microserviceBaseURL + "/authuser/" + id,
        headers: {'Authorization': "Bearer " + microserviceTokem}
    };

    console.log(util.inspect(rqparams));

    request.delete(rqparams, function (error, response, body) {

        if(error) {
            return  res.status(500).send({error:'internal_User_microservice_error', error_message : error +""});
        }else{
            User.findOneAndRemove({_id:id},  function(err, results){
                console.log("deleted "+util.inspect(results));
                if(!err){
                    if (results){
                        return res.status(204).send({deleted_resource:results});
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
    });

});



/**
 * @api {get} /users/:term/actions/email/find Search all Users
 * @apiVersion 1.0.0
 * @apiName SEARCH User
 * @apiGroup Users
 *
 * @apiDescription Accessible by admin access_token. Returns the paginated list of all Users matching the search term to username..
 * Set pagination skip and limit, in the URL request, e.g. "get /users?skip=10&limit=50"
 *
 * @apiParam {String} access_token access token that grants access to this resource. It must be sent in [ body || as query param || header]
 * @apiParam {String} skip  the pagination start
 * @apiParam {String} limit the number of elements
 *
 * @apiUse Metadata
 * @apiUse GetResource
 * @apiUse GetResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse ServerError
 */
//router.get('/:term/actions/email/find',middlewares.ensureUserIsAdmin,function (req, res) {
router.get('/actions/email/find/:term', [jwtMiddle.decodeToken], function (req, res) {

    var term = req.params.term,
        size = req.query.size ? parseInt(req.query.size) : 10,
        query = {},
        sortParams = {};

    if (!term) return res.json({'status': true, err: 1, 'message': 'term not found', data: []});

    query.email = new RegExp(term, 'i');

    User.find(query, null, {
        limit: size,
        sort: sortParams
    }, function (err, data) {
        if (err) return res.json({'status': false, 'err': err});

        return res.json({status: true, data: data});
    });

});


module.exports = router;