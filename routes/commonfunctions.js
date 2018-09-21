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


var conf=require('../config').conf;
var util=require('util');
var User = require('../models/users').User;
var _=require("underscore");
var request=require('request');
var redisSync=require('./redisSync');

exports.createUserAsAdmin = function(user,callb) {

    try {

        var loginUser = {
            "email": user.email,
            "password": user.password,
            "type": user.type
        };

        var rqparams = {
            url: conf.authUrl + '/authuser/signup',
            headers: {'Authorization': "Bearer " + conf.auth_token, 'content-type': 'application/json'},
            body: JSON.stringify({user: loginUser})
        };

        request.post(rqparams, function (error, response, body) {

            try {

                if (error) {
                    return callb("ERROR", 500, {error: "internal_microservice_error", error_message: error + ""});
                } else {


                    var loginToken = JSON.parse(body);

                    if (!loginToken.error) { //  valid token
                        user._id = loginToken.userId;
                        delete user['password'];
                        delete user['type'];
                        delete loginToken['userId'];

                        User.create(user, function (err, newUser) {
                            if (err) {
                                var gw = _.isEmpty(conf.apiGwAuthBaseUrl) ? "" : conf.apiGwAuthBaseUrl;
                                gw = _.isEmpty(conf.apiVersion) ? gw : gw + "/" + conf.apiVersion;
                                rqparams = {
                                    url: conf.authUrl + '/authuser/' + user._id,
                                    headers: {'Authorization': "Bearer " + conf.auth_token}
                                };

                                request.delete(rqparams, function (error, response, body) {
                                    if (error)
                                        console.log("inconsistent data");
                                    //TODO Create an inconsistent data queue. If the user creation is not completed and wiping that user in auth does not succeed, the data can be inconsistent


                                });
                                return callb("ERROR", 500, {
                                    error: "internal_microservice_error",
                                    error_message: err + ""
                                });

                            } else {
                                var tmpU = JSON.parse(JSON.stringify(newUser));
                                delete tmpU['__v'];
                                //delete tmpU['_id'];
                                return callb(null, 201, {"created_resource": tmpU, "access_credentials": loginToken});
                            }
                        });
                    } else {
                        return callb("NOTAUTH", 401, loginToken);
                    }
                }
            }catch (ex){
                return  callb("ERROR",500,{error:"InternalError",error_message:ex});
            }
        });
    }catch (ex){
        return  callb("ERROR",500,{error:"InternalError",error_message:ex});
    }
};



exports.setConfig= function(callback){
    try {
        var rqparams = {
            url: conf.authUrl + "/tokenactions/getsupeusertokenlist",
            headers: {'Authorization': "Bearer " + conf.auth_token}
        };

        request.get(rqparams, function (error, response, body) {
            try {
                if (error) {
                    callback({error: 'internal_User_microservice_error', error_message: error + ""}, null);

                } else {
                    var appT = JSON.parse(body);
                    if(appT.redisChannel){
                        redisSync.subscribe(appT.redisChannel);
                    }
                    conf.adminUser = appT.superuser;
                    callback(null, appT.superuser);
                }
            } catch (ex) {
                callback({error: "InternalError", error_message: ex}, null)
            }
        });
    }catch (ex){
        callback({error: "InternalError", error_message: ex}, null);
    }
};


exports.getAdminUsers= function(){
    return conf.adminUser;
};

exports.getRequestBodyUser= function(req){
    return ((req.body && req.body.user) || {});
};

exports.getRequestBody= function(req){
    return (req.body  || {});
};



//exports.getMyToken = function() {
//
//                conf.MyMicroserviceToken="yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoibXMiLCJpc3MiOiJub3QgdXNlZCBmbyBtcyIsImVtYWlsIjoibm90IHVzZWQgZm8gbXMiLCJ0eXBlIjoiQXV0aE1zIiwiZW5hYmxlZCI6dHJ1ZSwiZXhwIjoxNzgwODM0NTQxMzQxfQ.gJkSUCAkqzIb52s2ITohj7vXx-EXpicObSaJ1uSgdog";
//                return(conf);
//};