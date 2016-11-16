define({ "api": [
  {
    "type": "",
    "url": "Configuration",
    "title": "Fields",
    "version": "1.0.0",
    "name": "Configuration",
    "group": "Configuration",
    "description": "<p>This section describe configuration File fields</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "dbPort",
            "description": "<p>Contains the mongoDb Port number</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "dbHost",
            "description": "<p>Contains the mongoDb Host name</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "dbName",
            "description": "<p>Contains the mongoDb database name</p> "
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "limit",
            "description": "<p>Contains the default limit param used to paginate get response</p> "
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "skip",
            "description": "<p>Contains the default skip param used to paginate get response</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "logfile",
            "description": "<p>where to save log information</p> "
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "SignUpAuthorizedAppAndMS",
            "description": "<p>Contains a list of Strings speciging signup Authorized app Type(defined in AuthMS)  as in the next example --&gt; [&quot;webUi&quot;]</p> "
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "SignInAuthorizedAppAndMS",
            "description": "<p>Contains a list of Strings speciging login  Authorized app Type(defined in AuthMS)  as in the next example --&gt; [&quot;webUi&quot;]</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "authHost",
            "description": "<p>Host of AuthMs microservices</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "MyMicroserviceToken",
            "description": "<p>String containig the token for this Application microservice. To get it regiter this Ms in AuthMs</p> "
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "adminUser",
            "description": "<p>Contains a list of Strings Admin User Type(defined in AuthMS) as in the next example --&gt; [&quot;admin&quot;]</p> "
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "AdminDefaultUser",
            "description": "<p>Object containig the default admin user to create in users.</p> "
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "UserSchema",
            "description": "<p>Object containig the mongoDb Schema of Users. if not specified it use a Schema defined in models/users.js</p> "
          }
        ]
      }
    },
    "filename": "routes/middlewares.js",
    "groupTitle": "Configuration"
  },
  {
    "type": "post",
    "url": "/users/",
    "title": "Register a new User",
    "version": "1.0.0",
    "name": "Create_User",
    "group": "Users",
    "description": "<p>Accessible by access_token of admin type. It create a new User object and return the access_credentials.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>access_token to access to this resource. it must be sended in [ body || as query param || header]</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>the user dictionary with all the fields, only email, password and type are mandatory.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "HTTP/1.1 POST request\n Body:{ \"email\": \"prov@prova.it\" , \"password\":\"provami\", \"type\":\"crocierista\", \"name\":\"nome\", \"surname\":\"cognome\"}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "201 - Created": [
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "access_credentials",
            "description": "<p>contains information about access_credemtials.</p> "
          },
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "access_credentials.apiKey",
            "description": "<p>contains information about apiKey</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.apiKey.token",
            "description": "<p>contains user Token</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.apiKey.expires",
            "description": "<p>contains information about token life</p> "
          },
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "access_credentials.refreshToken",
            "description": "<p>contains information about refreshToken used to renew token</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.refreshToken.token",
            "description": "<p>contains user refreshToken</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.refreshToken.expires",
            "description": "<p>contains information about refreshToken life</p> "
          },
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "Created_resource",
            "description": "<p>contains the created User resourcce</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "Created_resource.UserField_1",
            "description": "<p>Contains field 1 defined in User Schema(example name)</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "Created_resource.UserField_2",
            "description": "<p>Contains field 2 defined in User Schema(example surname)</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "Created_resource.UserField_N",
            "description": "<p>Contains field N defined in User Schema(example type)</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Example: 201 CREATED",
          "content": " HTTP/1.1 201 CREATED\n\n{\n   \"created_resource\":{\n            \"name\":\"Micio\",\n            \"email\":\"mario@caport.com\",\n            \"surname\":\"Macio\",\n            \"id\":\"57643332ab9293ff0b5da6f0\"\n   },\n   \"access_credentials\":{\n            \"apiKey\":{\n                    \"token\":\"VppR5sHU_hV3U\",\n                    \"expires\":1466789299072\n             },\n             \"refreshToken\":{\n                     \"token\":\"eQO7de4AJe-syk\",\n                     \"expires\":1467394099074\n              }\n   }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/users.js",
    "groupTitle": "Users",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> not authorized to call this endpoint.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>NotAuthorized ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>only admin user can create admin user</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400_BadRequest",
            "description": "<p><b>BadRequest:</b> The server cannot or will not process the request due to something that is perceived to be a client error<BR> <b>request.body.error</b> Error name as: <i>BadRequest ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem as: <i>malformed request syntax, invalid reques, invalid fields ....</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500_ServerError",
            "description": "<p><b>ServerError:</b>Internal Server Error. <BR> <b>request.body.error</b> contains an error type message specifing the problem as: <i>Db Internal Microservice Error ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>Connection Down</i><BR></p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response: 401 Unauthorized",
          "content": "HTTP/1.1 401 Unauthorized\n {\n    error:\"invalid_token\",\n    error_description:\"Unauthorized: The access token expired\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 400 BadRequest",
          "content": "HTTP/1.1 400 InvalidRequest\n {\n    error:'BadRequest',\n    error_message:'no body sended',\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 500 Internal Server Error",
          "content": "HTTP/1.1 500 Internal Server Error\n {\n    error: 'Internal Error'\n    error_message: 'something blew up, ERROR: No MongoDb Connection'\n }",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/users/signup",
    "title": "Register a new User",
    "version": "1.0.0",
    "name": "Create_User",
    "group": "Users",
    "description": "<p>Accessible by access_token of type specified in config.js SignUpAuthorizedAppAndMS field. It create a new User object and return the access_credentials.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>access_token to access to this resource. it must be sended in [ body || as query param || header]</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>the user dictionary with all the fields, only email, password and type are mandatory.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "HTTP/1.1 POST request\n Body:{ \"email\": \"prov@prova.it\" , \"password\":\"provami\", \"type\":\"crocierista\", \"name\":\"nome\", \"surname\":\"cognome\"}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "201 - Created": [
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "access_credentials",
            "description": "<p>contains information about access_credemtials.</p> "
          },
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "access_credentials.apiKey",
            "description": "<p>contains information about apiKey</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.apiKey.token",
            "description": "<p>contains user Token</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.apiKey.expires",
            "description": "<p>contains information about token life</p> "
          },
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "access_credentials.refreshToken",
            "description": "<p>contains information about refreshToken used to renew token</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.refreshToken.token",
            "description": "<p>contains user refreshToken</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.refreshToken.expires",
            "description": "<p>contains information about refreshToken life</p> "
          },
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "Created_resource",
            "description": "<p>contains the created User resource</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "Created_resource.UserField_1",
            "description": "<p>Contains field 1 defined in User Schema(example name)</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "Created_resource.UserField_2",
            "description": "<p>Contains field 2 defined in User Schema(example surname)</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "Created_resource.UserField_N",
            "description": "<p>Contains field N defined in User Schema(example type)</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Example: 201 CREATED",
          "content": " HTTP/1.1 201 CREATED\n\n{\n   \"created_resource\":{\n            \"name\":\"Micio\",\n            \"email\":\"mario@caport.com\",\n            \"surname\":\"Macio\",\n            \"id\":\"57643332ab9293ff0b5da6f0\"\n   },\n   \"access_credentials\":{\n            \"apiKey\":{\n                    \"token\":\"VppR5sHU_hV3U\",\n                    \"expires\":1466789299072\n             },\n             \"refreshToken\":{\n                     \"token\":\"eQO7de4AJe-syk\",\n                     \"expires\":1467394099074\n              }\n   }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/users.js",
    "groupTitle": "Users",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> not authorized to call this endpoint.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>NotAuthorized ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>only admin user can create admin user</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400_BadRequest",
            "description": "<p><b>BadRequest:</b> The server cannot or will not process the request due to something that is perceived to be a client error<BR> <b>request.body.error</b> Error name as: <i>BadRequest ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem as: <i>malformed request syntax, invalid reques, invalid fields ....</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500_ServerError",
            "description": "<p><b>ServerError:</b>Internal Server Error. <BR> <b>request.body.error</b> contains an error type message specifing the problem as: <i>Db Internal Microservice Error ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>Connection Down</i><BR></p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response: 401 Unauthorized",
          "content": "HTTP/1.1 401 Unauthorized\n {\n    error:\"invalid_token\",\n    error_description:\"Unauthorized: The access token expired\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 400 BadRequest",
          "content": "HTTP/1.1 400 InvalidRequest\n {\n    error:'BadRequest',\n    error_message:'no body sended',\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 500 Internal Server Error",
          "content": "HTTP/1.1 500 Internal Server Error\n {\n    error: 'Internal Error'\n    error_message: 'something blew up, ERROR: No MongoDb Connection'\n }",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "delete",
    "url": "/users/:id",
    "title": "delete User",
    "version": "1.0.0",
    "name": "Delete_User",
    "group": "Users",
    "description": "<p>Accessible by access_token, It creatdelete User  and return the deleted resource. To call this endpoint must have an admin token.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>access_token to access to this resource. it must be sended in [ body || as query param || header]</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>the user id to identify the user</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201 - Created": [
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "UserField_1",
            "description": "<p>Contains field 1 updated and defined in User Schema(example name)</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "UserField_2",
            "description": "<p>Contains field 2 updated and defined in User Schema(example surname)</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "UserField_N",
            "description": "<p>Contains field N updated and defined in User Schema(example type)</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Example: 201 CREATED",
          "content": " HTTP/1.1 204 DELETED\n\n{\n   \"name\":\"Micio\",\n   \"surname\":\"Macio\",\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/users.js",
    "groupTitle": "Users",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> not authorized to call this endpoint.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>NotAuthorized ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>only admin user can create admin user</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404_NotFound",
            "description": "<p><b>NotFound:</b> the Object with specified <code>id</code> was not found.<BR> <b>request.body.error</b> contains an error name specifing the not Found Error.<BR> <b>request.body.erro_messager</b> contains an error message specifing the not Found Error.<BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400_BadRequest",
            "description": "<p><b>BadRequest:</b> The server cannot or will not process the request due to something that is perceived to be a client error<BR> <b>request.body.error</b> Error name as: <i>BadRequest ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem as: <i>malformed request syntax, invalid reques, invalid fields ....</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500_ServerError",
            "description": "<p><b>ServerError:</b>Internal Server Error. <BR> <b>request.body.error</b> contains an error type message specifing the problem as: <i>Db Internal Microservice Error ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>Connection Down</i><BR></p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response: 401 Unauthorized",
          "content": "HTTP/1.1 401 Unauthorized\n {\n    error:\"invalid_token\",\n    error_description:\"Unauthorized: The access token expired\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 400 BadRequest",
          "content": "HTTP/1.1 400 InvalidRequest\n {\n    error:'BadRequest',\n    error_message:'no body sended',\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 500 Internal Server Error",
          "content": "HTTP/1.1 500 Internal Server Error\n {\n    error: 'Internal Error'\n    error_message: 'something blew up, ERROR: No MongoDb Connection'\n }",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/users/:id/actions/disable",
    "title": "disable user",
    "version": "1.0.0",
    "name": "DisableUser",
    "group": "Users",
    "description": "<p>Accessible by access_token, It disable the user. To call this endpoint must have an admin token.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>access_token to access to this resource. it must be sended in [ body || as query param || header]</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>the user id to identify the user</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201 - Created": [
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>contains the new user status</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Example: 201 CREATED",
          "content": " HTTP/1.1 201 CREATED\n\n{\n   \"status\":\"disabled\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/users.js",
    "groupTitle": "Users",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> not authorized to call this endpoint.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>NotAuthorized ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>only admin user can create admin user</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404_NotFound",
            "description": "<p><b>NotFound:</b> the Object with specified <code>id</code> was not found.<BR> <b>request.body.error</b> contains an error name specifing the not Found Error.<BR> <b>request.body.erro_messager</b> contains an error message specifing the not Found Error.<BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400_BadRequest",
            "description": "<p><b>BadRequest:</b> The server cannot or will not process the request due to something that is perceived to be a client error<BR> <b>request.body.error</b> Error name as: <i>BadRequest ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem as: <i>malformed request syntax, invalid reques, invalid fields ....</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500_ServerError",
            "description": "<p><b>ServerError:</b>Internal Server Error. <BR> <b>request.body.error</b> contains an error type message specifing the problem as: <i>Db Internal Microservice Error ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>Connection Down</i><BR></p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response: 401 Unauthorized",
          "content": "HTTP/1.1 401 Unauthorized\n {\n    error:\"invalid_token\",\n    error_description:\"Unauthorized: The access token expired\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 400 BadRequest",
          "content": "HTTP/1.1 400 InvalidRequest\n {\n    error:'BadRequest',\n    error_message:'no body sended',\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 500 Internal Server Error",
          "content": "HTTP/1.1 500 Internal Server Error\n {\n    error: 'Internal Error'\n    error_message: 'something blew up, ERROR: No MongoDb Connection'\n }",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/users/:id/actions/enable",
    "title": "eable user",
    "version": "1.0.0",
    "name": "EnableUser",
    "group": "Users",
    "description": "<p>Accessible by access_token, It enable the user. To call this endpoint must have an admin token.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>access_token to access to this resource. it must be sended in [ body || as query param || header]</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>the user id to identify the user</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201 - Created": [
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>contains the new user status</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Example: 201 CREATED",
          "content": " HTTP/1.1 201 CREATED\n\n{\n   \"status\":\"enabled\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/users.js",
    "groupTitle": "Users",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> not authorized to call this endpoint.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>NotAuthorized ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>only admin user can create admin user</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404_NotFound",
            "description": "<p><b>NotFound:</b> the Object with specified <code>id</code> was not found.<BR> <b>request.body.error</b> contains an error name specifing the not Found Error.<BR> <b>request.body.erro_messager</b> contains an error message specifing the not Found Error.<BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400_BadRequest",
            "description": "<p><b>BadRequest:</b> The server cannot or will not process the request due to something that is perceived to be a client error<BR> <b>request.body.error</b> Error name as: <i>BadRequest ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem as: <i>malformed request syntax, invalid reques, invalid fields ....</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500_ServerError",
            "description": "<p><b>ServerError:</b>Internal Server Error. <BR> <b>request.body.error</b> contains an error type message specifing the problem as: <i>Db Internal Microservice Error ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>Connection Down</i><BR></p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response: 401 Unauthorized",
          "content": "HTTP/1.1 401 Unauthorized\n {\n    error:\"invalid_token\",\n    error_description:\"Unauthorized: The access token expired\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 400 BadRequest",
          "content": "HTTP/1.1 400 InvalidRequest\n {\n    error:'BadRequest',\n    error_message:'no body sended',\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 500 Internal Server Error",
          "content": "HTTP/1.1 500 Internal Server Error\n {\n    error: 'Internal Error'\n    error_message: 'something blew up, ERROR: No MongoDb Connection'\n }",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/users/:id",
    "title": "Get the User by id",
    "version": "1.0.0",
    "name": "GetUser",
    "group": "Users",
    "description": "<p>Returns the info about a User. To call this endpoint must have an admin account or must be the User itself.</p> ",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.id",
            "description": "<p>User id identifier</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.field1",
            "description": "<p>fiend 1 defined in schema</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.field2",
            "description": "<p>fiend 2 defined in schema</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.fieldN",
            "description": "<p>fiend N defined in schema</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Example: 200 OK, Success Response",
          "content": "\n{\n\n   \"id\": \"543fdd60579e1281b8f6da92\",\n   \"email\": \"prova@prova.it\",\n   \"name\": \"prova\",\n   \"surname\": \"surname\",\n   \"notes\": \"Notes About prova\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/users.js",
    "groupTitle": "Users",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> not authorized to call this endpoint.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>NotAuthorized ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>only admin user can create admin user</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404_NotFound",
            "description": "<p><b>NotFound:</b> the Object with specified <code>id</code> was not found.<BR> <b>request.body.error</b> contains an error name specifing the not Found Error.<BR> <b>request.body.erro_messager</b> contains an error message specifing the not Found Error.<BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400_BadRequest",
            "description": "<p><b>BadRequest:</b> The server cannot or will not process the request due to something that is perceived to be a client error<BR> <b>request.body.error</b> Error name as: <i>BadRequest ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem as: <i>malformed request syntax, invalid reques, invalid fields ....</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500_ServerError",
            "description": "<p><b>ServerError:</b>Internal Server Error. <BR> <b>request.body.error</b> contains an error type message specifing the problem as: <i>Db Internal Microservice Error ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>Connection Down</i><BR></p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response: 401 Unauthorized",
          "content": "HTTP/1.1 401 Unauthorized\n {\n    error:\"invalid_token\",\n    error_description:\"Unauthorized: The access token expired\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 400 BadRequest",
          "content": "HTTP/1.1 400 InvalidRequest\n {\n    error:'BadRequest',\n    error_message:'no body sended',\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 500 Internal Server Error",
          "content": "HTTP/1.1 500 Internal Server Error\n {\n    error: 'Internal Error'\n    error_message: 'something blew up, ERROR: No MongoDb Connection'\n }",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/users/",
    "title": "Get all Users",
    "version": "1.0.0",
    "name": "Get_User",
    "group": "Users",
    "description": "<p>Accessible by admin user access_token specified in config.js adminUser field. It returns the paginated list of all Users. To set pagination skip and limit, you can do it in the URL request, for example &quot;get /users?skip=10&amp;limit=50&quot;</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>access_token to access to this resource. it must be sended in [ as query param || header]</p> "
          }
        ]
      }
    },
    "filename": "routes/users.js",
    "groupTitle": "Users",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "_metadata",
            "description": "<p>object containing metadata for pagination information</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "_metadata.skip",
            "description": "<p>Skips the first skip results of this Query</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "_metadata.limit",
            "description": "<p>Limits the number of results to be returned by this Query.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "_metadata.totalCount",
            "description": "<p>Total number of query results.</p> "
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "users",
            "description": "<p>a paginated array list of users objects</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "users.id",
            "description": "<p>User id identifier</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "users.field1",
            "description": "<p>fiend 1 defined in schema</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "users.field2",
            "description": "<p>fiend 2 defined in schema</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "users.fieldN",
            "description": "<p>fiend N defined in schema</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Example: 200 OK, Success Response",
          "content": "\n {\n   \"Users\":[\n                  {\n                      \"id\": \"543fdd60579e1281b8f6da92\",\n                      \"email\": \"prova@prova.it\",\n                       \"name\": \"prova\",\n                      \"surname\": \"surname\",\n                      \"notes\": \"Notes About prova\"\n                  },\n                  {\n                   \"id\": \"543fdd60579e1281sdaf6da92\",\n                      \"email\": \"prova1@prova.it\",\n                      \"name\": \"prova1\",\n                      \"surname\": \"surname\"1,\n                      \"notes\": \"Notes About prova1\"\n\n                 },\n                ...\n             ],\n\n   \"_metadata\":{\n               \"skip\":10,\n               \"limit\":50,\n               \"totalCount\":100\n           }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> not authorized to call this endpoint.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>NotAuthorized ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>only admin user can create admin user</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404_NotFound",
            "description": "<p><b>NotFound:</b> the Object with specified <code>id</code> was not found.<BR> <b>request.body.error</b> contains an error name specifing the not Found Error.<BR> <b>request.body.erro_messager</b> contains an error message specifing the not Found Error.<BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400_BadRequest",
            "description": "<p><b>BadRequest:</b> The server cannot or will not process the request due to something that is perceived to be a client error<BR> <b>request.body.error</b> Error name as: <i>BadRequest ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem as: <i>malformed request syntax, invalid reques, invalid fields ....</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500_ServerError",
            "description": "<p><b>ServerError:</b>Internal Server Error. <BR> <b>request.body.error</b> contains an error type message specifing the problem as: <i>Db Internal Microservice Error ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>Connection Down</i><BR></p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response: 401 Unauthorized",
          "content": "HTTP/1.1 401 Unauthorized\n {\n    error:\"invalid_token\",\n    error_description:\"Unauthorized: The access token expired\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 400 BadRequest",
          "content": "HTTP/1.1 400 InvalidRequest\n {\n    error:'BadRequest',\n    error_message:'no body sended',\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 500 Internal Server Error",
          "content": "HTTP/1.1 500 Internal Server Error\n {\n    error: 'Internal Error'\n    error_message: 'something blew up, ERROR: No MongoDb Connection'\n }",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/users/signin",
    "title": "User login",
    "version": "1.0.0",
    "name": "Login_User",
    "group": "Users",
    "description": "<p>Accessible by access_token of type specified in config.js SignInAuthorizedAppAndMS field. It login User and return the access_credentials.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>access_token to access to this resource. it must be sended in [ body || as query param || header]</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>the email of the user</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>the password of the user</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "HTTP/1.1 POST request\n Body:{ \"username\": \"prov@prova.it\" , \"password\":\"provami\"}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "201 - Created": [
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "access_credentials",
            "description": "<p>contains information about access_credemtials.</p> "
          },
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "access_credentials.apiKey",
            "description": "<p>contains information about apiKey</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.apiKey.token",
            "description": "<p>contains user Token</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.apiKey.expires",
            "description": "<p>contains information about token life</p> "
          },
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "access_credentials.refreshToken",
            "description": "<p>contains information about refreshToken used to renew token</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.refreshToken.token",
            "description": "<p>contains user refreshToken</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.refreshToken.expires",
            "description": "<p>contains information about refreshToken life</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Example: 201 CREATED",
          "content": " HTTP/1.1 201 CREATED\n\n{\n   \"access_credentials\":{\n            \"apiKey\":{\n                    \"token\":\"VppR5sHU_hV3U\",\n                    \"expires\":1466789299072\n             },\n             \"refreshToken\":{\n                     \"token\":\"eQO7de4AJe-syk\",\n                     \"expires\":1467394099074\n              }\n   }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/users.js",
    "groupTitle": "Users",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> not authorized to call this endpoint.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>NotAuthorized ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>only admin user can create admin user</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400_BadRequest",
            "description": "<p><b>BadRequest:</b> The server cannot or will not process the request due to something that is perceived to be a client error<BR> <b>request.body.error</b> Error name as: <i>BadRequest ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem as: <i>malformed request syntax, invalid reques, invalid fields ....</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500_ServerError",
            "description": "<p><b>ServerError:</b>Internal Server Error. <BR> <b>request.body.error</b> contains an error type message specifing the problem as: <i>Db Internal Microservice Error ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>Connection Down</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "403_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> username or password not valid.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>Not Logged ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>wrong username or password</i><BR></p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response: 401 Unauthorized",
          "content": "HTTP/1.1 401 Unauthorized\n {\n    error:\"invalid_token\",\n    error_description:\"Unauthorized: The access token expired\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 400 BadRequest",
          "content": "HTTP/1.1 400 InvalidRequest\n {\n    error:'BadRequest',\n    error_message:'no body sended',\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 500 Internal Server Error",
          "content": "HTTP/1.1 500 Internal Server Error\n {\n    error: 'Internal Error'\n    error_message: 'something blew up, ERROR: No MongoDb Connection'\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 403 Unauthorized",
          "content": "HTTP/1.1 403 Unauthorized\n {\n    error:\"Unauthorized\",\n    error_description:\"Warning: wrong username\"\n }",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/users/:id/actions/resetpassword",
    "title": "Reset User password",
    "version": "1.0.0",
    "name": "ResetPassword",
    "group": "Users",
    "description": "<p>Accessible by admin od AuthApp access_token define in config.js, It create a reset password Token.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>access_token to access to this resource. it must be sended in [ body || as query param || header]</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>the user id or username(email) the identify the user</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201 - Created": [
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "reset_token",
            "description": "<p>Contains granttoken to set the new password</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Example: 201 CREATED",
          "content": " HTTP/1.1 201 CREATED\n\n{\n   \"reset_token\":\"ffewfh5hfdfds7678d6fsdf7d6fsdfd86d8sf6\", *\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/users.js",
    "groupTitle": "Users",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> not authorized to call this endpoint.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>NotAuthorized ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>only admin user can create admin user</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404_NotFound",
            "description": "<p><b>NotFound:</b> the Object with specified <code>id</code> was not found.<BR> <b>request.body.error</b> contains an error name specifing the not Found Error.<BR> <b>request.body.erro_messager</b> contains an error message specifing the not Found Error.<BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400_BadRequest",
            "description": "<p><b>BadRequest:</b> The server cannot or will not process the request due to something that is perceived to be a client error<BR> <b>request.body.error</b> Error name as: <i>BadRequest ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem as: <i>malformed request syntax, invalid reques, invalid fields ....</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500_ServerError",
            "description": "<p><b>ServerError:</b>Internal Server Error. <BR> <b>request.body.error</b> contains an error type message specifing the problem as: <i>Db Internal Microservice Error ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>Connection Down</i><BR></p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response: 401 Unauthorized",
          "content": "HTTP/1.1 401 Unauthorized\n {\n    error:\"invalid_token\",\n    error_description:\"Unauthorized: The access token expired\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 400 BadRequest",
          "content": "HTTP/1.1 400 InvalidRequest\n {\n    error:'BadRequest',\n    error_message:'no body sended',\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 500 Internal Server Error",
          "content": "HTTP/1.1 500 Internal Server Error\n {\n    error: 'Internal Error'\n    error_message: 'something blew up, ERROR: No MongoDb Connection'\n }",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/users/:term/actions/email/find",
    "title": "Search all Users",
    "version": "1.0.0",
    "name": "SEARCH_User",
    "group": "Users",
    "description": "<p>Accessible by admin user access_token specified in config.js adminUser field. It returns the paginated list of all Users that matching the search term to username.. To set pagination skip and limit, you can do it in the URL request, for example &quot;get /users?skip=10&amp;limit=50&quot;</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>access_token to access to this resource. it must be sended in [ as query param || header]</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "skip",
            "description": "<p>start pagination</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "limit",
            "description": "<p>the number of elements</p> "
          }
        ]
      }
    },
    "filename": "routes/users.js",
    "groupTitle": "Users",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "_metadata",
            "description": "<p>object containing metadata for pagination information</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "_metadata.skip",
            "description": "<p>Skips the first skip results of this Query</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "_metadata.limit",
            "description": "<p>Limits the number of results to be returned by this Query.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "_metadata.totalCount",
            "description": "<p>Total number of query results.</p> "
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "users",
            "description": "<p>a paginated array list of users objects</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "users.id",
            "description": "<p>User id identifier</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "users.field1",
            "description": "<p>fiend 1 defined in schema</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "users.field2",
            "description": "<p>fiend 2 defined in schema</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "users.fieldN",
            "description": "<p>fiend N defined in schema</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Example: 200 OK, Success Response",
          "content": "\n {\n   \"Users\":[\n                  {\n                      \"id\": \"543fdd60579e1281b8f6da92\",\n                      \"email\": \"prova@prova.it\",\n                       \"name\": \"prova\",\n                      \"surname\": \"surname\",\n                      \"notes\": \"Notes About prova\"\n                  },\n                  {\n                   \"id\": \"543fdd60579e1281sdaf6da92\",\n                      \"email\": \"prova1@prova.it\",\n                      \"name\": \"prova1\",\n                      \"surname\": \"surname\"1,\n                      \"notes\": \"Notes About prova1\"\n\n                 },\n                ...\n             ],\n\n   \"_metadata\":{\n               \"skip\":10,\n               \"limit\":50,\n               \"totalCount\":100\n           }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> not authorized to call this endpoint.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>NotAuthorized ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>only admin user can create admin user</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404_NotFound",
            "description": "<p><b>NotFound:</b> the Object with specified <code>id</code> was not found.<BR> <b>request.body.error</b> contains an error name specifing the not Found Error.<BR> <b>request.body.erro_messager</b> contains an error message specifing the not Found Error.<BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400_BadRequest",
            "description": "<p><b>BadRequest:</b> The server cannot or will not process the request due to something that is perceived to be a client error<BR> <b>request.body.error</b> Error name as: <i>BadRequest ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem as: <i>malformed request syntax, invalid reques, invalid fields ....</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500_ServerError",
            "description": "<p><b>ServerError:</b>Internal Server Error. <BR> <b>request.body.error</b> contains an error type message specifing the problem as: <i>Db Internal Microservice Error ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>Connection Down</i><BR></p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response: 401 Unauthorized",
          "content": "HTTP/1.1 401 Unauthorized\n {\n    error:\"invalid_token\",\n    error_description:\"Unauthorized: The access token expired\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 400 BadRequest",
          "content": "HTTP/1.1 400 InvalidRequest\n {\n    error:'BadRequest',\n    error_message:'no body sended',\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 500 Internal Server Error",
          "content": "HTTP/1.1 500 Internal Server Error\n {\n    error: 'Internal Error'\n    error_message: 'something blew up, ERROR: No MongoDb Connection'\n }",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/users/:id/actions/setpassword",
    "title": "Set new User password",
    "version": "1.0.0",
    "name": "SetPassword",
    "group": "Users",
    "description": "<p>Accessible by access_token, It update user password. To call this endpoint must have an admin token or must be the User itself or reset_token.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>access_token to access to this resource. it must be sended in [ body || as query param || header]</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>the user id or username(email) the identify the user</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "201 - Created": [
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "access_credentials",
            "description": "<p>contains information about access_credemtials.</p> "
          },
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "access_credentials.apiKey",
            "description": "<p>contains information about apiKey</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.apiKey.token",
            "description": "<p>contains user Token</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.apiKey.expires",
            "description": "<p>contains information about token life</p> "
          },
          {
            "group": "201 - Created",
            "type": "Object",
            "optional": false,
            "field": "access_credentials.refreshToken",
            "description": "<p>contains information about refreshToken used to renew token</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.refreshToken.token",
            "description": "<p>contains user refreshToken</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "access_credentials.refreshToken.expires",
            "description": "<p>contains information about refreshToken life</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Example: 201 CREATED",
          "content": " HTTP/1.1 201 CREATED\n\n{\n   \"access_credentials\":{\n            \"apiKey\":{\n                    \"token\":\"VppR5sHU_hV3U\",\n                    \"expires\":1466789299072\n             },\n             \"refreshToken\":{\n                     \"token\":\"eQO7de4AJe-syk\",\n                     \"expires\":1467394099074\n              }\n   }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/users.js",
    "groupTitle": "Users",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> not authorized to call this endpoint.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>NotAuthorized ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>only admin user can create admin user</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404_NotFound",
            "description": "<p><b>NotFound:</b> the Object with specified <code>id</code> was not found.<BR> <b>request.body.error</b> contains an error name specifing the not Found Error.<BR> <b>request.body.erro_messager</b> contains an error message specifing the not Found Error.<BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400_BadRequest",
            "description": "<p><b>BadRequest:</b> The server cannot or will not process the request due to something that is perceived to be a client error<BR> <b>request.body.error</b> Error name as: <i>BadRequest ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem as: <i>malformed request syntax, invalid reques, invalid fields ....</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500_ServerError",
            "description": "<p><b>ServerError:</b>Internal Server Error. <BR> <b>request.body.error</b> contains an error type message specifing the problem as: <i>Db Internal Microservice Error ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>Connection Down</i><BR></p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response: 401 Unauthorized",
          "content": "HTTP/1.1 401 Unauthorized\n {\n    error:\"invalid_token\",\n    error_description:\"Unauthorized: The access token expired\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 400 BadRequest",
          "content": "HTTP/1.1 400 InvalidRequest\n {\n    error:'BadRequest',\n    error_message:'no body sended',\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 500 Internal Server Error",
          "content": "HTTP/1.1 500 Internal Server Error\n {\n    error: 'Internal Error'\n    error_message: 'something blew up, ERROR: No MongoDb Connection'\n }",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "put",
    "url": "/users/:id",
    "title": "Update User",
    "version": "1.0.0",
    "name": "Update_User",
    "group": "Users",
    "description": "<p>Accessible by access_token, It create a new User object and return the updated resource. To call this endpoint must have an admin token or must be the User itself.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>access_token to access to this resource. it must be sended in [ body || as query param || header]</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>the user dictionary with all the fields to update, only email(username), password(there is a rest password ndpoinr) and user type can not be updated.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "HTTP/1.1 PUT request\n Body:{ \"name\":\"nome\", \"surname\":\"cognome\"}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "201 - Created": [
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "UserField_1",
            "description": "<p>Contains field 1 updated and defined in User Schema(example name)</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "UserField_2",
            "description": "<p>Contains field 2 updated and defined in User Schema(example surname)</p> "
          },
          {
            "group": "201 - Created",
            "type": "String",
            "optional": false,
            "field": "UserField_N",
            "description": "<p>Contains field N updated and defined in User Schema(example type)</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Example: 201 CREATED",
          "content": " HTTP/1.1 201 CREATED\n\n{\n   \"name\":\"Micio\",\n   \"surname\":\"Macio\",\n}",
          "type": "json"
        }
      ]
    },
    "filename": "routes/users.js",
    "groupTitle": "Users",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "401_Unauthorized",
            "description": "<p><strong>Unauthorized:</strong> not authorized to call this endpoint.<BR> <b>request.body.error</b> Error name specifing the problem as: <i>NotAuthorized ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>only admin user can create admin user</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404_NotFound",
            "description": "<p><b>NotFound:</b> the Object with specified <code>id</code> was not found.<BR> <b>request.body.error</b> contains an error name specifing the not Found Error.<BR> <b>request.body.erro_messager</b> contains an error message specifing the not Found Error.<BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400_BadRequest",
            "description": "<p><b>BadRequest:</b> The server cannot or will not process the request due to something that is perceived to be a client error<BR> <b>request.body.error</b> Error name as: <i>BadRequest ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem as: <i>malformed request syntax, invalid reques, invalid fields ....</i><BR></p> "
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500_ServerError",
            "description": "<p><b>ServerError:</b>Internal Server Error. <BR> <b>request.body.error</b> contains an error type message specifing the problem as: <i>Db Internal Microservice Error ....</i><BR> <b>request.body.error_message</b> Error Message specifing the problem  as: <i>Connection Down</i><BR></p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response: 401 Unauthorized",
          "content": "HTTP/1.1 401 Unauthorized\n {\n    error:\"invalid_token\",\n    error_description:\"Unauthorized: The access token expired\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 400 BadRequest",
          "content": "HTTP/1.1 400 InvalidRequest\n {\n    error:'BadRequest',\n    error_message:'no body sended',\n }",
          "type": "json"
        },
        {
          "title": "Error-Response: 500 Internal Server Error",
          "content": "HTTP/1.1 500 Internal Server Error\n {\n    error: 'Internal Error'\n    error_message: 'something blew up, ERROR: No MongoDb Connection'\n }",
          "type": "json"
        }
      ]
    }
  }
] });