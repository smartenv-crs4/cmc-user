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


var should = require('should');
var mongoose = require('mongoose');
var _ = require('underscore')._;
var async = require('async');
var db = require("../models/db");
var Users = require('../models/users').User;
var conf = require('../config').conf;
var request = require('request');
var app = require('../app');
var util = require('util');
var Port = 3010;
var APIURL = 'http://localhost:' + Port +"/users" ;
var adminToken;
var clientUser;
var clientId;
var MStoken = conf.auth_token;
var userStandard = conf.testConfig.userTypeTest;
var commonFunctioTest=require("./testCommonfunctions");

describe('Users API', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);


            var url = APIURL + '/signin';

            request.post({
                url: url,
                body: JSON.stringify(conf.testConfig.adminLogin),
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response,body) {
                if (error) console.log("######  2 ERRORE should  login a Authuser: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(response.body);
                    results.should.have.property('access_credentials');
                    adminToken=results.access_credentials.apiKey.token;
                }
                done();
            });
        });
    });

    after(function (done) {
        Users.remove({}, function (err,elm) {
            if (err) console.log("######   ERRORE After 1: " + err +"  ######");
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) console.log("######   ERRORE After 1: " + err +"  ######");
                done();
            });
        });
    });



    beforeEach(function (done) {

        var range = _.range(100);

        async.each(range, function (e, cb) {

            Users.create({
                _id : new mongoose.Types.ObjectId,
                email:"email" + e + "@email.it",
                name:"name" +e,
                surname:"surname"+e,
                avatar:"avatar" +e,
                notes:"notes"+e
            }, function (err, newuser) {
                if (err) console.log("######   ERRORE BEFOREEACH: " + err +"  ######");
                if(e==1) clientUser=newuser._id;
                cb();
            });

        }, function (err) {
            done();
        });
    });


    afterEach(function (done) {
        Users.remove({}, function (err, elm) {
            if (err) console.log("######   ERRORE AfterEach: " + err +"  ######");
            if(clientId)
                deleteFromAuth(clientId,done);
            else done();
        });
    });





    describe('GET /user', function () {

        it('must return ONE user and _metadata, all fields', function (done) {

            request.get({
                url: APIURL + '?skip=0&limit=1&fields=-type',
                headers: {'Authorization': "Bearer " + adminToken}
            }, function (error, response, body) {

                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('users');
                    results._metadata.skip.should.be.equal(0);
                    results._metadata.limit.should.be.equal(1);
                    results._metadata.totalCount.should.be.equal(101); // one is the default admin user
                    //should.exist(results.users[0].hash);
                    //should.exist(results.users[0].salt);
                    should.exist(results.users[0].email);
                    should.exist(results.users[0].name);
                    should.exist(results.users[0].surname);
                    //should.exist(results.users[0].avatar);
                    //should.exist(results.users[0].notes);
                }
                done();
            });

        });

    });


    describe('GET /authuser', function () {

        it('must return 2 users and _metadata, all fields', function (done) {

            request.get({
                url: APIURL + '?skip=0&limit=2&fields=-type',
                headers: {'Authorization': "Bearer " + adminToken}
            }, function (error, response, body) {

                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('users');
                    results._metadata.skip.should.be.equal(0);
                    results._metadata.limit.should.be.equal(2);
                    results._metadata.totalCount.should.be.equal(100);
                    //should.exist(results.users[0].hash);
                    //should.exist(results.users[0].salt);
                    should.exist(results.users[0].email);
                    should.exist(results.users[0].name);
                    should.exist(results.users[0].surname);
                    should.exist(results.users[0].avatar);
                    should.exist(results.users[0].notes);
                }
                done();
            });
        });
    });



    describe('GET /authuser', function () {

        it('must return  error 400 for invalid token', function (done) {

            request.get({
                url: APIURL + '?skip=0&limit=2',
                headers: {'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP + "d"}
            }, function (error, response, body) {

                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(401);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                }
                done();
            });
        });
    });


    describe('GET /authuser', function () {

        it('must return  error 401 for not Authorized token', function (done) {

            request.get({
                url: APIURL + '?skip=0&limit=2',
                headers: {'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response, body) {

                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(401);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                }
                done();
            });
        });
    });







    describe('GET /authuser', function () {

        it('must return  no error for invalid field', function (done) {

            request.get({
                url: APIURL + '?skip=0&limit=2&fields=name,codFisc',
                headers: {'Authorization': "Bearer " + adminToken}
            }, function (error, response, body) {

                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('_metadata');
                    results.should.have.property('users');
                    should.not.exist(results.users[0].email);
                    should.exist(results.users[0].name);
                    should.not.exist(results.users[0].codFisc);
                    should.not.exist(results.users[0].salt);
                }
                done();
            });
        });
    });





    describe('GET /authuser', function () {

        it('must return  error 400 for Access_token required', function (done) {

            request.get({url: APIURL + '?skip=0&limit=2'}, function (error, response, body) {

                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                }
                done();
            });
        });
    });


    function deleteFromAuth(id,done){
        var url = conf.authUrl+ '/authuser/' + id;
        clientId=null;
        request.delete({
            url: url,
            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + MStoken}
        },function(error, response, body){
            if(error) {
                done();
            }
            else{
                should(response.statusCode==200 || response.statusCode==404).be.true;
                done();
            }
        });
    }

    function createUser(callb){
        var userBody = JSON.stringify({user:userStandard});
        var url = APIURL + '/signup';
        request.post({
            url: url,
            body: userBody,
            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
        }, function (error, response,body) {
            if (error) console.log("######  1 ERRORE should  login a Authuser: " + error +"  ######");
            else {
                response.statusCode.should.be.equal(201);
                var results = JSON.parse(response.body);
                results.should.have.property('access_credentials');
                results.should.have.property('created_resource');
                clientId=results.created_resource._id; // nedeed to cancel user
            }
            callb(results.access_credentials.apiKey.token || null);
        });
    }




    describe('POST /actions/search', function(){

        it('must search and return all users ', function(done){
            var bodyParam=JSON.stringify({searchterm:{}});
            var requestParams={
                url:APIURL+'/actions/search',
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                else{
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(response.body);
                    results.should.have.property('_metadata');
                    results.should.have.property('users');
                    results._metadata.totalCount.should.be.equal(100);
                    //results.users[0].type.should.be.equal(userStandard.type);
                }
                done();
            });

        });
    });



    describe('POST /actions/search', function(){

        it('must return one user of a type set in query ', function(done){
            createUser(function(token){
                if(token){
                    console.log(token);
                    var url = APIURL+'/actions/search'; //?type='+userStandard.type;
                    var requestParams={
                        url:url,
                        headers:{'content-type': 'application/json','Authorization' : "Bearer "+ adminToken},
                        body:JSON.stringify({searchterm:{email:userStandard.email,type:[userStandard.type]}})
                    };
                    request.post(requestParams,function(error, response, body){
                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                        else{
                            //console.log(body);
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.have.property('_metadata');
                            results.should.have.property('users');
                            results._metadata.totalCount.should.be.equal(1);
                            results.users[0].type.should.be.equal(userStandard.type);
                        }
                        done();
                    });
                }else{
                    token.should.be.not(null);
                }
            })

        });
    });


    describe('POST /actions/search', function(){

        it('must return one user of all type as set in query ', function(done){
            createUser(function(token){
                if(token){
                    console.log(token);
                    var url = APIURL+'/actions/search'; //?type='+userStandard.type;
                    var requestParams={
                        url:url,
                        headers:{'content-type': 'application/json','Authorization' : "Bearer "+ adminToken},
                        body:JSON.stringify({searchterm:{email:userStandard.email,type:['All']}})
                    };
                    request.post(requestParams,function(error, response, body){
                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                        else{
                            //console.log(body);
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.have.property('_metadata');
                            results.should.have.property('users');
                            results._metadata.totalCount.should.be.equal(1);
                            results.users[0].type.should.be.equal(userStandard.type);
                        }
                        done();
                    });
                }else{
                    token.should.be.not(null);
                }
            })

        });
    });


    describe('POST /actions/search', function(){

        it('must return one user of all type as set in query. fields name ', function(done){
            createUser(function(token){
                if(token){
                    console.log(token);
                    var url = APIURL+'/actions/search'; //?type='+userStandard.type;
                    var requestParams={
                        url:url,
                        headers:{'content-type': 'application/json','Authorization' : "Bearer "+ adminToken},
                        body:JSON.stringify({fields:["name"],searchterm:{email:userStandard.email,type:['All']}})
                    };
                    request.post(requestParams,function(error, response, body){
                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                        else{
                            //console.log(body);
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.have.property('_metadata');
                            results.should.have.property('users');
                            results._metadata.totalCount.should.be.equal(1);
                            results.users[0].type.should.be.equal(userStandard.type);
                            results.users[0].should.have.property('name');
                            results.users[0].should.have.property('type');
                            results.users[0].should.not.have.property('surname');
                            results.users[0].should.not.have.property('email');
                        }
                        done();
                    });
                }else{
                    token.should.be.not(null);
                }
            })

        });
    });



    describe('POST /actions/search', function(){

        it('must return one user by name search ', function(done){
            createUser(function(token){
                if(token){
                    console.log(token);
                    var url = APIURL+'/actions/search'; //?type='+userStandard.type;
                    var requestParams={
                        url:url,
                        headers:{'content-type': 'application/json','Authorization' : "Bearer "+ adminToken},
                        body:JSON.stringify({searchterm:{name:userStandard.name.substring(1,3)}})
                    };
                    request.post(requestParams,function(error, response, body){
                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                        else{
                            //console.log(body);
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.have.property('_metadata');
                            results.should.have.property('users');
                            results._metadata.totalCount.should.be.equal(1);
                        }
                        done();
                    });
                }else{
                    token.should.be.not(null);
                }
            })

        });
    });


    describe('POST /actions/search', function(){

        it('must search one user by id', function(done){

            Users.findOne({},function(err,userID){
                if(!err){
                    var url = APIURL+'/actions/search'; //?type='+userStandard.type;
                    var requestParams={
                        url:url,
                        headers:{'content-type': 'application/json','Authorization' : "Bearer "+ adminToken},
                        body:JSON.stringify({searchterm:{usersId:[userID._id]}})
                    };
                    request.post(requestParams,function(error, response, body){
                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                        else{
                            //console.log(body);
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.have.property('_metadata');
                            results.should.have.property('users');
                            results._metadata.totalCount.should.be.equal(1);
                            results.users.length.should.be.equal(1);
                            var usId=JSON.stringify(userID._id);
                            (usId).should.be.equal(JSON.stringify(results.users[0]._id));
                        }
                        done();
                    });
                }else{
                    err.should.be(null);
                }
            });

        });
    });


    describe('POST /actions/search', function(){

        it('must not found a user of a type set in query', function(done){
            createUser(function(token){
                if(token){
                    console.log(token);
                    var url = APIURL+'/actions/search'; //?type='+userStandard.type;
                    var requestParams={
                        url:url,
                        headers:{'content-type': 'application/json','Authorization' : "Bearer "+ adminToken},
                        body:JSON.stringify({searchterm:{email:userStandard.email,type:["notexist"]}})
                    };
                    request.post(requestParams,function(error, response, body){
                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                        else{
                            //console.log(body);
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.have.property('_metadata');
                            results.should.have.property('users');
                            results._metadata.totalCount.should.be.equal(0);
                            results.users.length.should.be.equal(0);
                        }
                        done();
                    });
                }else{
                    token.should.be.not(null);
                }
            })

        });
    });


    
    describe('GET /authuser/:id', function(){
    
        it('must return a user by id, all fields', function(done){
            createUser(function(token){
                if(token){
                    var url = APIURL+'/'+clientId;
                    request.get({url:url,headers:{'Authorization' : "Bearer "+ token}},function(error, response, body){
                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                        else{
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.have.property('email');
                            results.should.have.property('name');
                            results.should.have.property('surname');
                            results.should.not.have.property('password');
                        }
                        done();
                    });
                }else{
                    token.should.be.not(null);
                }
            })

        });
    });


    describe('GET /authuser/:id', function(){

        it('must return a user by id, fields type', function(done){
            createUser(function(token){
                if(token){
                    var url = APIURL+'/'+clientId+"?fields=name";
                    request.get({url:url,headers:{'Authorization' : "Bearer "+ token}},function(error, response, body){
                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                        else{
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.not.have.property('email');
                            results.should.have.property('name');
                            results.should.not.have.property('surname');
                            results.should.not.have.property('salt');
                        }
                        done();
                    });
                }else{
                    token.should.be.not(null);
                }
            })

        });
    });

    describe('GET /authuser/:id', function(){

        it('must return a user by id, send an invalid field', function(done){
            createUser(function(token){
                if(token){
                    var url = APIURL+'/'+clientId+"?fields=name,codfiscale";
                    request.get({url:url,headers:{'Authorization' : "Bearer "+ token}},function(error, response, body){
                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                        else{
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.not.have.property('email');
                            results.should.have.property('name');
                            results.should.not.have.property('surname');
                            results.should.not.have.property('salt');
                            results.should.not.have.property('codfiscale');
                        }
                        done();
                    });
                }else{
                    token.should.be.not(null);
                }
            })

        });
    });





    describe('GET /authuser/:id', function(){

        it('must return a 404, user not found', function(done){
            createUser(function(token){
                if(token){
                    var url = APIURL+'/'+clientId+"abc?fields=name,codfiscale";
                    request.get({url:url,headers:{'Authorization' : "Bearer "+ adminToken}},function(error, response, body){
                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                        else{
                            response.statusCode.should.be.equal(404);
                        }
                        done();
                    });
                }else{
                    token.should.be.not(null);
                }
            })

        });
    });



    describe('GET /authuser/:id', function(){

        it('must return a 401, user with invalid ID', function(done){
            createUser(function(token){
                if(token){
                    var url = APIURL+'/'+clientId+"abc?fields=name,codfiscale";
                    request.get({url:url,headers:{'Authorization' : "Bearer "+ token}},function(error, response, body){
                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                        else{
                            response.statusCode.should.be.equal(401);
                        }
                        done();
                    });
                }else{
                    token.should.be.not(null);
                }
            })

        });
    });




    describe('DELETE /user/:id', function(){

        it('must delete a user by id', function(done){
            createUser(function(token){
                if(token){
                    var url = APIURL+'/'+clientId;
                    request.delete({url:url,headers:{'Authorization' : "Bearer "+ adminToken}},function(error, response, body){
                        if(error) {
                            done()
                        }
                        else{
                            response.statusCode.should.be.equal(204);
                            Users.findOne({id:clientId}, function(err, usr){

                                should(usr).be.equal(null);
                                done();
                            });
                        }
                    });
                }else{
                    token.should.be.not(null);
                }
            })

        });
    });


    describe('DELETE /user/:id', function(){

        it('must return error 404 in delete a user by invalid id', function(done){
            createUser(function(token){
                if(token){
                    var url = APIURL+'/'+"ABC";
                    request.delete({url:url,headers:{'Authorization' : "Bearer "+ adminToken}},function(error, response, body){
                        if(error) {
                            done()
                        }
                        else{
                            response.statusCode.should.be.equal(500);
                            done();
                        }
                    });
                }else{
                    token.should.be.not(null);
                }
            })

        });
    });







    describe('GET /authuser/:id', function(){

        it('must disable and enable a User', function(done){
            createUser(function(tokenUtente){
                if(tokenUtente){
                    var url = APIURL+'/'+clientId+"/actions/disable";
                    request.post({url:url,headers:{'Authorization' : "Bearer "+ adminToken}},function(error, response, body){
                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                        else{
                            response.statusCode.should.be.equal(201);

                            var url = APIURL + '/signin';
                            var user = {
                                "username": "mario@cmc.com",
                                "password": "miciomicio"
                            };
                            var userBody = JSON.stringify(user);

                            request.post({
                                url: url,
                                body: userBody,
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                            }, function (error, response,body) {
                                if (error) console.log("######  2 ERRORE should  login a Authuser: " + error +"  ######");
                                else {

                                    response.statusCode.should.be.equal(200);
                                    var url = APIURL+'/'+clientId+"?fields=name";
                                    request.get({url:url,headers:{'Authorization' : "Bearer "+ tokenUtente}},function(error, response, body){
                                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                                        else{
                                            response.statusCode.should.be.equal(401);
                                            var url = APIURL+'/'+clientId+"/actions/enable";
                                            request.post({url:url,headers:{'Authorization' : "Bearer "+ adminToken}},function(error, response, body){
                                                if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                                                else{
                                                    response.statusCode.should.be.equal(201);
                                                    var url = APIURL+'/'+clientId+"?fields=name";
                                                    request.get({url:url,headers:{'Authorization' : "Bearer "+ tokenUtente}},function(error, response, body){
                                                        if(error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                                                        else{
                                                            response.statusCode.should.be.equal(200);
                                                            var results = JSON.parse(response.body);
                                                            results.should.not.have.property('email');
                                                            results.should.have.property('name');
                                                            results.should.not.have.property('surname');
                                                            results.should.not.have.property('salt');
                                                        }
                                                        done();
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }else{
                    tokenUtente.should.be.not(null);
                }
            })
        });
    });

});
