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
var commonFunctioTest=require("./testCommonfunctions");
var mongoose = require('mongoose');
var _ = require('underscore')._;
var async = require('async');
var Users = require('../models/users').User;
var conf = require('../config').conf;
var request = require('request');
var util = require('util');
var Port = 3010;
var APIURL = 'http://localhost:' + Port +"/users" ;
var clientUser;
var clientId;
var MStoken = conf.auth_token;
var userStandard = conf.testConfig.userTypeTest;



describe('SignUpIn API', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            done();
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
                surname:"surname"+e
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


    function deleteFromAuth(id,done){
        var url = conf.authUrl + '/authuser/'+id;
        clientId=null;
        request.delete({
            url: url,
            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + MStoken}
        },function(error, response, body){
            if(error) {
                done();
            }
            else{
                response.statusCode.should.be.equal(200);
                done();
            }
        });
    }


    describe('POST /signin', function () {

        it('should not login a Authuser no body sended', function (done) {
            var url = APIURL + '/signin';
            
            request.post({
                url: url,
                // body : userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response,body) {
                if (error){
                    console.log("######   ERRORE should not login a Authuser no body sended: " + error +"  ######");
                }
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                    results.error_message.should.be.equal("request body missing");
                }
                done();
            });
        });
    });


    describe('POST /authuser/signin', function () {

        it('should not login a Authuser no username sended', function (done) {
            var userBody = JSON.stringify(userStandard);
            var url = APIURL + '/signin';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error)  console.log("######   ERRORE should not login a Authuser no username sended: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                    results.error_message.should.be.equal("No username o password provided");
                }
                done();
            });
        });
    });





    describe('POST /authuser/signin', function () {

        it('should not login a Authuser no password sended', function (done) {
            var user = {
                "name": "Micio",
                "email": "mario@cmc.com",
                "surname":"Macio"
            };
            var userBody = JSON.stringify(user);
            var url = APIURL + '/signin';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE should not login a Authuser no password sended: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                    results.error_message.should.be.equal("No username o password provided");
                }
                done();
            });
        });
    });


    describe('POST /authuser/signin', function () {

        it('should not login a Authuser no registered User', function (done) {
            var user = {
                "name": "Micio",
                "username": "mario@cmc.com",
                "password": "miciomicio",
                "surname":"Macio"
            };
            var userBody = JSON.stringify(user);
            var url = APIURL + '/signin';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response,body) {
                if (error) console.log("######   ERRORE should not login a Authuser invalid username sended: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(403);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                    results.error.should.be.equal("authentication error");
                }
                done();
            });
        });
    });



    describe('POST /authuser/signin', function () {

        it('should not login a Authuser, no request field provided', function (done) {


            var user = {
                "name": "Micio",
                "email": "mario@cmc.com",
                "password": "miciomicio",
                "surname":"Macio"
            };

            var userBody = JSON.stringify({user:user});
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response,body) {
                if (error) console.log("######  1 ERRORE should  login a Authuser: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                    results.error_message.should.be.equal("No type provided");
                }
                done();

            });
        });
    });





    describe('POST /authuser/signin', function () {

        it('should login a Authuser', function (done) {

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
                    }, function (error, response) {
                        if (error) console.log("######  2 ERRORE should  login a Authuser: " + error +"  ######");
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.have.property('access_credentials');
                            results.access_credentials.should.have.property('userId');

                        }
                        done();
                    });
                }

            });
        });
    });





    describe('POST /authuser/signin', function () {

        it('should not login a Authuser bad User', function (done) {

            var userBody = JSON.stringify({user:userStandard});
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE should not login a Authuser bad User: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(201);
                    var results = JSON.parse(response.body);
                    results.should.have.property('access_credentials');
                    results.should.have.property('created_resource');
                    clientId=results.created_resource._id; // nedeed to cancel user

                    var url = APIURL + '/signin';
                    var user = {
                        "username": "mariononesiste@cmc.com",
                        "password": "miciomicio"
                    };
                    var userBody = JSON.stringify(user);

                    request.post({
                        url: url,
                        body: userBody,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                    }, function (error, response) {
                        if (error) console.log("######  2 ERRORE should not login a Authuser bad User: " + error +"  ######");
                        else {
                            response.statusCode.should.be.equal(403);
                            var results = JSON.parse(response.body);
                            results.should.have.property('error');
                            results.should.have.property('error_message');
                        }
                        done();
                    });
                }

            });
        });
    });





    describe('POST /authuser/signin', function () {

        it('should not login a User, not SignIn Token', function (done) {

            var userBody = JSON.stringify({user:userStandard});
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE should not login a Authuser bad User: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(201);
                    var results = JSON.parse(response.body);
                    results.should.have.property('access_credentials');
                    results.should.have.property('created_resource');
                    clientId=results.created_resource._id; // nedeed to cancel user

                    var url = APIURL + '/signin';
                    var user = {
                        "username": "mario@cmc.com",
                        "password": "miciomicio"
                    };
                    var userBody = JSON.stringify(user);

                    request.post({
                        url: url,
                        body: userBody,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + results.access_credentials.apiKey.token}
                    }, function (error, response,body) {
                        if (error) console.log("######  2 ERRORE should not login a Authuser bad User: " + error +"  ######");
                        else {
                            response.statusCode.should.be.equal(401);
                            var results = JSON.parse(response.body);
                            results.should.have.property('error');
                            results.should.have.property('error_message');
                            results.error_message.indexOf("Only").should.be.greaterThan(-1);
                        }
                        done();
                    });
                }

            });
        });
    });




    describe('POST /authuser', function () {

        it('should create a new Authuser', function (done) {

            var userBody = JSON.stringify({user:userStandard});
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE should create a new Authuser: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(201);
                    var results = JSON.parse(response.body);
                    results.should.have.property('access_credentials');
                    results.should.have.property('created_resource');
                    clientId=results.created_resource._id; // nedeed to cancel user
                }
                done();
            });
        });
    });





    describe('POST /authuser/signin', function () {

        it('should not login a Authuser bad Password', function (done) {

            var userBody = JSON.stringify({user:userStandard});
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(201);
                    var results = JSON.parse(response.body);
                    results.should.have.property('access_credentials');
                    results.should.have.property('created_resource');
                    clientId=results.created_resource._id; // nedeed to cancel user

                    var url = APIURL + '/signin';
                    var user = {
                        "username": "mario@cmc.com",
                        "password": "miciomici"
                    };
                    var userBody = JSON.stringify(user);

                    request.post({
                        url: url,
                        body: userBody,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                    }, function (error, response) {
                        if (error) console.log("######   ERRORE: " + error +"  ######");
                        else {
                            response.statusCode.should.be.equal(403);
                            var results = JSON.parse(response.body);
                            results.should.have.property('error');
                            results.should.have.property('error_message');
                        }
                        done();
                    });
                }
            });
        });
    });


    describe('POST /authuser', function () {

        it('should not create a new Authuser no body sended', function (done) {
            var url = APIURL + '/signup';
            request.post({
                url: url,
                //body : userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                }
                done();
            });
        });
    });


    describe('POST /authuser', function () {

        it('should not create a new Authuser no user sended', function (done) {
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body : JSON.stringify({"Ciao":"Ciao"}),
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                }
                done();
            });
        });
    });




    describe('POST /authuser', function () {

        it('should not create a new Authuser no email sended', function (done) {
            var user = JSON.parse(JSON.stringify(userStandard));
            delete  user['email'];

            var userBody = JSON.stringify({user:user});
            //("BODY " + userBody);
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                    results.error_message.should.be.equal("No email username provided");
                }
                done();
            });
        });
    });


    describe('POST /authuser', function () {

        it('should not create a new User no password sended', function (done) {
            var user = JSON.parse(JSON.stringify(userStandard));
            delete  user['password'];

            var userBody = JSON.stringify({user:user});
            //("BODY " + userBody);
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                    results.error_message.should.be.equal("No password provided");
                }
                done();
            });
        });
    });


    describe('POST /authuser', function () {

        it('should not create a new User no password and email sended', function (done) {
            var user = JSON.parse(JSON.stringify(userStandard));
            delete  user['password'];
            delete  user['email'];

            var userBody = JSON.stringify({user:user});
            //("BODY " + userBody);
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                    results.error_message.should.be.equal("No email username provided");
                }
                done();
            });
        });
    });



    describe('POST /authuser', function () {

        it('should not create a new User no type and password sended', function (done) {
            var user = JSON.parse(JSON.stringify(userStandard));
            delete  user['password'];
            delete  user['type'];

            var userBody = JSON.stringify({user:user});
            //("BODY " + userBody);
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                    results.error_message.should.be.equal("No type provided");
                }
                done();
            });
        });
    });




    describe('POST /authuser', function () {
        this.timeout(10000);

        it('should not create a new Authuser no valid User type sended', function (done) {
            var user = JSON.parse(JSON.stringify(userStandard));
            user.type="non valido";
            var userBody = JSON.stringify({user:user});
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                    results.error_message.should.be.equal("No valid User Type provided");
                }
                done();
            });
        });

    });



    describe('POST /authuser', function () {
        this.timeout(10000);

        it('should not create a new Authuser no valid field sended', function (done) {

            var user = JSON.parse(JSON.stringify(userStandard));
            user.cofdFisc="ABAA";



            var userBody = JSON.stringify({user:user});

            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response,body) {
                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(500);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                    results.error_message.indexOf("Unable to register user").should.be.greaterThan(-1);
                }
                done();
            });
        });

    });



    describe('POST /authuser', function () {
        this.timeout(10000);

        it('should not create a new admin User with SignUp', function (done) {

            var user = JSON.parse(JSON.stringify(userStandard));
            user.type="admin";



            var userBody = JSON.stringify({user:user});

            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response,body) {
                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(401);
                    var results = JSON.parse(response.body);
                    results.should.have.property('error');
                    results.should.have.property('error_message');
                    results.error_message.indexOf("Only Admin User can SignUp admin users").should.be.greaterThan(-1);
                }
                done();
            });
        });

    });




    describe('POST /authuser', function () {

        it('should reset a password and get reset Token', function (done) {

            var userBody = JSON.stringify({user:userStandard});
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE should create a new Authuser: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(201);
                    var results = JSON.parse(response.body);
                    results.should.have.property('access_credentials');
                    results.should.have.property('created_resource');
                    clientId=results.created_resource._id; // nedeed to cancel user

                    // make a reset
                    //var url = APIURL+'/'+results.userId+"/actions/resetpassword";
                    var url = APIURL+'/'+clientId+"/actions/resetpassword";
                    request.post({
                        url: url,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                    },function(error, response, body){
                        if(error) console.log("######   ERRORE: " + error + "  ######");
                        else{
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.have.property('reset_token');
                            done();
                        }
                    });
                }
            });
        });
    });





    describe('POST /authuser', function () {

        it('should not reset a password for not auth access_token', function (done) {

            var userBody = JSON.stringify({user:userStandard});
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE should create a new Authuser: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(201);
                    var results = JSON.parse(response.body);
                    results.should.have.property('access_credentials');
                    results.should.have.property('created_resource');
                    clientId=results.created_resource._id; // nedeed to cancel user

                    // make a reset
                    //var url = APIURL+'/'+results.userId+"/actions/resetpassword";
                    var url = APIURL+'/'+clientId+"/actions/resetpassword";
                    request.post({
                        url: url,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + results.access_credentials.apiKey.token}
                    },function(error, response, body){
                        if(error) console.log("######   ERRORE: " + error + "  ######");
                        else{
                            response.statusCode.should.be.equal(401);
                            var results = JSON.parse(response.body);
                            results.should.have.property('error');
                            results.should.have.property('error_message');
                            done();
                        }
                    });
                }
            });
        });
    });




    describe('POST /authuser', function () {
        this.timeout(5000);
        it('should reset a password, get reset Token and set a new Password', function (done) {

            var userBody = JSON.stringify({user:userStandard});
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE should create a new Authuser: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(201);
                    var results = JSON.parse(response.body);
                    results.should.have.property('access_credentials');
                    results.should.have.property('created_resource');
                    clientId=results.created_resource._id; // nedeed to cancel user

                    // make a reset
                    var url = APIURL+'/'+clientId+"/actions/resetpassword";
                    request.post({
                        url: url,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                    },function(error, response, body){
                        if(error) console.log("######   ERRORE: " + error + "  ######");
                        else{
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.have.property('reset_token');
                            var reset_token=results.reset_token;

                            var user = {
                                "username": "mario@cmc.com",
                                "password": "miciomicio"
                            };
                            userBody = JSON.stringify(user);
                            url=APIURL+"/signin";
                            request.post({ // should be possible login with old password after reset
                                url: url,
                                body: userBody,
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                            }, function (error, response,body) {
                                if (error) console.log("######  ERRORE should  login a Authuser: " + error +"  ######");
                                else {
                                    response.statusCode.should.be.equal(200);
                                    var results = JSON.parse(response.body);
                                    results.should.have.property('access_credentials');
                                    results.access_credentials.should.have.property('userId');

                                    var newpasw = {
                                        "newpassword": "maciomacio",
                                        "reset_token": reset_token
                                    };
                                    // user
                                    pswBody = JSON.stringify(newpasw);
                                    url=url = APIURL+'/'+clientId+"/actions/setpassword";
                                    request.post({ // set new password with reset Token
                                        url: url,
                                        body: pswBody,
                                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                                    }, function (error, response,body) {
                                        if (error) console.log("######  ERRORE should  login a Authuser: " + error +"  ######");
                                        else {
                                            response.statusCode.should.be.equal(201);
                                            var results = JSON.parse(response.body);
                                            results.should.have.property('access_credentials');
                                            results.access_credentials.should.have.property('userId');


                                            url=APIURL+"/signin";
                                            request.post({ // should not be possible login with old password after reset
                                                url: url,
                                                body: userBody,
                                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                                            }, function (error, response) {
                                                if (error) console.log("######  ERRORE should  login a Authuser: " + error +"  ######");
                                                else {
                                                    response.statusCode.should.be.equal(403);
                                                    var results = JSON.parse(response.body);
                                                    results.should.have.property('error');
                                                    results.should.have.property('error_message');
                                                    results.error_message.indexOf("You are not correctly authenticated").should.be.greaterThan(-1);

                                                    user = {
                                                        "username": "mario@cmc.com",
                                                        "password": "maciomacio"
                                                    };
                                                    userBody = JSON.stringify(user);

                                                    url=APIURL+"/signin";
                                                    request.post({ // shoul be possible login with new token
                                                        url: url,
                                                        body: userBody,
                                                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                                                    }, function (error, response) {
                                                        if (error) console.log("######  ERRORE should  login a Authuser: " + error +"  ######");
                                                        else {
                                                            response.statusCode.should.be.equal(200);
                                                            var results = JSON.parse(response.body);
                                                            results.should.have.property('access_credentials');
                                                            results.access_credentials.should.have.property('userId');
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
                }
            });
        });
    });



    describe('POST /authuser', function () {
        this.timeout(5000);
        it('should set a new password', function (done) {
            var userBody = JSON.stringify({user:userStandard});
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response) {
                if (error) console.log("######   ERRORE should create a new Authuser: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(201);
                    var results = JSON.parse(response.body);
                    results.should.have.property('access_credentials');
                    results.should.have.property('created_resource');
                    clientId=results.created_resource._id; // nedeed to cancel user
                    var user = {
                        "username": "mario@cmc.com",
                        "password": "miciomicio"
                    };
                    userBody = JSON.stringify(user);
                    url=APIURL+"/signin";
                    request.post({ // should be possible login with password
                        url: url,
                        body: userBody,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                    }, function (error, response) {
                        if (error) console.log("######  ERRORE should  login a Authuser: " + error +"  ######");
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(response.body);
                            results.should.have.property('access_credentials');
                            results.access_credentials.should.have.property('userId');

                            var newpasw = {
                                "newpassword": "maciomacio",
                                "oldpassword": "miciomicio"
                            };
                            // user
                            pswBody = JSON.stringify(newpasw);
                            url=url = APIURL+'/'+clientId+"/actions/setpassword";
                            request.post({ // set new password with old password
                                url: url,
                                body: pswBody,
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + results.access_credentials.apiKey.token}
                            }, function (error, response,body) {
                                if (error) console.log("######  ERRORE should  login a Authuser: " + error +"  ######");
                                else {
                                    response.statusCode.should.be.equal(201);
                                    var results = JSON.parse(response.body);
                                    results.should.have.property('access_credentials');
                                    results.access_credentials.should.have.property('userId');

                                    url=APIURL+"/signin";
                                    request.post({ // should not be possible login with old password after reset
                                        url: url,
                                        body: userBody,
                                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                                    }, function (error, response) {
                                        if (error) console.log("######  ERRORE should  login a Authuser: " + error +"  ######");
                                        else {
                                            response.statusCode.should.be.equal(403);
                                            var results = JSON.parse(response.body);
                                            results.should.have.property('error');
                                            results.should.have.property('error_message');
                                            results.error_message.indexOf("You are not correctly authenticated").should.be.greaterThan(-1);

                                            user = {
                                                "username": "mario@cmc.com",
                                                "password": "maciomacio"
                                            };
                                            userBody = JSON.stringify(user);

                                            url=APIURL+"/signin";
                                            request.post({ // shoul be possible login with new token
                                                url: url,
                                                body: userBody,
                                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                                            }, function (error, response) {
                                                if (error) console.log("######  ERRORE should  login a Authuser: " + error +"  ######");
                                                else {
                                                    response.statusCode.should.be.equal(200);
                                                    var results = JSON.parse(response.body);
                                                    results.should.have.property('access_credentials');
                                                    results.access_credentials.should.have.property('userId');
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
        });
    });


});
