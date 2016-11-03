
function customTestConfig(config){


    var testConfig=config.testConfig;


    var adminUserToken=testConfig.adminokens.concat(testConfig.usertokens);
    var adminAuthAppToken=testConfig.adminokens.concat(testConfig.authApptokens);
    var adminUserAuthAppToken=testConfig.adminokens.concat(testConfig.authApptokens).concat(testConfig.usertokens);



    
    
    testConfig.myWebUITokenToSignUP=config.MyMicroserviceToken;
    testConfig.userTypeTest={
                        "name": "Micio",
                        "email": "mario@caport.com",
                        "password": "miciomicio",
                        "surname":"Macio",
                        "type": testConfig.usertokens[0]
    };
    testConfig.webUiAppTest={
                    "email": "webui@webui.it",
                    "password": "miciomicio",
                    "type": testConfig.authApptokens[0]
    };
    testConfig.adminLogin={
                    "username": "admin@admin.com",
                    "password": "admin"
    };

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
                {URI:"/users/actions/email/find/:term",token:testConfig.adminokens, method:"GET"}
    ];
    testConfig.webUiID="";

}


module.exports.customTestConfig = customTestConfig;

