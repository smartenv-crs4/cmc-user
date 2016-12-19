var express = require('express');

var plugins = [
    {
        "resource": "/users/signup",
        "method": "POST",
        "mode": "before_after",
        "enabled": true,
        "params": ["body","ckan_username"],
        "extender": {
            'before': function (req, content, cType, callback) {
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
                    callback({error: 400, error_message: "Missing parameters " + missing.toString()})
                }
                else {
                    var request = require("request");
                    var name = user.email.split("@")[0].replace(".", "_");
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
                    request.post(options, function (err,res,cBody) {
                        var b = JSON.parse(cBody);
                        if (b.result && b.result.apikey) {
                            req.body.user.ckan_apikey = b.result.apikey;
                            req.ckan_username = name;
                        }
                        callback(err, req);
                    });
                }
            },
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
                else
                    callback(null, content);
            }
        }
    }
];

module.exports = plugins;
