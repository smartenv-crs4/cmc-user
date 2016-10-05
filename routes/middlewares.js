var conf = require('../config').conf;
var User = require('../models/users').User;


/**
 * @api Configuration Fields
 * @apiVersion 1.0.0
 * @apiName Configuration
 * @apiGroup Configuration
 *
 * @apiDescription This section lists the configuration parameters of the microservice
 *
 * @apiParam {Number} dbPort mongoDb Port number
 * @apiParam {String} dbHost mongoDb Host name
 * @apiParam {String} dbName mongoDb database name
 * @apiParam {Number} limit  default limit param used to paginate get response
 * @apiParam {Number} skip   default skip param used to paginate get response
 * @apiParam {String} logfile log file path
 * @apiParam {Array} SignUpAuthorizedAppAndMS a list of signup authorized App types (defined in AuthMS) e.g. ["webUi"]
 * @apiParam {Array} SignInAuthorizedAppAndMS a list of login  authorized App types (defined in AuthMS) e.g. ["webUi"]
 * @apiParam {String} microserviceAuthMS  BaseUrl of AuthMs microservices
 * @apiParam {String} MyMicroserviceToken the token for this Application microservice. To get it register this Ms in AuthMs
 * @apiParam {Array} adminUser a list of admin User types (defined in AuthMS) e.g. ["admin"]
 * @apiParam {Object} AdminDefaultUser Object containing the default admin user
 * @apiParam {Object} UserSchema Object containig the mongoDb Schema of Users. If not set, a schema defined in models/users.js will be used
 */


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

    req.dbPagination = {"skip": skip, "limit": limit};
    next();

};


exports.ensureUserIsAdminOrSelf = function(req,res,next){
    
    var id = (req.params.id).toString();

    if (!req.User_App_Token )
        return res.status(401).send({ error: "Forbidden", error_message:'you are not authorized to access the resource (no user in the request)'});
   // console.log("TYPE:" + req.User_App_Token.type + " " + req.User_App_Token._id + " " + id );
    if (!(((conf.adminUser.indexOf(req.User_App_Token.type)>=0)) || (req.User_App_Token._id==id))) // se il token è di un utente non Admin e non è l'utent stesso
        return res.status(401).send({ error: "Forbidden",error_message:'only ' +conf.adminUser+' or self user are authorized to access the resource. your Token Id:' +req.User_App_Token._id + " searchId:"+id});
    else
        next();

};


exports.parseOptions = function (req, res, next) {

    var sortDescRaw = req.query.sortDesc ? req.query.sortDesc.split(",") : null;
    var sortAscRaw = req.query.sortAsc ? req.query.sortAsc.split(",") : null;

    if (sortAscRaw || sortDescRaw)
        req.sort = {asc: sortAscRaw, desc: sortDescRaw};
    else
        req.sort = null;

    next();

};

//
//
// exports.ensureUserIsAdmin = function(req,res,next){
//    // console.log(req);
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
//     // console.log(req);
//
//     console.log("Ensure Is Auth App Or Admin --> " +req.User_App_Token.type);
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
//     // console.log(req);
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
//         console.log("TYPE:" + req.User_App_Token.type + " " + req.User_App_Token._id + " " + id);
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
//     // console.log(req);
//
//     console.log("Ensure Is Admin");
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
//     // console.log(req);
//
//     console.log("Ensure Is AUTH SIGIN Token");
//
//     if (!req.User_App_Token )
//         return res.status(401).send({error: "Forbidden",error_message:'you are not authorized to access the resource (no API KEY in the request)'});
//     if(!(conf.SignInAuthorizedAppAndMS.indexOf(req.User_App_Token.type)>=0)) // se il token è di un app non autorizzata
//         return res.status(401).send({error: "Forbidden",error_message:'only ' + conf.SignInAuthorizedAppAndMS + ' are authorized to access the resource'});
//     else
//         next();
// };