var mongoose = require('mongoose');
var findAllFn = require('./metadata').findAll;
var Schema = mongoose.Schema;


var conf=require('../config').conf;


var validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

var userSch= conf.UserSchema || {
        _id: {type: Schema.Types.ObjectId, index:true}, // id in Authentication microservice
        name: String,
        surname: String,
        email: {
            type: String,
            trim: true,
            unique: true,
            index: true,
            required: 'Email address is required',
            validate: [validateEmail, 'Please fill a valid email address'],
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        avatar: String,
        ckan_apikey: String,
        // password: String,  // passportLocalMongoose manage hash and salt information
        notes: String
    };


var UserSchema = new Schema(userSch, {strict: "throw"});

// Static method to retrieve resource WITH metadata
UserSchema.statics.findAll = function (conditions, fields, options, callback) {
    return findAllFn(this, 'users', conditions, fields, options, callback);
};


var User = mongoose.model('User', UserSchema);

module.exports.UserSchema = UserSchema;
module.exports.User = User;
