var testCustomizableParams={
        usersType:["UserType1"],
        adminusersType:["admin"],
        authAppTypes:["webui"],
        usermsToken:"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoibXMiLCJpc3MiOiJub3QgdXNlZCBmbyBtcyIsImVtYWlsIjoibm90IHVzZWQgZm8gbXMiLCJ0eXBlIjoidXNlcm1zIiwiZW5hYmxlZCI6dHJ1ZSwiZXhwIjoxNzg5OTk2OTE5MzEyfQ.P78RVNGK9m0pY1nehyDGd8v-q28y_43GMECluzNTbEw"
};

var adminUserToken=testCustomizableParams.adminusersType.concat(testCustomizableParams.usersType);
var adminAuthAppToken=testCustomizableParams.adminusersType.concat(testCustomizableParams.authAppTypes);
var adminUserAuthAppToken=testCustomizableParams.adminusersType.concat(testCustomizableParams.authAppTypes).concat(testCustomizableParams.usersType);

var config = {

  dev:{
        dbHost:'localhost',
        dbPort:'27017',
        dbName:'CP2020USERDEV',
        limit:50,
        skip:0,
        logfile:"/var/log/caport2020User-Microservice.log",
        adminUser:["admin"],
        microserviceAuthMS:"http://localhost:3005",
        MyMicroserviceToken:testCustomizableParams.usermsToken,
        AdminDefaultUser : {
          "name": "Admin",
          "email": "admin@admin.com",
          "surname":"Admin"
        },
        testConfig:{
            usertokens:testCustomizableParams.usersType,
            authApptokens:testCustomizableParams.authAppTypes,
            adminokens:testCustomizableParams.adminusersType,
            myWebUITokenToSignUP:testCustomizableParams.usermsToken,
            userTypeTest:{
                "name": "Micio",
                "email": "mario@caport.com",
                "password": "miciomicio",
                "surname":"Macio",
                "type": testCustomizableParams.usersType[0]
            },
            webUiAppTest:{
                "email": "webui@webui.it",
                "password": "miciomicio",
                "type": testCustomizableParams.authAppTypes[0]
            },
            adminLogin:{
                "username": "admin@admin.com",
                "password": "admin"
            },
            AuthRoles:[
                {URI:"/users", token:testCustomizableParams.adminusersType, method:"GET"},
                {URI:"/users",token:testCustomizableParams.adminusersType, method:"POST"},
                {URI:"/users/:id",token:adminUserToken, method:"GET"},
                {URI:"/users/:id",token:adminUserToken, method:"PUT"},
                {URI:"/users/:id",token:testCustomizableParams.adminusersType, method:"DELETE"},
                {URI:"/users/signup",token:testCustomizableParams.authAppTypes, method:"POST"},
                {URI:"/users/signin",token:testCustomizableParams.authAppTypes, method:"POST"},
                {URI:"/users/:id/actions/resetpassword",token:adminAuthAppToken, method:"POST"},
                {URI:"/users/:id/actions/setpassword",token:adminUserAuthAppToken, method:"POST"},
                {URI:"/users/:id/actions/changeuserid",token:testCustomizableParams.adminusersType, method:"POST"},
                {URI:"/users/:id/actions/enable",token:testCustomizableParams.adminusersType, method:"POST"},
                {URI:"/users/:id/actions/disable",token:testCustomizableParams.adminusersType, method:"POST"},
                {URI:"/users/actions/email/find/:term",token:testCustomizableParams.adminusersType, method:"GET"}
            ],
            webUiID:""
        },




  },


  production:{
        dbHost:'localhost',
        dbPort:'27017',
        dbName:'CP2020USER',
        limit:50,
        skip:0,
        logfile:"/var/log/caport2020User-Microservice.log",
        adminUser:["admin", "userms"],
        //defaultAdminUser:"admin@admin.com",
        SignUpAuthorizedAppAndMS:["webuiMS"], // signUp
        SignInAuthorizedAppAndMS:["webuiMS"], // Login
        microserviceAuthMS:"http://localhost:3005",
        MyMicroserviceToken:"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoibXMiLCJpc3MiOiJub3QgdXNlZCBmbyBtcyIsImVtYWlsIjoibm90IHVzZWQgZm8gbXMiLCJ0eXBlIjoidXNlcm1zIiwiZW5hYmxlZCI6dHJ1ZSwiZXhwIjoxNzg5OTkzNzM5MjU0fQ.-8ZeJjQbzjXRYaMo6NN0uYGxg9mXCUqjVmwhWqSG4N8",
        //MyMicroserviceToken:"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoibXMiLCJpc3MiOiJub3QgdXNlZCBmbyBtcyIsImVtYWlsIjoibm90IHVzZWQgZm8gbXMiLCJ0eXBlIjoiVXNlcnNTZXJ2aWNlIiwiZW5hYmxlZCI6dHJ1ZSwiZXhwIjoxNzgxNTQwOTUzMDg4fQ.s-TB-bKM4pGorAb2J4axkVHUrwEGLmtOF4vJpx6bt-M",
        AdminDefaultUser : {
            "name": "Admin",
            "email": "admin@admin.com",
            "surname":"Admin"

        }

      //userType:["admin","crocierista" , "ente", "operatore"], //admin is a superuser then it must not be deleted or moved from position [0] in the array
       // appType:["webui", "ext", "user"] //webUi is an internal microservice then it must not be deleted or moved from position [0] in the array
  }
};


var conf;
if (process.env['NODE_ENV'] === 'dev') {
    conf = config.dev;
}
else{
    conf = config.production;
}

module.exports.conf = conf;
module.exports.generalConf = config;
