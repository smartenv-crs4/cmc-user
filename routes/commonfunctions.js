
var conf=require('../config').conf;
var util=require('util');
var User = require('../models/users').User;
var request=require('request');


exports.createUserAsAdmin = function(user,callb) {


    var loginUser={
        "email":user.email,
        "password":user.password,
        "type":user.type
    };

    var rqparams={
        url:conf.microserviceAuthMS+'/authuser/signup',
        headers : {'Authorization' : "Bearer "+ conf.MyMicroserviceToken, 'content-type': 'application/json'},
        body:JSON.stringify({user:loginUser})
    };

    //console.log("signUp request param"+JSON.stringify(rqparams));

    request.post(rqparams, function(error, response, body){

        if(error) {
            return callb("ERROR",500,{error:"internal_microservice_error",error_message : error +""});
        }else{

            console.log("signUp response body"+body);
            var loginToken = JSON.parse(body);

            if(!loginToken.error){ // ho un token valido
                user.id=loginToken.userId;
                delete user['password'];
                delete user['type'];
                delete loginToken['userId'];

                User.create(user,function(err,newUser){
                    if(err){
                        rqparams={
                            url:conf.microserviceAuthMS+'/authuser/' + user.id,
                            headers : {'Authorization' : "Bearer "+ conf.MyMicroserviceToken}
                        };

                        request.delete(rqparams, function(error, response, body) {
                            if (error)
                                console.log("inconsistent data");
                            //TODO se in seguito ad una creazione utente non andat a buon fine l'eliminazione dell utente sul microservizio auth non va a buon fine si hanno dati inconsistenti

                        });
                        return callb("ERROR",500,{error:"internal_microservice_error",error_message : err +""});

                    }else{
                        var tmpU=JSON.parse(JSON.stringify(newUser));
                        console.log("new user:"+ util.inspect(tmpU));
                        delete tmpU['__v'];
                        delete tmpU['_id'];
                        return callb(null,201,{"created_resource":tmpU, "access_credentials":loginToken});
                    }
                });
            } else{
                return callb("NOTAUTH",401,loginToken);
            }
        }
    });
};



exports.setConfig= function(callback){
    var rqparams={
        url:conf.microserviceAuthMS+ "/tokenactions/getsupeusertokenlist",
        headers : {'Authorization' : "Bearer "+ conf.MyMicroserviceToken}
    };

    request.get(rqparams, function(error, response, body){

        if(error) {
            callback({error:'internal_User_microservice_error', error_message : error +""},null);

        }else{
            var appT=JSON.parse(body).superuser;
            conf.adminUser=appT;
            callback(null,appT);
        }
    });
};

//exports.getMyToken = function() {
//
//                conf.MyMicroserviceToken="yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoibXMiLCJpc3MiOiJub3QgdXNlZCBmbyBtcyIsImVtYWlsIjoibm90IHVzZWQgZm8gbXMiLCJ0eXBlIjoiQXV0aE1zIiwiZW5hYmxlZCI6dHJ1ZSwiZXhwIjoxNzgwODM0NTQxMzQxfQ.gJkSUCAkqzIb52s2ITohj7vXx-EXpicObSaJ1uSgdog";
//                return(conf);
//};