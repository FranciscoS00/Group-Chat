var mongoConfigs = require('./mongoConfigs');

function getChat(db, chatname, callback){
    var filters = { };

    if(chatname !== undefined) filters.nome = chatname;
    db.collection('chats').find(filters).toArray(function(err,result){
        callback(result);
    });
}

function getPendentes(db,username,callback){
    var filters = { };

    if(username !== undefined) filters.username = username;
    db.collection('pendentes').find(filters).toArray(function(err,result){
        callback(result);
    });
}

function pertenceConversa(db, username, callback){
    var filters = {};
    if(username !== undefined) filters.participante = username;
    db.collection('chats').find(filters).toArray(function(err, result){
        callback(result);
    });
}

function removePendentes(db,username,nome){
    if(username!==undefined && nome!==undefined) {
        db.collection('pendentes').remove({username: username, nome: nome});
    }
}

function colocarNoChat(db,username,nome){
    if(username!==undefined && nome!==undefined) {
        var filters = { };
        filters.nome = nome;
        db.collection('chats').find(filters).toArray(function(err,result){
            if(err) return console.error(err);
            db.collection('membrochats').insertOne({username: username, nome: nome, criador: result[0].criador});
        });

    }
}

module.exports = {
    getChat,
    getPendentes,
    removePendentes,
    colocarNoChat,
    pertenceConversa
}