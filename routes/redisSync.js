/*
 ############################################################################
 ############################### GPL III ####################################
 ############################################################################
 *                         Copyright 2017 CRS4                                 *
 *       This file is part of CRS4 Microservice Core - Auth (CMC-Auth).       *
 *                                                                            *
 *       CMC-Auth is free software: you can redistribute it and/or modify     *
 *     it under the terms of the GNU General Public License as published by   *
 *       the Free Software Foundation, either version 3 of the License, or    *
 *                    (at your option) any later version.                     *
 *                                                                            *
 *       CMC-Auth is distributed in the hope that it will be useful,          *
 *      but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the        *
 *               GNU General Public License for more details.                 *
 *                                                                            *
 *       You should have received a copy of the GNU General Public License    *
 *       along with CMC-Auth.  If not, see <http://www.gnu.org/licenses/>.    *
 * ############################################################################
 */

var redis=require('redis');
var conf = require('../config').conf;


var adminUserSync={

    "unsubscribe":function(){
    },
    "subscribe":function(channel){
        console.log("Subscibe Mode");
        var redisConf=conf.redisCache || null;
        if(!redisConf.password)
            delete redisConf.password;

        var redisClient = redis.createClient(redisConf);
        redisClient.on("ready", function (err) {

            console.log("Redis Channel Ready");
            redisClient.subscribe(channel);


            adminUserSync.unsubscribe=function(){
                redisClient.unsubscribe(channel);
            };
            adminUserSync.quit=function(){
                redisClient.quit();
            };

        });

        redisClient.on("error", function (err) {
            console.log("Error in redisSync " + err);
            adminUserSync.subscribe(channel);
        });

        redisClient.on("subscribe", function (channel, count) {
            console.log("Subscribed to Redis channel " + channel);
        });

        redisClient.on("message", function (channel, message) {
            console.log("**********************************************");
            console.log("messagge on channel " + channel + ": " + message);
            console.log("**********************************************");
            conf.adminUser=JSON.parse(message);
        });
    },
    "quit":function(){

    }
};




module.exports = adminUserSync;



