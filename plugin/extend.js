var express = require('express');


var plugins = [
    {
        "resource": "/users",
        "method": "POST",
        "mode": "before_after",
        "enabled": false,
        "params": ["body"],
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
                        if (err)
                            console.log(err);
                        req.body.user.ckan_apikey = b.result.apikey;
                        callback(err, req);
                    });
                }
            },
            'after': function (req, content, cType, callback) {
                var request = require("request");
                if (content.error) {
                    request.delete("http://seitre.crs4.it/api/3/action/user_delete",
                                    {id: req.body.user.username}, function (err,res,cBody) {
                                        callback(err, {});
                    });
                }
                else
                    callback(null, content);
            }
        }
    }
];

module.exports = plugins;