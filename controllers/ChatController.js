const User = require('../model/Chat');

function ChatTaken(db, req, callback){
    User.getChat(db, req.body.chatname, callback);
}

module.exports = {
    ChatTaken
};