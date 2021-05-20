var mongoConfigs = require('./mongoConfigs');

function getUsername(db, username, callback){
    var filters = { };

    if(username !== undefined) filters.username = username;
    db.collection('users').find(filters).toArray(function(err,result){
        callback(result);
    });
}

module.exports = {
    getUsername
}