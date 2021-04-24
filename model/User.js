var mongoConfigs = require('./mongoConfigs');

function insertUser(username,password,image,callback){
    var db = mongoConfigs.getDB();
    db.collection('users').insertOne({username:username,password:password,image:image},function(err,result){
        callback(err,result);
    });
}

function getAllUsers(callback, username, password, image){
    var db = mongoConfigs.getDB();

    var filters = { };

    if(username !== undefined) filters.username = username;
    if(password !== undefined) filters.password = password;
    if(image !== undefined) filters.image = image;

    db.collection('users').find(filters).toArray(function(err,result){
        callback(result);
    });
}

function getUsername(username, callback){
    var db = mongoConfigs.getDB();
    var filters = { };

    if(username !== undefined) filters.username = username;
    db.collection('users').find(filters).toArray(function(err,result){
        callback(result);
    });
}
module.exports = {
    insertUser,
    getAllUsers,
    getUsername
};