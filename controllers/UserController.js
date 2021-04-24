const User = require('../model/User');

function addUser(req,callback){
    User.insertUser(req.body.username,req.body.password,req.file,callback);
}

function getAllUsers(callback, username, password, image){
    User.getAllUsers(callback, username, password, image);
}

function UsernameTaken(req, callback){
    User.getUsername(req.body.username, callback);
}

module.exports = {
    addUser,
    getAllUsers,
    UsernameTaken
};