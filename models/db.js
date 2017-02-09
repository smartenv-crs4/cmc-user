var mongoose = require('mongoose');
var conf = require('../config').conf;
var app = require('../app');
var commonFunctions=require('../routes/commonfunctions');
var request=require('request');
var Users=require('./users').User;
var _=require("underscore");
var util=require("util");


var dbUrl =  conf.dbHost + ':' + conf.dbPort + '/' + conf.dbName;

var options = {
    server: {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}}
	//,
    /*
	user: 'admin',
    pass: 'node'
	*/
};



function createDefaultUser(callb){

    var gw=_.isEmpty(conf.apiGwAuthBaseUrl) ? "" : conf.apiGwAuthBaseUrl;
    gw=_.isEmpty(conf.apiVersion) ? gw : gw + "/" + conf.apiVersion;
    var rqparams={
        url: conf.authProtocol + "://" + conf.authHost + ":" + conf.authPort + gw + '/authuser?email=' + conf.AdminDefaultUser.email,
        headers : {'Authorization' : "Bearer "+ conf.auth_token, 'content-type': 'application/json'},
    };

    console.log("signUp request param, "+JSON.stringify(rqparams));



    request.get(rqparams, function(error, response, body){

        if(error) {
            return callb("ERROR",500,{error:"internal_microservice_error",error_message : error +""});
        }else{


            if(response.statusCode==404){
                Users.findOneAndRemove({email:conf.AdminDefaultUser.email},function(err,val){
                    return callb("ERROR", 500, {error: "InternalError", error_message:"No Default Admin in AuthMs microservice"});
                });
            }else{
                console.dir(body);
                var defUser = JSON.parse(body);
                if(!_.isEmpty(defUser.error)){
                    return callb("ERROR", response.statusCode, {error: defUser.error, error_message: defUser.error_message})
                }else { // ho trovato l'utente in authMS


                    Users.findOne({email:conf.AdminDefaultUser.email},function(err,val){

                        if (err) return callb("ERROR",500,{error:"internal_microservice_error",error_message : err +""});
                        if(!val){
                            var id = defUser.users[0]._id;
                            conf.AdminDefaultUser._id=id;
                            Users.create(conf.AdminDefaultUser, function (err, newUser) {
                                if (err) {
                                    return callb("ERROR", 500, {error: "internal_microservice_error", error_message: err + ""});

                                } else {
                                    console.log("Default Admin User Created");
                                    return callb(null, 201, {"created_resource": newUser});
                                }
                            });
                        }else{
                            console.log("Default Admin User was already been created");
                            callb(null,201,{"created_resource": val});
                        }
                    });


                }
            }
        }
    });
}


exports.connect = function connect(callback) {

    mongoose.connect(dbUrl, options, function (err, res) {

        if (err) {
            //console.log('Unable to connect to database ' + dbUrl);
            callback(err);

        }

        else {
            //console.log('Connected to database ' + dbUrl);
            //if not exixts crate default Admin user

            console.log("############################### Admin User Creation ###############################");
            createDefaultUser(function(err,stausCode,json){
                if(err) console.log("ERROR in creation Default admin user due " + json.error_message);
                console.log("############################### Admin User Creation END ###############################");
                console.log("############################### Admin Super User List Creation Start ###############################");
                commonFunctions.setConfig(function(err,userT){
                    if(err) console.log("ERROR in creation admin superuser list " + err.error_message);
                    console.log(conf.adminUser);
                    console.log("############################### Admin Super User List Creation END ###############################");
                    callback();
                });
            });
        }
    });
};




exports.disconnect = function disconnect(callback) {

    mongoose.disconnect(callback);
};
