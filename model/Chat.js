var mongoConfigs = require('./mongoConfigs');

function getChat(db, chatname, callback){
    var filters = { };

    if(chatname !== undefined) filters.chatname = chatname;
    db.collection('chat').find(filters).toArray(function(err,result){
        callback(result);
    });
}

module.exports = {
    getChat
}