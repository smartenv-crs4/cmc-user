var should = require('should');
var commonFunctioTest=require("./testCommonfunctions");
var mongoose = require('mongoose');
var _ = require('underscore')._;
var async = require('async');
//var db = require("../models/db");
var Users = require('../models/users').User;
var conf = require('../config').conf;
var request = require('request');
//var app = require('../app');
var util = require('util');
var Port = 3010;
var APIURL = 'http://localhost:' + Port +"/users" ;
//var server;


var clientUser;
var clientId;
var MStoken = conf.MyMicroserviceToken;
var userStandard = conf.testConfig.userTypeTest;



describe('SignUpIn API', function () {

    // before(function (done) {
    //     //this.timeout(4000);
    //     //
    //     //console.log("BEFORE");
    //     db.connect(function (err) {
    //         if (err) console.log("######   ERRORE BEFORE : " + err +"  ######");
    //
    //         app.set('port', process.env.PORT || Port);
    //
    //         server = app.listen(app.get('port'), function () {
    //             console.log('TEST Express server listening on port ' + server.address().port);
    //             done();
    //         });
    //     });
    // });
    //
    // after(function (done) {
    //     //console.log("AFTER");
    //     Users.remove({}, function (err,elm) {
    //         if (err) console.log("######   ERRORE After 1: " + err +"  ######");
    //         db.disconnect(function (err,res) {
    //             if (err) console.log("######   ERRORE After 2: " + err +"  ######");
    //             done();
    //         });
    //         server.close();
    //     });
    // });
    //
    //



    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            done();
        });
    });

    after(function (done) {
        //console.log("AFTER");
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

        //Add cars
       // console.log("BEFORE EACH");
        async.each(range, function (e, cb) {

            Users.create({
                _id : new mongoose.Types.ObjectId,
                email:"email" + e + "@email.it",
                name:"name" +e,
                surname:"surname"+e
            }, function (err, newuser) {
                if (err) console.log("######   ERRORE BEFOREEACH: " + err +"  ######");
                //console.log(e);
                if(e==1) clientUser=newuser._id;
                cb();
            });

        }, function (err) {
            done();
        });
    });


    afterEach(function (done) {
        //console.log("AFTER EACH");
        Users.remove({}, function (err, elm) {
            if (err) console.log("######   ERRORE AfterEach: " + err +"  ######");
            if(clientId)
                deleteFromAuth(clientId,done);
            else done();
        });
    });


    function deleteFromAuth(id,done){
        var url = conf.authProtocol + "://" + conf.authHost + ":" + conf.authPort + '/authuser/'+id;
        clientId=null;
        request.delete({
            url: url,
            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + MStoken}
        },function(error, response, body){
            if(error) {
                console.log("######   ERRORE: " + error + "  ######");
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
            //console.log("BODY " + userBody);
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
                    console.log("testBody " +body);
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
           // console.log("BODY " + userBody);
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
                "email": "mario@caport.com",
               // "password": "miciomicio",
                "surname":"Macio"
            };
            var userBody = JSON.stringify(user);
            //console.log("BODY " + userBody);
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
                "username": "mario@caport.com",
                "password": "miciomicio",
                "surname":"Macio"
            };
            var userBody = JSON.stringify(user);
            //console.log("BODY " + userBody);
            var url = APIURL + '/signin';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response,body) {
                if (error) console.log("######   ERRORE should not login a Authuser invalid username sended: " + error +"  ######");
                else {
                    console.log(body);
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
                "email": "mario@caport.com",
                "password": "miciomicio",
                "surname":"Macio"
            };



            var userBody = JSON.stringify({user:user});
            //console.log("BODY " + userBody);
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response,body) {
                if (error) console.log("######  1 ERRORE should  login a Authuser: " + error +"  ######");
                else {
                    console.log(body);
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
            //console.log("BODY " + userBody);
            var url = APIURL + '/signup';
            request.post({
                url: url,
                body: userBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
            }, function (error, response,body) {
                if (error) console.log("######  1 ERRORE should  login a Authuser: " + error +"  ######");
                else {
                    console.log(body);
                    response.statusCode.should.be.equal(201);
                    var results = JSON.parse(response.body);
                    results.should.have.property('access_credentials');
                    results.should.have.property('created_resource');
                    clientId=results.created_resource._id; // nedeed to cancel user

                    var url = APIURL + '/signin';
                    var user = {
                        "username": "mario@caport.com",
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
            //console.log("BODY " + userBody);
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
                        "username": "mario@caportcom",
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
            //console.log("BODY " + userBody);
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
                        "username": "mario@caportcom",
                        "password": "miciomicio"
                    };
                    var userBody = JSON.stringify(user);

                    request.post({
                        url: url,
                        body: userBody,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + results.access_credentials.apiKey.token}
                    }, function (error, response) {
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
            //console.log("BODY " + userBody);
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
            //console.log("BODY " + userBody);
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
                        "username": "mario@caport.com",
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
            //console.log("test 1 start");
            var user = JSON.parse(JSON.stringify(userStandard));
            user.type="non valido";


            var userBody = JSON.stringify({user:user});
          //  console.log("BODY " + userBody);
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
            //console.log("BODY " + userBody);
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
                            console.log("ERR Reset: " + body);
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
            //console.log("BODY " + userBody);
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
                            console.log("ERR Reset: " + body);
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
            //console.log("BODY " + userBody);
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
                                "username": "mario@caport.com",
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
                                    console.log("Access_cred SIgn=" + body);
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
                                            console.log("Access_cred=" + body);
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
                                                        "username": "mario@caport.com",
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
            //console.log("BODY " + userBody);
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
                        "username": "mario@caport.com",
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
                                    console.log("Body SignIN " + body);
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
                                                "username": "mario@caport.com",
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
