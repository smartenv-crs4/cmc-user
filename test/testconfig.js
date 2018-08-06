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


function customTestConfig(config){


    var testConfig=config.testConfig;


    var adminUserToken=testConfig.adminokens.concat(testConfig.usertokens);
    var adminAuthAppToken=testConfig.adminokens.concat(testConfig.authApptokens);
    var adminUserAuthAppToken=testConfig.adminokens.concat(testConfig.authApptokens).concat(testConfig.usertokens);



    testConfig.myWebUITokenToSignUP=config.auth_token;
    testConfig.userTypeTest.type= testConfig.usertokens[0];
    testConfig.webUiAppTest.type= testConfig.authApptokens[0];



    testConfig.AuthRoles=[
                {URI:"/users", token:testConfig.adminokens, method:"GET"},
                {URI:"/users",token:testConfig.adminokens, method:"POST"},
                {URI:"/users/:id",token:adminUserToken, method:"GET"},
                {URI:"/users/:id",token:adminUserToken, method:"PUT"},
                {URI:"/users/:id",token:testConfig.adminokens, method:"DELETE"},
                {URI:"/users/signup",token:testConfig.authApptokens, method:"POST"},
                {URI:"/users/signin",token:testConfig.authApptokens, method:"POST"},
                {URI:"/users/:id/actions/resetpassword",token:adminAuthAppToken, method:"POST"},
                {URI:"/users/:id/actions/setpassword",token:adminUserAuthAppToken, method:"POST"},
                {URI:"/users/:id/actions/changeuserid",token:testConfig.adminokens, method:"POST"},
                {URI:"/users/:id/actions/enable",token:testConfig.adminokens, method:"POST"},
                {URI:"/users/:id/actions/disable",token:testConfig.adminokens, method:"POST"},
                {URI:"/users/actions/email/find/:term",token:testConfig.adminokens, method:"GET"},
                {URI:"/users/actions/search",token:testConfig.adminokens, method:"post"},
                {URI:"/users/:id/actions/changeusername",token:testConfig.adminokens, method:"post"}
    ];
    testConfig.webUiID="";

}



module.exports.customTestConfig = customTestConfig;

