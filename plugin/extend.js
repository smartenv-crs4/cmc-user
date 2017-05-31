var express = require('express');
var user = require("../models/users").User;

var plugins = [
    {
        "resource": "/users/signup",
        "method": "POST",
        "mode": "before_after",
        "enabled": false,
        "params": ["body","ckan_username"],
        "extender": {
            'before': function (req, content, cType, callback) {
                //checking all parameters have been set
                var par = ["email", "password"];
                var ko = false;
                var user = req.body['user'];
                var missing = [];
                for (var i=0; i< par.length;++i) {
                    var p=par[i];
                    if (!user.hasOwnProperty(p)) {
                        ko = true;
                        missing.push(p);
                    }
                }
                if (ko) {
                    callback({error_code: 400, error_message: "Missing parameters " + missing.toString()})
                }
                else {
                    var request = require("request");
                    var name = user.email.split("@")[0].replace(".", "_"); //sanitizing username from email
                    var body = {
                        email: user.email,
                        password: user.password,
                        name: name
                    };
                    var options = {
                        url: 'http://seitre.crs4.it/api/3/action/user_create',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body)
                    };
                    //making actual request to CKAN for user creation
                    request.post(options, function (err,res,cBody) {
                        var b = JSON.parse(cBody);
                        if (b.result && b.result.apikey) {
                            req.body.user.ckan_apikey = b.result.apikey; //setting CKAN apikey to user dictionary
                            req.ckan_username = name;   //appending CKAN username to request, to be used in AFTER section
                            callback(err, req);
                        }
                        else callback({error_code: 400, error_message: b.error.name[0]});
                    });
                }
            },
            //deleting the just created CKAN user in case regular user wasn't correctly created
            'after': function (req, content, cType, callback) {
                var request = require("request");
                if (content.error) {
                    var options = {
                        url: 'http://seitre.crs4.it/api/3/action/user_delete',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': '9e15a233-30ea-4676-a70e-6cc70477c85e'
                        },
                        body: JSON.stringify({id: req.ckan_username})
                    };
                    request.post(options, function (err,res,cBody) {
                        callback({error_code:400, error_message: {error:content.error,error_message:content.error_message}}, null);
                    });
                }
                else {
                    content.created_resource.ckan_username = req.ckan_username; //set here because it is not saved in the DB
                    callback(null, content);
                }
            }
        }
    },
    {
        "resource": "/users/signin",
        "method": "POST",
        "mode": "after",
        "enabled": true,
        "params": ["body"],
        "extender": function (req, content, cType, callback) {
            if (content.access_credentials) {
                var userId = content.access_credentials.userId;
                user.findById(userId, "ckan_apikey email", function (err, foundUser) {
                    if (err || !foundUser) {
                        return callback(null, content);
                    }
                    else {
                        content.access_credentials.ckan_apikey = foundUser.ckan_apikey;
                        var name = foundUser.email.split("@")[0].replace(".", "_");
                        content.access_credentials.ckan_username = name;
                        return callback(null, content);
                    }
                })
            }
            else {
                return callback(null, content);
            }
        }
    }
];

module.exports = plugins;
