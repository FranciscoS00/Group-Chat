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

function getMsgId(db,id ,callback){
    var filters = { };
    if(id !== undefined) filters.id = id;
    db.collection('mensagens').find(filters).toArray((err,result)=>{
        callback(result)
    });
}

function imagemConversa(db, imagem, callback){
    var filters = {};
    if(imagem !== undefined) filters.username = imagem;
    db.collection('users').find(filters).toArray(function(err, result){
        callback(result);
    });
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

function MensagemPertence(db,id,callback){
    var filters = { };

    if(id !== undefined) filters.pertence = id;
    db.collection('mensagens').find(filters).toArray(function(err,result){
        callback(result);
    });
}


module.exports = {
    getChat,
    getPendentes,
    removePendentes,
    colocarNoChat,
    pertenceConversa,
    MensagemPertence,
    imagemConversa,
    getMsgId
}