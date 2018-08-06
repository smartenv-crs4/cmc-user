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


var conf = require('../config').conf;
var User = require('../models/users').User;
var _= require("underscore");


//Middleware to parse DB query fields selection from request URI
//Adds dbQueryFields to request
exports.parseFields = function (req, res, next) {

    var fields = req.query.fields ? req.query.fields.split(",") : null;
    if (fields) {
        req.dbQueryFields = fields.join(' ');
    }
    else {
        req.dbQueryFields = null;
    }
    next();

};


//Middleware to parse pagination params from request URI
//Adds dbPagination to request
exports.parsePagination = function (req, res, next) {

    var skip = req.query.skip && !isNaN(parseInt(req.query.skip)) ? parseInt(req.query.skip) : conf.skip;
    var limit = req.query.limit && parseInt(req.query.limit) < conf.limit ? parseInt(req.query.limit) : conf.limit;


    if((skip==-1) || (limit==-1))
        req.dbPagination = {};
    else
        req.dbPagination = {"skip": skip, "limit": limit};

    next();

};


exports.ensureUserIsAdminOrSelf = function(req,res,next){

    if(req.fastForward===conf.fastForwardPsw) {
        next();
    }else {
        var id = (req.params.id).toString();

        if (!req.User_App_Token)
            return res.status(500).send({
                error: "InternalError",
                error_message: 'decoded token not found in request'
            });


        if (req.User_App_Token.mode === "user") { // ckeck only if is user token


            if (!(((conf.adminUser.indexOf(req.User_App_Token.type) >= 0)) || (req.User_App_Token._id == id))) // se il token è di un utente non Admin e non è l'utent stesso
                return res.status(401).send({
                    error: "Forbidden",
                    error_message: 'only ' + conf.adminUser + ' or self user are authorized to access the resource. your Token Id:' + req.User_App_Token._id + " searchId:" + id
                });
            else
                next();
        } else {
            next();
        }
    }

};


//Middleware to parse sort option from request
//Adds sort to request
exports.parseOptions = function (req, res, next) {

    var sortDescRaw = req.query.sortDesc ? req.query.sortDesc.split(",") : null;
    var sortAscRaw = req.query.sortAsc ? req.query.sortAsc.split(",") : null;

    if (sortAscRaw || sortDescRaw)
        req.sort = {asc: sortAscRaw, desc: sortDescRaw};
    else
        req.sort = null;

    next();

};



exports.ensureFieldAuthorisedForSomeUsers = function(usersListFunction,fieldsToCkeck,reqFieldsFunction){


    return (function(req,res,next){

        if(req.fastForward===conf.fastForwardPsw) {
            next();
        }else {


            if (!req.User_App_Token)
                return res.status(500).send({
                    error: "InternalError",
                    error_message: 'decoded token not found in request'
                });


            if (req.User_App_Token.mode === "user") { // ckeck only if is user token

                usersList = usersListFunction();
                fields = reqFieldsFunction(req);

                var filteredFields = _.filter(fieldsToCkeck, function (value) {
                    return _.has(fields, value);
                });

                if (!(usersList.indexOf(req.User_App_Token.type) >= 0) && filteredFields.length > 0) {
                    return res.status(401).send({
                        error: "Forbidden",
                        error_message: 'only ' + usersList + ' users can set ' + filteredFields
                    });
                } else
                    next();
            }else{
                next();
            }
        }
    });
};


//
//
// exports.ensureUserIsAdmin = function(req,res,next){
//
//     if (! req.User_App_Token )
//         return res.status(401).send({ error: "Forbidden", error_message:'you are not authorized to access the resource (no user in the request)'});
//     if(!(conf.adminUser.indexOf(req.User_App_Token.type)>=0)) // se il token è di un utente non Admin
//         return res.status(401).send({ error: "Forbidden",error_message:'only ' +conf.adminUser+' are authorized to access the resource'});
//     else
//         next();
// };
//
//
// exports.ensureUserIsAuthAppOrAdmin = function(req,res,next){
//
//
//     if (!req.User_App_Token )
//         return res.status(401).send({error: "Forbidden",error_message:'you are not authorized to access the resource (no API KEY in the request)'});
//     if(!(conf.SignUpAuthorizedAppAndMS.indexOf(req.User_App_Token.type)>=0) || (conf.adminUser.indexOf(req.User_App_Token.type)>=0)) // se il token è di un app non autorizzata
//         return res.status(401).send({error: "Forbidden",error_message:'only ' + conf.SignUpAuthorizedAppAndMS + ' are authorized to access the resource'});
//     else
//         next();
// };
//
//
//
// exports.ensureUserIsAdminOrSelfOrResetToken = function(req,res,next){
//
//     var id = req.param('id').toString();
//
//     if(req.body.reset_token) next();
//     else {
//         if (!req.User_App_Token)
//             return res.status(401).send({
//                 error: "Forbidden",
//                 error_message: 'you are not authorized to access the resource (no user in the request)'
//             });
//         if (!(((conf.adminUser.indexOf(req.User_App_Token.type) >= 0)) || (req.User_App_Token._id == id))) // se il token è di un utente non Admin e non è l'utent stesso
//             return res.status(401).send({
//                 error: "Forbidden",
//                 error_message: 'only ' + conf.adminUser + ' or self user are authorized to access the resource'
//             });
//         else
//             next();
//     }
// };
//
// exports.ensureUserIsAuthApp = function(req,res,next){
//
//
//     if (!req.User_App_Token )  // shoul not be necessary becaus decode tken check if APikey exist
//         return res.status(401).send({error: "Forbidden",error_message:'you are not authorized to access the resource (no API KEY in the request)'});
//     if(!(conf.SignUpAuthorizedAppAndMS.indexOf(req.User_App_Token.type)>=0)) // se il token è di un app non autorizzata
//         return res.status(401).send({error: "Forbidden",error_message:'only ' + conf.SignUpAuthorizedAppAndMS + ' are authorized to access the resource'});
//     else
//         next();
// };
//
//
// exports.ensureUserIsAuthAppSignIn = function(req,res,next){
//
//
//     if (!req.User_App_Token )
//         return res.status(401).send({error: "Forbidden",error_message:'you are not authorized to access the resource (no API KEY in the request)'});
//     if(!(conf.SignInAuthorizedAppAndMS.indexOf(req.User_App_Token.type)>=0)) // se il token è di un app non autorizzata
//         return res.status(401).send({error: "Forbidden",error_message:'only ' + conf.SignInAuthorizedAppAndMS + ' are authorized to access the resource'});
//     else
//         next();
// };