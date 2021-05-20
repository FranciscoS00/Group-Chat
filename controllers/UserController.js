const User = require('../model/User');

function UsernameTaken(db, req, callback){
    User.getUsername(db, req.body.username, callback);
}

module.exports = {
    UsernameTaken
};